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

// Emergency Logging
const log = (msg: string) => { console.log(`[${new Date().toISOString()}] ${msg}`); };
dotenv.config();

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.use(express.json());

let prisma: PrismaClient | null = null;
const getPrisma = () => { if (!prisma) { prisma = new PrismaClient(); } return prisma; };

// 🚨 EMERGENCY SETUP BYPASS 🚨
// Visit this URL to create your database tables: compcharity.com/api/system/force-setup
app.get("/api/system/force-setup", async (req, res) => {
  try {
    log(">>> STARTING DATABASE TABLES SETUP <<<");
    const output = execSync("npx prisma db push --accept-data-loss", { encoding: "utf8" });
    const db = getPrisma();
    
    // Seed Admin after tables are created
    const adminEmail = 'admin@compcharity.org';
    const hashedPassword = await bcrypt.hash('adminpassword123', 10);
    await db.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: { email: adminEmail, password: hashedPassword, name: 'Admin', role: 'ADMIN' }
    });

    res.json({ success: true, message: "Tables created and admin seeded!", output });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// System Check
app.get("/api/system/check", async (req, res) => {
  const db = getPrisma();
  try {
    await db.$queryRaw`SELECT 1`;
    const count = await db.user.count();
    res.json({ status: "ok", database: "Connected", userCount: count });
  } catch (e: any) {
    res.json({ status: "error", message: e.message });
  }
});

app.listen(PORT, "0.0.0.0", () => { log(`Server on ${PORT}`); });
