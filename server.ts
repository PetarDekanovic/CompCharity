import "dotenv/config";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import multer from "multer";
import fs from "fs";
import sharp from "sharp";
import { OAuth2Client } from "google-auth-library";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "compcharity-super-secret-key";

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

// Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
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

async function startServer() {
  const app = express();
  app.use(express.json());

  // Static files for uploads
  app.use("/uploads", express.static(path.join(__dirname, "uploads")));

  // Middleware: Auth
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

  // --- API Routes ---

  // Auth
  app.post("/api/auth/register", async (req, res) => {
    const { email, password, name } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { email, password: hashedPassword, name },
      });
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
      res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    } catch (error) {
      res.status(400).json({ error: "User already exists" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  });

  // Google OAuth
  app.get("/api/auth/google/url", (req, res) => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      console.error("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET");
      return res.status(500).json({ error: "Google OAuth is not configured on the server. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in Secrets." });
    }

    const host = req.headers["x-forwarded-host"] as string || req.get("host") || "";
    // Force https for all non-localhost environments (required by Google)
    const protocol = host.includes("localhost") ? "http" : "https";
    
    // Use dynamic host in preview/dev environments to keep OAuth flow in the same environment
    const isPreview = host.includes(".run.app") || host.includes("localhost");
    const baseUrl = (isPreview ? `${protocol}://${host}` : (process.env.APP_URL || `${protocol}://${host}`)).replace(/\/$/, "");
    const redirectUri = `${baseUrl}/api/auth/callback/google`;
    
    console.log("Generating Google Auth URL:", {
      host,
      protocol,
      isPreview,
      baseUrl,
      redirectUri,
      envAppUrl: process.env.APP_URL,
      forwardedHost: req.headers["x-forwarded-host"],
      forwardedProto: req.headers["x-forwarded-proto"]
    });

    const url = googleClient.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"],
      redirect_uri: redirectUri,
    });
    res.json({ url, redirectUri }); // Return redirectUri for debugging if needed
  });

  app.get("/api/auth/callback/google", async (req, res) => {
    const { code } = req.query;
    const host = req.headers["x-forwarded-host"] as string || req.get("host") || "";
    // Force https for all non-localhost environments (required by Google)
    const protocol = host.includes("localhost") ? "http" : "https";
    
    // Must match the logic in /api/auth/google/url exactly
    const isPreview = host.includes(".run.app") || host.includes("localhost");
    const baseUrl = (isPreview ? `${protocol}://${host}` : (process.env.APP_URL || `${protocol}://${host}`)).replace(/\/$/, "");
    const redirectUri = `${baseUrl}/api/auth/callback/google`;

    console.log("Handling Google Callback:", {
      host,
      protocol,
      isPreview,
      baseUrl,
      redirectUri
    });

    try {
      if (!code) {
        throw new Error("No code provided in callback");
      }

      const { tokens } = await googleClient.getToken({
        code: code as string,
        redirect_uri: redirectUri,
      });
      googleClient.setCredentials(tokens);

      const userInfoResponse = await googleClient.request({
        url: "https://www.googleapis.com/oauth2/v3/userinfo",
      });

      const { email, name, sub: googleId } = userInfoResponse.data as any;

      if (!email) {
        throw new Error("No email returned from Google");
      }

      let user = await prisma.user.findFirst({ 
        where: { 
          OR: [
            { googleId },
            { email }
          ]
        } 
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email,
            name: name || email.split('@')[0],
            googleId,
            role: "USER",
            password: await bcrypt.hash(Math.random().toString(36), 10), // Random password for OAuth users
          },
        });
      } else if (!user.googleId) {
        // Link existing email account to Google ID
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId }
        });
      }

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);

      res.send(`
        <html>
          <head>
            <title>Authentication Successful</title>
            <style>
              body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f9fafb; color: #111827; }
              .card { background: white; padding: 2rem; border-radius: 1rem; shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); text-align: center; }
            </style>
          </head>
          <body>
            <div class="card">
              <h2>Authentication Successful</h2>
              <p>Closing window and redirecting...</p>
            </div>
            <script>
              if (window.opener) {
                window.opener.postMessage({ 
                  type: 'OAUTH_AUTH_SUCCESS',
                  token: '${token}',
                  user: ${JSON.stringify({ id: user.id, email: user.email, name: user.name, role: user.role })}
                }, '*');
                window.close();
              } else {
                window.location.href = '${process.env.APP_URL || "/dashboard"}';
              }
            </script>
          </body>
        </html>
      `);
    } catch (error: any) {
      console.error("Google OAuth Error Details:", {
        message: error.message,
        response: error.response?.data,
        stack: error.stack
      });
      res.status(500).send(`
        <html>
          <head><title>Authentication Failed</title></head>
          <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #fff1f2; color: #991b1b;">
            <div style="background: white; padding: 2rem; border-radius: 1rem; border: 1px solid #fecaca; text-align: center; max-width: 400px;">
              <h2 style="margin-top: 0;">Authentication Failed</h2>
              <p>We encountered an error while signing you in with Google.</p>
              <p style="font-size: 0.875rem; color: #ef4444; background: #fef2f2; padding: 0.5rem; border-radius: 0.5rem; word-break: break-all;">
                ${error.message || "Unknown error"}
              </p>
              <button onclick="window.close()" style="margin-top: 1rem; padding: 0.5rem 1rem; background: #ef4444; color: white; border: none; border-radius: 0.5rem; cursor: pointer;">Close Window</button>
            </div>
          </body>
        </html>
      `);
    }
  });

  // Submissions
  app.post("/api/submissions", upload.array("images", 5), async (req: any, res) => {
    const { fullName, email, phone, location, type, category, brand, model, estimatedAge, condition, description, accessories, preferredOutcome, collectionPreference } = req.body;
    const userId = req.user?.id; // Optional if guest

    try {
      const referenceNumber = "CC-" + Math.random().toString(36).substring(2, 8).toUpperCase();
      const submission = await prisma.submission.create({
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
          prisma.submissionImage.create({
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
      console.error(error);
      res.status(500).json({ error: "Failed to create submission" });
    }
  });

  app.get("/api/submissions/my", authenticate, async (req: any, res) => {
    const submissions = await prisma.submission.findMany({
      where: { userId: req.user.id },
      include: { images: true, notes: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(submissions);
  });

  // Blog
  app.get("/api/blog", async (req, res) => {
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      include: { category: true, author: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(posts);
  });

  app.get("/api/blog/:slug", async (req, res) => {
    const post = await prisma.blogPost.findUnique({
      where: { slug: req.params.slug },
      include: { category: true, author: { select: { name: true } } },
    });
    if (!post) return res.status(404).json({ error: "Post not found" });
    res.json(post);
  });

  // Admin Routes
  app.get("/api/admin/submissions", authenticate, isAdmin, async (req, res) => {
    const submissions = await prisma.submission.findMany({
      include: { images: true, notes: true, user: { select: { email: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(submissions);
  });

  app.patch("/api/admin/submissions/:id/status", authenticate, isAdmin, async (req, res) => {
    const { status, note } = req.body;
    const submission = await prisma.submission.update({
      where: { id: req.params.id },
      data: { status },
    });
    if (note) {
      await prisma.submissionNote.create({
        data: { submissionId: submission.id, content: note, isAdminOnly: false },
      });
    }
    res.json(submission);
  });

  app.get("/api/admin/users", authenticate, isAdmin, async (req, res) => {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(users);
  });

  app.get("/api/admin/enquiries", authenticate, isAdmin, async (req, res) => {
    const enquiries = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(enquiries);
  });

  app.patch("/api/admin/enquiries/:id/status", authenticate, isAdmin, async (req, res) => {
    const { status } = req.body;
    const enquiry = await prisma.contactMessage.update({
      where: { id: req.params.id },
      data: { status },
    });
    res.json(enquiry);
  });

  app.get("/api/admin/blog", authenticate, isAdmin, async (req, res) => {
    const posts = await prisma.blogPost.findMany({
      include: { category: true, author: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(posts);
  });

  app.post("/api/admin/blog", authenticate, isAdmin, async (req: any, res) => {
    const { title, slug, content, excerpt, featuredImage, published, categoryId } = req.body;
    const post = await prisma.blogPost.create({
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
    const { title, slug, content, excerpt, featuredImage, published, categoryId } = req.body;
    const post = await prisma.blogPost.update({
      where: { id: req.params.id },
      data: { title, slug, content, excerpt, featuredImage, published, categoryId },
    });
    res.json(post);
  });

  app.delete("/api/admin/blog/:id", authenticate, isAdmin, async (req, res) => {
    await prisma.blogPost.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  });

  app.get("/api/admin/faq", authenticate, isAdmin, async (req, res) => {
    const faqs = await prisma.fAQItem.findMany({ orderBy: { order: "asc" } });
    res.json(faqs);
  });

  app.post("/api/admin/faq", authenticate, isAdmin, async (req, res) => {
    const { question, answer, order } = req.body;
    const faq = await prisma.fAQItem.create({
      data: { question, answer, order: order || 0 },
    });
    res.json(faq);
  });

  app.patch("/api/admin/faq/:id", authenticate, isAdmin, async (req, res) => {
    const { question, answer, order } = req.body;
    const faq = await prisma.fAQItem.update({
      where: { id: req.params.id },
      data: { question, answer, order },
    });
    res.json(faq);
  });

  app.delete("/api/admin/faq/:id", authenticate, isAdmin, async (req, res) => {
    await prisma.fAQItem.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  });

  app.get("/api/admin/testimonials", authenticate, isAdmin, async (req, res) => {
    const testimonials = await prisma.testimonial.findMany({ orderBy: { createdAt: "desc" } });
    res.json(testimonials);
  });

  app.post("/api/admin/testimonials", authenticate, isAdmin, async (req, res) => {
    const { name, role, content, rating, image } = req.body;
    const testimonial = await prisma.testimonial.create({
      data: { name, role, content, rating: rating || 5, image },
    });
    res.json(testimonial);
  });

  app.patch("/api/admin/testimonials/:id", authenticate, isAdmin, async (req, res) => {
    const { name, role, content, rating, image } = req.body;
    const testimonial = await prisma.testimonial.update({
      where: { id: req.params.id },
      data: { name, role, content, rating, image },
    });
    res.json(testimonial);
  });

  app.delete("/api/admin/testimonials/:id", authenticate, isAdmin, async (req, res) => {
    await prisma.testimonial.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  });

  // FAQ
  app.get("/api/faq", async (req, res) => {
    const faqs = await prisma.fAQItem.findMany({ orderBy: { order: "asc" } });
    res.json(faqs);
  });

  // Contact
  app.post("/api/contact", async (req, res) => {
    const { name, email, phone, subject, message, type } = req.body;
    const contact = await prisma.contactMessage.create({
      data: { name, email, phone, subject, message, type },
    });
    res.json(contact);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
