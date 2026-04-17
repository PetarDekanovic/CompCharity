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

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

// --- DATABASE & PRISMA ---
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
              const hashedPassword = await bcrypt.hash('adminpassword123', 10);
              await prisma!.user.create({
                data: { email: adminEmail, password: hashedPassword, name: 'Admin', role: 'ADMIN' }
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

// --- MIDDLEWARE ---
app.use(express.json());

const checkDbConnection = (req: any, res: any, next: any) => {
  if (!isDbHealthy && req.path.startsWith("/api") && !req.path.includes("/system/check")) {
    return res.status(503).json({
      error: "Service unavailable",
      message: "Database connecting..."
    });
  }
  next();
};

app.use(checkDbConnection);

// --- SERVICES ---
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
const JWT_SECRET = process.env.JWT_SECRET || "compcharity-fallback-secret";

// --- MULTER ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// --- AUTH HELPERS ---
const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });
  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) return res.status(401).json({ error: "Invalid token" });
    req.user = decoded;
    next();
  });
};

const isAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== "ADMIN") return res.status(403).json({ error: "Forbidden" });
  next();
};

// --- API ROUTES ---
app.get("/api/health", (req, res) => res.json({ status: "ok", uptime: process.uptime() }));

app.get("/api/system/check", async (req, res) => {
  const db = getPrisma();
  try {
    await db!.$queryRaw`SELECT 1`;
    const userCount = await db!.user.count();
    res.json({ status: "ok", database: { status: "Connected", isHealthy: isDbHealthy, userCount } });
  } catch (e: any) {
    res.json({ status: "error", database: { status: "Error", message: e.message } });
  }
});

// Auth Routes
app.post("/api/auth/register", async (req, res) => {
  const { email, password, name } = req.body;
  const db = getPrisma();
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await db!.user.create({ data: { email, password: hashedPassword, name, role: "USER" } });
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (e) { res.status(400).json({ error: "Exists" }); }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const db = getPrisma();
  try {
    const user = await db!.user.findUnique({ where: { email } });
    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ error: "Invalid" });
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (e) { res.status(500).json({ error: "Server error" }); }
});

// ... (Submissions, Blog, and Admin routes go here - please keep your existing code for those) ...
// NOTE: I am keeping this snippet short to avoid crashing the chat, 
// but ensure you keep all your submission and blog and admin routes!

// --- PRODUCTION SERVING ---
// This is the part that fixes "Cannot GET /"
const distPath = path.join(process.cwd(), "dist");
const uploadsPath = path.join(process.cwd(), "uploads");

app.use("/uploads", express.static(uploadsPath));

// Check if we are in dist or root
if (fs.existsSync(path.join(distPath, "index.html"))) {
    log(">>> SERVING FROM DIST DIRECTORY <<<");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
        if (req.path.startsWith("/api")) return res.status(404).json({ error: "API not found" });
        res.sendFile(path.join(distPath, "index.html"));
    });
} else {
    log(">>> DIST FOLDER NOT FOUND - CHECKING VITE DEV MODE <<<");
    // Fallback for development (only if not on Hostinger)
    if (process.env.NODE_ENV !== "production") {
        import("vite").then(async ({ createServer }) => {
            const vite = await createServer({ server: { middlewareMode: true }, appType: "spa" });
            app.use(vite.middlewares);
        });
    }
}

// --- START SERVER LAST ---
app.listen(PORT, "0.0.0.0", () => {
  log(`>>> SERVER READY ON PORT ${PORT} <<<`);
});
