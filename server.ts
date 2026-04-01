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

// --- EMERGENCY LOGGING (Direct to stdout) ---
const log = (msg: string) => {
  const entry = `[${new Date().toISOString()}] ${msg}\n`;
  process.stdout.write(entry);
  try {
    fs.appendFileSync(path.join(process.cwd(), "boot.log"), entry);
  } catch (e) {}
};

log(">>> NODE PROCESS INITIALIZING <<<");

// Initialize environment variables
dotenv.config();

// --- DIRECTORY DETECTION ---
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
const rootDir = isDist ? path.resolve(_dirname, "..") : _dirname;
const publicDir = isDist ? _dirname : path.join(_dirname, "dist");

log(`>>> DIR DIAGNOSTICS: DIRNAME=${_dirname}, ROOT=${rootDir}, PUBLIC=${publicDir}, IS_DIST=${isDist} <<<`);
log(`>>> ENV DIAGNOSTICS: DATABASE_URL=${process.env.DATABASE_URL ? "SET" : "MISSING"}, JWT_SECRET=${process.env.JWT_SECRET ? "SET" : "MISSING"}, NODE_ENV=${process.env.NODE_ENV} <<<`);

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const app = express();

// --- IMMEDIATE STARTUP ---
const server = app.listen(PORT, "0.0.0.0", () => {
  log(`>>> SERVER LISTENING ON PORT ${PORT} <<<`);
});

server.on("error", (err: any) => {
  log(`FATAL SERVER ERROR: ${err.message}`);
});

// --- LAZY SERVICES ---
let prisma: PrismaClient | null = null;
const getPrisma = () => {
  if (!prisma) {
    try {
      prisma = new PrismaClient();
      prisma.$connect().catch(e => log(`Prisma Connect Error: ${e.message}`));
    } catch (e: any) {
      log(`Prisma Init Error: ${e.message}`);
    }
  }
  return prisma;
};

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

const JWT_SECRET = process.env.JWT_SECRET || "compcharity-fallback-secret";

// --- MIDDLEWARE ---
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// --- MULTER SETUP ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(rootDir, "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, and WebP are allowed."));
    }
  },
});

// --- AUTH MIDDLEWARE ---
const authenticate = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) return res.status(401).json({ error: "Invalid token" });
    req.user = decoded;
    next();
  });
};

const isAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== "ADMIN") return res.status(403).json({ error: "Admin access required" });
  next();
};

// --- ROUTES ---

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    version: "1.1.4-unified",
    uptime: process.uptime(),
    env: process.env.NODE_ENV,
    dirname: _dirname,
    isDist
  });
});

// Static files for uploads
app.use("/uploads", express.static(path.join(rootDir, "uploads")));

