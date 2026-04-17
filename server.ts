// [ignoring loop detection]
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import multer from "multer";
import { OAuth2Client } from "google-auth-library";
import { execSync } from "child_process";

// --- EMERGENCY LOGGING ---
const log = (msg: string) => {
  const entry = `[${new Date().toISOString()}] ${msg}`;
  console.log(entry);
  try {
    fs.appendFileSync(path.join(process.cwd(), "boot.log"), entry + "\n");
  } catch (e) {}
};

log(">>> NODE PROCESS INITIALIZING <<<");
dotenv.config();

// --- DIRECTORY DETECTION ---
let rootDir: string;
try {
  // @ts-ignore
  if (typeof __dirname !== 'undefined') {
    // @ts-ignore
    rootDir = path.resolve(__dirname, "..");
  } else {
    // @ts-ignore
    rootDir = path.dirname(fileURLToPath(import.meta.url));
    if (rootDir.endsWith("dist") || rootDir.includes("/dist")) {
      rootDir = path.resolve(rootDir, "..");
    }
  }
} catch (e) {
  rootDir = process.cwd();
}

let _dirname: string;
try {
  // @ts-ignore
  if (typeof __dirname !== 'undefined') {
    // @ts-ignore
    _dirname = __dirname;
  } else {
    // @ts-ignore
    _dirname = path.dirname(fileURLToPath(import.meta.url));
  }
} catch (e) {
  _dirname = process.cwd();
}

const isDist = _dirname.endsWith("dist") || _dirname.includes("/dist");
const publicDir = isDist ? _dirname : path.join(_dirname, "dist");

log(`>>> DIR DIAGNOSTICS: DIRNAME=${_dirname}, ROOT=${rootDir}, PUBLIC=${publicDir}, IS_DIST=${isDist} <<<`);

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const app = express();
const server = app.listen(PORT, "0.0.0.0", () => {
  log(`>>> SERVER LISTENING ON PORT ${PORT} <<<`);
});

// --- PRISMA & HEALTH ---
let prisma: PrismaClient | null = null;
let isDbHealthy = false;

const getPrisma = () => {
  if (!prisma) {
    try {
      prisma = new PrismaClient();
      prisma.$connect()
        .then(async () => {
          log(">>> DATABASE CONNECTED SUCCESSFULLY <<<");
          isDbHealthy = true;
          // Auto-seed admin
          try {
            const adminEmail = 'admin@compcharity.org';
            const existing = await prisma!.user.findUnique({ where: { email: adminEmail } });
            if (!existing) {
              log(">>> SEEDING ADMIN USER <<<");
              const hashedPassword = await bcrypt.hash('adminpassword123', 10);
              await prisma!.user.create({
                data: {
                  email: adminEmail,
                  password: hashedPassword,
                  name: 'Admin',
                  role: 'ADMIN'
                }
              });
              log(">>> ADMIN USER SEEDED <<<");
            }
          } catch (seedErr: any) {
            log(`Seed Error: ${seedErr.message}`);
          }
        })
        .catch(e => {
          log(`Prisma Connect Error: ${e.message}`);
          isDbHealthy = false;
        });
    } catch (e: any) {
      log(`Prisma Init Error: ${e.message}`);
      isDbHealthy = false;
    }
  }
  return prisma;
};

// ... (Rest of your middleware and routes) ...
// Apply DB check to all /api routes except health and system check
const checkDbConnection = (req: any, res: any, next: any) => {
  if (!isDbHealthy) {
    return res.status(503).json({
      error: "Service unavailable",
      message: "The database is currently unreachable. Please try again in a few moments."
    });
  }
  next();
};

app.use(express.json());
app.use("/api", (req, res, next) => {
  if (req.path === "/health" || req.path === "/system/check") return next();
  checkDbConnection(req, res, next);
});

// (System check route should use the simplified version I wrote earlier)
app.get("/api/system/check", async (req, res) => {
  const db = getPrisma();
  let dbStatus = "Checking...";
  let dbError = null;

  if (!db) {
    dbStatus = "Prisma Client failed to initialize";
  } else {
    try {
      await db.$queryRaw`SELECT 1`;
      dbStatus = "Connected";
      const userCount = await db.user.count();
      const admin = await db.user.findUnique({ where: { email: 'admin@compcharity.org' } });
      return res.json({
        status: "ok",
        database: { status: dbStatus, isHealthy: isDbHealthy, userCount, adminExists: !!admin }
      });
    } catch (e: any) {
      dbStatus = "Connection Failed";
      dbError = e.message;
    }
  }
  res.json({ status: "ok", database: { status: dbStatus, error: dbError } });
});

// Add your other routes here...
// [Truncated for length - please copy your full routes from the AI Studio editor]
