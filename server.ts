import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();
const app = express();
app.use(express.json());

// Simple logging
const log = (msg: string) => { console.log(`[${new Date().toISOString()}] ${msg}`); };

// Directory Detection
let _dirname = process.cwd();
try {
  // @ts-ignore
  _dirname = (typeof __dirname !== 'undefined') ? __dirname : path.dirname(fileURLToPath(import.meta.url));
} catch (e) {}

const isDist = _dirname.endsWith("dist") || _dirname.includes("/dist");
const publicDir = isDist ? _dirname : path.join(_dirname, "dist");

// Lazy Prisma (won't crash the site if DB fails)
let prisma: PrismaClient | null = null;
const getPrisma = () => {
  if (!prisma) { prisma = new PrismaClient(); }
  return prisma;
};

// Minimal API for now
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// System Check for tomorrow
app.get("/api/system/check", async (req, res) => {
  try {
    const db = getPrisma();
    await db.$queryRaw`SELECT 1`;
    res.json({ status: "ok", database: "Connected" });
  } catch (e: any) {
    res.json({ status: "error", message: e.message });
  }
});

// SERVE THE WEBSITE (This fixes the 503)
app.use(express.static(publicDir));
app.get("*", (req, res, next) => {
  if (req.url.startsWith("/api")) return next();
  const indexPath = path.join(publicDir, "index.html");
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send("Application is starting up...");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  log(`Website is now live on port ${PORT}`);
});
