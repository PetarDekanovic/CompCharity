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

dotenv.config();
const app = express();
app.use(express.json());

const log = (msg: string) => { console.log(`[${new Date().toISOString()}] ${msg}`); };
const JWT_SECRET = process.env.JWT_SECRET || "compcharity-secret-2026";

// 1. DIRECTORY DETECTION
let _dirname = process.cwd();
try {
  // @ts-ignore
  _dirname = (typeof __dirname !== 'undefined') ? __dirname : path.dirname(fileURLToPath(import.meta.url));
} catch (e) {}

const isDist = _dirname.endsWith("dist") || _dirname.includes("/dist");
const rootDir = isDist ? path.resolve(_dirname, "..") : _dirname;
const publicDir = isDist ? _dirname : path.join(_dirname, "dist");

// 2. PRISMA CLIENT
let prisma: PrismaClient | null = null;
const getPrisma = () => {
  if (!prisma) { prisma = new PrismaClient(); }
  return prisma;
};

// 3. MULTER SETUP (Image Uploads)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(rootDir, "uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const suffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + suffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// 4. AUTH MIDDLEWARES
const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) return res.status(401).json({ error: "Invalid token" });
    req.user = decoded;
    next();
  });
};

const isAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== "ADMIN") return res.status(403).json({ error: "Admin only" });
  next();
};

// 5. SYSTEM & SEEDING
app.get("/api/system/check", async (req, res) => {
  try {
    const db = getPrisma();
    await db.$queryRaw`SELECT 1`;
    const userCount = await db.user.count();
    
    // Auto-seed admin if missing
    if (userCount === 0) {
        const hashedPassword = await bcrypt.hash('adminpassword123', 10);
        await db.user.create({ data: { email: 'admin@compcharity.org', password: hashedPassword, name: 'Admin', role: 'ADMIN' }});
    }

    res.json({ status: "ok", database: "Connected", users: userCount });
  } catch (e: any) { res.json({ status: "error", message: e.message }); }
});

// 6. AUTH ROUTES
app.post("/api/auth/register", async (req, res) => {
  const { email, password, name } = req.body;
  const db = getPrisma();
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await db.user.create({ data: { email, password: hashedPassword, name, role: "USER" } });
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (e) { res.status(400).json({ error: "Email already taken" }); }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const db = getPrisma();
  try {
    const user = await db.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password!))) return res.status(401).json({ error: "Invalid credentials" });
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (e) { res.status(500).json({ error: "Login failed" }); }
});

// 7. SUBMISSIONS & CONTENT
app.post("/api/submissions", authenticate, upload.array("images", 5), async (req: any, res) => {
  const db = getPrisma();
  try {
    const ref = "CC-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    const sub = await db.submission.create({ data: { ...req.body, referenceNumber: ref, userId: req.user.id } });
    
    if (req.files) {
      await Promise.all(req.files.map((f: any) => db.submissionImage.create({ data: { submissionId: sub.id, url: `/uploads/${f.filename}` } })));
    }
    res.json(sub);
  } catch (e) { res.status(500).json({ error: "Form submission failed" }); }
});

app.get("/api/submissions/my", authenticate, async (req: any, res) => {
  const data = await getPrisma().submission.findMany({ where: { userId: req.user.id }, include: { images: true } });
  res.json(data);
});

app.get("/api/blog", async (req, res) => {
  const data = await getPrisma().blogPost.findMany({ where: { published: true } });
  res.json(data);
});

// Admin Proxies
app.get("/api/admin/submissions", authenticate, isAdmin, async (req, res) => {
  const data = await getPrisma().submission.findMany({ include: { images: true, user: true } });
  res.json(data);
});

// 8. PRODUCTION SERVING
app.use("/uploads", express.static(path.join(rootDir, "uploads")));
app.use(express.static(publicDir));
app.get("*", (req, res, next) => {
  if (req.url.startsWith("/api")) return next();
  const index = path.join(publicDir, "index.html");
  if (fs.existsSync(index)) res.sendFile(index);
  else res.status(404).send("Starting...");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => { log(`Server Live on Port ${PORT}`); });