// Auth
app.post("/api/auth/register", async (req, res) => {
  const { email, password, name } = req.body;
  const db = getPrisma();
  if (!db) return res.status(500).json({ error: "Database unavailable" });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await db.user.create({
      data: { email, password: hashedPassword, name, role: "USER" },
    });
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error) {
    res.status(400).json({ error: "User already exists" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  log(`Login attempt: ${email}`);
  
  const db = getPrisma();
  if (!db) return res.status(500).json({ error: "Database unavailable" });

  try {
    const user = await db.user.findUnique({ where: { email } });
    if (!user || !user.password) return res.status(401).json({ error: "Invalid credentials" });
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (error: any) {
    log(`Login Error: ${error.message}`);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Google OAuth
app.get("/api/auth/google/url", (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(500).json({ error: "Google OAuth is not configured." });
  }

  const host = req.headers["x-forwarded-host"] as string || req.get("host") || "";
  const protocol = host.includes("localhost") ? "http" : "https";
  const isPreview = host.includes(".run.app") || host.includes("localhost");
  const baseUrl = (isPreview ? `${protocol}://${host}` : (process.env.APP_URL || `${protocol}://${host}`)).replace(/\/$/, "");
  const redirectUri = `${baseUrl}/api/auth/callback/google`;
  
  const url = googleClient.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"],
    redirect_uri: redirectUri,
  });
  res.json({ url, redirectUri });
});

app.get("/api/auth/callback/google", async (req, res) => {
  const { code } = req.query;
  const host = req.headers["x-forwarded-host"] as string || req.get("host") || "";
  const protocol = host.includes("localhost") ? "http" : "https";
  const isPreview = host.includes(".run.app") || host.includes("localhost");
  const baseUrl = (isPreview ? `${protocol}://${host}` : (process.env.APP_URL || `${protocol}://${host}`)).replace(/\/$/, "");
  const redirectUri = `${baseUrl}/api/auth/callback/google`;

  const db = getPrisma();
  if (!db) return res.status(500).send("Database unavailable");

  try {
    if (!code) throw new Error("No code provided");

    const { tokens } = await googleClient.getToken({
      code: code as string,
      redirect_uri: redirectUri,
    });
    googleClient.setCredentials(tokens);

    const userInfoResponse = await googleClient.request({
      url: "https://www.googleapis.com/oauth2/v3/userinfo",
    });

    const { email, name, sub: googleId } = userInfoResponse.data as any;
    if (!email) throw new Error("No email returned");

    let user = await db.user.findFirst({ where: { OR: [{ googleId }, { email }] } });

    if (!user) {
      user = await db.user.create({
        data: {
          email,
          name: name || email.split('@')[0],
          googleId,
          role: "USER",
          password: await bcrypt.hash(Math.random().toString(36), 10),
        },
      });
    } else if (!user.googleId) {
      user = await db.user.update({ where: { id: user.id }, data: { googleId } });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);

    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ 
                type: 'OAUTH_AUTH_SUCCESS',
                token: '${token}',
                user: ${JSON.stringify({ id: user.id, email: user.email, name: user.name, role: user.role })}
              }, '*');
              window.close();
            } else {
              window.location.href = '/dashboard';
            }
          </script>
        </body>
      </html>
    `);
  } catch (error: any) {
    log(`Google OAuth Error: ${error.message}`);
    res.status(500).send(`Authentication Failed: ${error.message}`);
  }
});

// Submissions
app.post("/api/submissions", authenticate, upload.array("images", 5), async (req: any, res) => {
  const db = getPrisma();
  if (!db) return res.status(500).json({ error: "Database unavailable" });

  const { fullName, email, phone, location, type, category, brand, model, estimatedAge, condition, description, accessories, preferredOutcome, collectionPreference } = req.body;
  const userId = req.user?.id;

  try {
    const referenceNumber = "CC-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    const submission = await db.submission.create({
      data: {
        referenceNumber,
        userId,
        fullName,
        email,
        phone,
        location,
        type,
        category,
        brand,
        model,
        estimatedAge,
        condition,
        description,
        accessories,
        preferredOutcome,
        collectionPreference,
      },
    });

    if (req.files) {
      const imagePromises = req.files.map((file: any) =>
        db.submissionImage.create({
          data: {
            submissionId: submission.id,
            url: `/uploads/${file.filename}`,
          },
        })
      );
      await Promise.all(imagePromises);
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({ error: "Failed to create submission" });
  }
});

app.get("/api/submissions/my", authenticate, async (req: any, res) => {
  const db = getPrisma();
  if (!db) return res.status(500).json({ error: "Database unavailable" });

  try {
    const submissions = await db.submission.findMany({
      where: { userId: req.user.id },
      include: { images: true, notes: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
});

// Blog
app.get("/api/blog", async (req, res) => {
  const db = getPrisma();
  if (!db) return res.status(500).json({ error: "Database unavailable" });

  const posts = await db.blogPost.findMany({
    where: { published: true },
    include: { category: true, author: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(posts);
});

app.get("/api/blog/:slug", async (req, res) => {
  const db = getPrisma();
  if (!db) return res.status(500).json({ error: "Database unavailable" });

  const post = await db.blogPost.findUnique({
    where: { slug: req.params.slug },
    include: { category: true, author: { select: { name: true } } },
  });
  if (!post) return res.status(404).json({ error: "Post not found" });
  res.json(post);
});

// Admin Routes
app.get("/api/admin/submissions", authenticate, isAdmin, async (req, res) => {
  const db = getPrisma();
  if (!db) return res.status(500).json({ error: "Database unavailable" });

  const submissions = await db.submission.findMany({
    include: { images: true, notes: true, user: { select: { email: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(submissions);
});

app.patch("/api/admin/submissions/:id/status", authenticate, isAdmin, async (req, res) => {
  const db = getPrisma();
  if (!db) return res.status(500).json({ error: "Database unavailable" });

  const { status, note } = req.body;
  const submission = await db.submission.update({
    where: { id: req.params.id },
    data: { status },
  });
  if (note) {
    await db.submissionNote.create({
      data: { submissionId: submission.id, content: note, isAdminOnly: false },
    });
  }
  res.json(submission);
});

app.get("/api/admin/users", authenticate, isAdmin, async (req, res) => {
  const db = getPrisma();
  if (!db) return res.status(500).json({ error: "Database unavailable" });

  const users = await db.user.findMany({ orderBy: { createdAt: "desc" } });
  res.json(users);
});

app.get("/api/admin/enquiries", authenticate, isAdmin, async (req, res) => {
  const db = getPrisma();
  if (!db) return res.status(500).json({ error: "Database unavailable" });

  const enquiries = await db.contactMessage.findMany({ orderBy: { createdAt: "desc" } });
  res.json(enquiries);
});

app.patch("/api/admin/enquiries/:id/status", authenticate, isAdmin, async (req, res) => {
  const db = getPrisma();
  if (!db) return res.status(500).json({ error: "Database unavailable" });

  const { status } = req.body;
  const enquiry = await db.contactMessage.update({
    where: { id: req.params.id },
    data: { status },
  });
  res.json(enquiry);
});

app.get("/api/admin/blog", authenticate, isAdmin, async (req, res) => {
  const db = getPrisma();
  if (!db) return res.status(500).json({ error: "Database unavailable" });

  const posts = await db.blogPost.findMany({
    include: { category: true, author: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  res.json(posts);
});

app.post("/api/admin/blog", authenticate, isAdmin, async (req: any, res) => {
  const db = getPrisma();
  if (!db) return res.status(500).json({ error: "Database unavailable" });

  const { title, slug, content, excerpt, featuredImage, published, categoryId } = req.body;
  const post = await db.blogPost.create({
    data: {
      title,
      slug: slug || title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, ""),
      content,
      excerpt,
      featuredImage,
      published: published ?? true,
      authorId: req.user.id,
      categoryId,
    },
  });
  res.json(post);
});

app.patch("/api/admin/blog/:id", authenticate, isAdmin, async (req, res) => {
  const db = getPrisma();
  if (!db) return res.status(500).json({ error: "Database unavailable" });

  const { title, slug, content, excerpt, featuredImage, published, categoryId } = req.body;
  const post = await db.blogPost.update({
    where: { id: req.params.id },
    data: { title, slug, content, excerpt, featuredImage, published, categoryId },
  });
  res.json(post);
});

app.delete("/api/admin/blog/:id", authenticate, isAdmin, async (req, res) => {
  const db = getPrisma();
  if (!db) return res.status(500).json({ error: "Database unavailable" });

  await db.blogPost.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

app.get("/api/admin/faq", authenticate, isAdmin, async (req, res) => {
  const db = getPrisma();
  if (!db) return res.status(500).json({ error: "Database unavailable" });

  const faqs = await db.fAQItem.findMany({ orderBy: { order: "asc" } });
  res.json(faqs);
});

app.post("/api/admin/faq", authenticate, isAdmin, async (req, res) => {
  const db = getPrisma();
  if (!db) return res.status(500).json({ error: "Database unavailable" });

  const { question, answer, order } = req.body;
  const faq = await db.fAQItem.create({
    data: { question, answer, order: order || 0 },
  });
  res.json(faq);
});

app.patch("/api/admin/faq/:id", authenticate, isAdmin, async (req, res) => {
  const db = getPrisma();
  if (!db) return res.status(500).json({ error: "Database unavailable" });

  const { question, answer, order } = req.body;
  const faq = await db.fAQItem.update({
    where: { id: req.params.id },
    data: { question, answer, order },
  });
  res.json(faq);
});

app.delete("/api/admin/faq/:id", authenticate, isAdmin, async (req, res) => {
  const db = getPrisma();
  if (!db) return res.status(500).json({ error: "Database unavailable" });

  await db.fAQItem.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

app.get("/api/admin/testimonials", authenticate, isAdmin, async (req, res) => {
  const db = getPrisma();
  if (!db) return res.status(500).json({ error: "Database unavailable" });

  const testimonials = await db.testimonial.findMany({ orderBy: { createdAt: "desc" } });
  res.json(testimonials);
});

app.post("/api/admin/testimonials", authenticate, isAdmin, async (req, res) => {
  const db = getPrisma();
  if (!db) return res.status(500).json({ error: "Database unavailable" });

  const { name, role, content, rating, image } = req.body;
  const testimonial = await db.testimonial.create({
    data: { name, role, content, rating: rating || 5, image },
  });
  res.json(testimonial);
});

app.patch("/api/admin/testimonials/:id", authenticate, isAdmin, async (req, res) => {
  const db = getPrisma();
  if (!db) return res.status(500).json({ error: "Database unavailable" });

  const { name, role, content, rating, image } = req.body;
  const testimonial = await db.testimonial.update({
    where: { id: req.params.id },
    data: { name, role, content, rating, image },
  });
  res.json(testimonial);
});

app.delete("/api/admin/testimonials/:id", authenticate, isAdmin, async (req, res) => {
  const db = getPrisma();
  if (!db) return res.status(500).json({ error: "Database unavailable" });

  await db.testimonial.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

// FAQ
app.get("/api/faq", async (req, res) => {
  const db = getPrisma();
  if (!db) return res.status(500).json({ error: "Database unavailable" });

  const faqs = await db.fAQItem.findMany({ orderBy: { order: "asc" } });
  res.json(faqs);
});

// Contact
app.post("/api/contact", async (req, res) => {
  const db = getPrisma();
  if (!db) return res.status(500).json({ error: "Database unavailable" });

  const { name, email, phone, subject, message, type } = req.body;
  const contact = await db.contactMessage.create({
    data: { name, email, phone, subject, message, type },
  });
  res.json(contact);
});

// --- PRODUCTION SERVING ---
const isProduction = process.env.NODE_ENV === "production" || isDist;
log(`>>> MODE: ${isProduction ? "PROD" : "DEV"} <<<`);

if (isProduction) {
  log(`>>> SERVING STATIC FILES FROM ${publicDir} <<<`);
  app.use(express.static(publicDir));
  
  app.get("*", (req, res, next) => {
    if (req.url.startsWith("/api")) return next();
    const indexPath = path.join(publicDir, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send("Application build missing. Please run 'npm run build'.");
    }
  });
} else {
  log(">>> DEV MODE: STARTING VITE MIDDLEWARE <<<");
  import("vite").then(async ({ createServer: createViteServer }) => {
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      log(">>> VITE MIDDLEWARE ATTACHED <<<");
    } catch (e: any) {
      log(`Vite Init Error: ${e.message}`);
    }
  }).catch(e => log(`Vite Import Error: ${e.message}`));
}

// Heartbeat log
setInterval(() => {
  log(`>>> HEARTBEAT: Uptime ${Math.floor(process.uptime())}s <<<`);
}, 60000);

log(">>> SERVER STARTUP SEQUENCE COMPLETE <<<");
