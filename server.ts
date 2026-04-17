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

const log = (msg: string) => { console.log(`[${new Date().toISOString()}] ${msg}`); };
dotenv.config();

const app = express();
app.use(express.json());

// 1. DIRECTORY DETECTION
let _dirname = process.cwd();
try {
  // @ts-ignore
  _dirname = (typeof __dirname !== 'undefined') ? __dirname : path.dirname(fileURLToPath(import.meta.url));
} catch (e) {}

const isDist = _dirname.endsWith("dist") || _dirname.includes("/dist");
const rootDir = isDist ? path.resolve(_dirname, "..") : _dirname;
const publicDir = isDist ? _dirname : path.join(_dirname, "dist");

// 2. PRISMA SETUP
let prisma: PrismaClient | null = null;
const getPrisma = () => {
  if (!prisma) {
    try {
      prisma = new PrismaClient();
      prisma.$connect().catch(e => log(`DB Connect Error: ${e.message}`));
    } catch (e: any) { log(`DB Init Error: ${e.message}`); }
  }
  return prisma;
};

// 3. 🚨 EMERGENCY SETUP BYPASS 🚨
// Visit this URL to create your database tables: compcharity.com/api/system/force-setup
app.get("/api/system/force-setup", async (req, res) => {
  try {
    log(">>> STARTING DATABASE TABLES SETUP <<<");
    const prismaBin = path.join(process.cwd(), "node_modules", ".bin", "prisma");
    
    if (!fs.existsSync(prismaBin)) {
      throw new Error(`Prisma binary not found. Looking for: ${prismaBin}`);
    }

    const output = execSync(`${prismaBin} db push --accept-data-loss`, { encoding: "utf8" });
    log(">>> DB PUSH SUCCESSFUL <<<");
    
    // Seed Admin
    const db = getPrisma();
    if (db) {
      const adminEmail = 'admin@compcharity.org';
      const hashedPassword = await bcrypt.hash('adminpassword123', 10);
      await db.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: { email: adminEmail, password: hashedPassword, name: 'Admin', role: 'ADMIN' }
      });
      log(">>> ADMIN SEEDED <<<");
    }

    res.json({ success: true, message: "Tables created and admin seeded!", output });
  } catch (error: any) {
    log(`Setup Failed: ${error.message}`);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. SYSTEM CHECK
app.get("/api/system/check", async (req, res) => {
  const db = getPrisma();
  try {
    if (!db) throw new Error("Database not initialized");
    await db.$queryRaw`SELECT 1`;
    const count = await db.user.count();
    res.json({ status: "ok", database: "Connected", userCount: count });
  } catch (e: any) {
    res.json({ status: "error", message: e.message });
  }
});

// 5. PRODUCTION SERVING (Fixed 503)
if (process.env.NODE_ENV === "production" || isDist) {
  app.use(express.static(publicDir));
  app.get("*", (req, res, next) => {
    if (req.url.startsWith("/api")) return next();
    const indexPath = path.join(publicDir, "index.html");
    if (fs.existsSync(indexPath)) res.sendFile(indexPath);
    else res.status(404).send("Build missing. Run 'npm run build'.");
  });
}

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, "0.0.0.0", () => { log(`Server running on port ${PORT}`); });
