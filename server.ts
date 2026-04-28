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

// --- EMERGENCY LOGGING (Direct to stdout) ---
const log = (msg: string) => {
  const entry = `[${new Date().toISOString()}] ${msg}`;
  console.log(entry);
  try {
    fs.appendFileSync(path.join(process.cwd(), "boot.log"), entry + "\n");
  } catch (e) {}
};

log(">>> NODE PROCESS INITIALIZING <<<");

// Initialize environment variables
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
// --- ENV DIAGNOSTICS ---
log(`>>> ENV DIAGNOSTICS: DATABASE_URL=${process.env.DATABASE_URL ? "SET" : "MISSING"}, JWT_SECRET=${process.env.JWT_SECRET ? "SET" : "MISSING"}, NODE_ENV=${process.env.NODE_ENV} <<<`);

if (!process.env.DATABASE_URL) {
  log("!!! CRITICAL: DATABASE_URL IS MISSING. DATABASE OPERATIONS WILL FAIL !!!");
}

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

            // Seed FAQs if none exist
            const faqCount = await prisma!.fAQItem.count();
            if (faqCount === 0) {
              log(">>> SEEDING INITIAL FAQS <<<");
              await prisma!.fAQItem.createMany({
                data: [
                  { question: "How many laptops end up in landfills in Ireland?", answer: "An estimated 150,000 laptops are discarded every year in Ireland. Many of these are still functional or could be easily refurbished.", order: 1 },
                  { question: "Who receives the refurbished devices?", answer: "We partner with schools and community centers to identify the 45,000+ students in Ireland who currently do not have access to a dedicated computer for their studies.", order: 2 },
                  { question: "Is my data safe when I donate a device?", answer: "Absolutely. We use industry-standard military-grade software to perform multiple-pass data overwrites on every storage device we receive. You will receive a certificate of data destruction.", order: 3 },
                  { question: "Do you accept broken or very old laptops?", answer: "Yes! Even if a device is beyond repair, we ensure that every component is recycled responsibly via certified e-waste partners, preventing hazardous materials from entering the environment.", order: 4 },
                  { question: "How can I support CompCharity besides donating tech?", answer: "You can purchase refurbished tech from our marketplace. Every purchase directly funds our logistics, warehousing, and the refurbishment of devices for students in need.", order: 5 },
                ]
              });
            }

            // Seed Learning Paths if none exist
            const pathCount = await prisma!.learningPath.count();
            if (pathCount === 0) {
              log(">>> SEEDING LEARNING PATHS <<<");
              await prisma!.learningPath.create({
                data: {
                  title: "React Development",
                  description: "Master the most popular frontend library and build dynamic UIs.",
                  icon: "Code",
                  quizzes: {
                    create: [
                      {
                        title: "React Foundations",
                        description: "Test your knowledge of JSX, components, and basic hooks.",
                        questions: [
                          {
                            question: "What is JSX?",
                            options: ["A style sheet", "A syntax extension for JavaScript", "A Java library", "A database engine"],
                            answerIndex: 1,
                            explanation: "JSX allows us to write HTML-like code within JavaScript."
                          },
                          {
                            question: "Which hook is used for state management in functional components?",
                            options: ["useEffect", "useContext", "useState", "useRef"],
                            answerIndex: 2,
                            explanation: "useState is the primary hook for adding local state to components."
                          }
                        ]
                      }
                    ]
                  }
                }
              });

              await prisma!.learningPath.create({
                data: {
                  title: "Web & App Design",
                  description: "Learn HTML, CSS, and modern web architecture.",
                  icon: "Globe",
                  quizzes: {
                    create: [
                      {
                        title: "Web Basics",
                        description: "The core concepts of the modern web.",
                        questions: [
                          {
                            question: "What does HTML stand for?",
                            options: ["Hyper Text Markup Language", "Home Tool Markup Language", "High Text Machine Language", "None of the above"],
                            answerIndex: 0
                          }
                        ]
                      }
                    ]
                  }
                }
              });

              await prisma!.learningPath.create({
                data: {
                  title: "Mobile Development",
                  description: "Build apps for iOS and Android.",
                  icon: "Smartphone",
                  quizzes: {
                    create: [
                      {
                        title: "Mobile App Concepts",
                        description: "Introduction to native and cross-platform apps.",
                        questions: [
                          {
                            question: "Which framework is used for cross-platform apps with React?",
                            options: ["React Mobile", "React Native", "React Flutter", "SwiftUI"],
                            answerIndex: 1,
                            explanation: "React Native allows building mobile apps using React and JavaScript."
                          }
                        ]
                      }
                    ]
                  }
                }
              });
            }

            // Seed Wise Quotes if none exist
            const quoteCount = await prisma!.wiseQuote.count();
            if (quoteCount === 0) {
              log(">>> SEEDING WISE QUOTES <<<");
              await prisma!.wiseQuote.createMany({
                data: [
                  { content: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "Motivation" },
                  { content: "Talk is cheap. Show me the code.", author: "Linus Torvalds", category: "Technology" },
                  { content: "Your device is a tool to change the world. Use it wisely.", author: "CompCharity", category: "Mission" },
                  { content: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs", category: "Leadership" },
                  { content: "Stay hungry, stay foolish.", author: "Steve Jobs", category: "Motivation" },
                  { content: "Knowledge is the power to change the world.", author: "Nelson Mandela", category: "Education" },
                  { content: "The best way to predict the future is to create it.", author: "Peter Drucker", category: "Vision" },
                  { content: "Code is like humor. When you have to explain it, it’s bad.", author: "Cory House", category: "Technology" },
                  { content: "Simplicity is the soul of efficiency.", author: "Austin Freeman", category: "Technology" },
                  { content: "First, solve the problem. Then, write the code.", author: "John Johnson", category: "Technology" },
                  { content: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.", author: "Martin Fowler", category: "Quality" },
                  { content: "The digital divide is not just about technology, it's about opportunity.", author: "CompCharity", category: "Mission" },
                  { content: "Every refurbished device is a bridge to someone's dream.", author: "CompCharity", category: "Mission" },
                  { content: "Work hard in silence, let your success be your noise.", author: "Frank Ocean", category: "Motivation" },
                  { content: "Don't let yesterday take up too much of today.", author: "Will Rogers", category: "Focus" },
                  { content: "Life begins at the end of your comfort zone.", author: "Neale Donald Walsch", category: "Growth" },
                  { content: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill", category: "Resilience" },
                  { content: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt", category: "Hope" },
                  { content: "Quality is not an act, it is a habit.", author: "Aristotle", category: "Excellence" },
                  { content: "Logic will get you from A to B. Imagination will take you everywhere.", author: "Albert Einstein", category: "Creativity" },
                  { content: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs", category: "Autonomy" }
                ]
              });
            }

            // Seed Blog Posts if none exist
            const blogCount = await prisma!.blogPost.count();
            if (blogCount === 0) {
              log(">>> SEEDING BLOG POSTS (LOGS) <<<");
              const admin = await prisma!.user.findUnique({ where: { email: "petar.dekanovic@gmail.com" } });
              if (admin) {
                await prisma!.blogPost.create({
                  data: {
                    title: "First Refurbishment Log",
                    slug: "first-refurbishment-log",
                    excerpt: "Watching this old MacBook come back to life is pure magic.",
                    content: "<p>We just finished our first batch of refurbishments for the month. This MacBook Pro from 2015 is still a beast!</p>",
                    featuredImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80",
                    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Example YouTube
                    published: true,
                    authorId: admin.id
                  }
                });

                await prisma!.blogPost.create({
                  data: {
                    title: "Tech Tip: TikTok Edition",
                    slug: "tech-tip-tiktok",
                    excerpt: "Quick hack for cleaning your laptop screen safely.",
                    content: "<p>Check out our latest quick tip on how to keep your gear fresh.</p>",
                    featuredImage: "https://images.unsplash.com/photo-1588702547919-26089e690924?auto=format&fit=crop&q=80",
                    videoUrl: "https://www.tiktok.com/@howtocomputer/video/7212345678901234567", // Fake TikTok for demo structure
                    published: true,
                    authorId: admin.id
                  }
                });
              }
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

// Initialize Prisma immediately
getPrisma();

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
const checkDbConnection = (req: any, res: any, next: any) => {
  if (!isDbHealthy) {
    return res.status(503).json({
      error: "Service unavailable",
      message: "The database is currently unreachable. Please try again in a few moments."
    });
  }
  next();
};

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
// Apply DB check to all /api routes except health and system check
app.use("/api", (req, res, next) => {
  if (req.path === "/health" || req.path === "/system/check") return next();
  checkDbConnection(req, res, next);
});

// 🚨 EMERGENCY SETUP BYPASS 🚨
// Visit this URL to create your database tables: compcharity.com/api/system/force-setup
app.get("/api/system/force-setup", async (req, res) => {
  try {
    log(">>> STARTING EMERGENCY DB PUSH <<<");
    const prismaBin = path.join(process.cwd(), "node_modules", ".bin", "prisma");
    
    // Check if binary exists
    if (!fs.existsSync(prismaBin)) {
      throw new Error(`Prisma binary not found at ${prismaBin}`);
    }

    const output = execSync(`${prismaBin} db push --accept-data-loss`, { encoding: "utf8" });
    log(">>> DB PUSH SUCCESSFUL <<<");
    
    const db = getPrisma();
    if (db) {
       // Seed admin
       const adminEmail = 'admin@compcharity.org';
       const hashedPassword = await bcrypt.hash('adminpassword123', 10);
       await db.user.upsert({
         where: { email: adminEmail },
         update: {},
         create: {
           email: adminEmail,
           password: hashedPassword,
           name: 'Admin',
           role: 'ADMIN'
         }
       });
       log(">>> ADMIN SEEDED <<<");
    }

    res.json({ success: true, message: "Tables created and admin seeded!", output });
  } catch (error: any) {
    log(`DB PUSH FAILED: ${error.message}`);
    res.status(500).json({ success: false, error: error.message, stderr: error.stderr });
  }
});

// System Check
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
      
      // Additional checks
      try {
        const userCount = await db.user.count();
        const admin = await db.user.findUnique({ where: { email: 'admin@compcharity.org' } });
        
        return res.json({
          status: "ok",
          timestamp: new Date().toISOString(),
          database: {
            status: dbStatus,
            error: null,
            urlSet: !!process.env.DATABASE_URL,
            isHealthy: isDbHealthy,
            userCount,
            adminExists: !!admin,
            adminRole: admin?.role
          },
          env: {
            NODE_ENV: process.env.NODE_ENV,
            JWT_SECRET_SET: !!process.env.JWT_SECRET
          }
        });
      } catch (tableErr: any) {
        dbStatus = "Table Check Failed";
        dbError = tableErr.message;
      }
    } catch (e: any) {
      dbStatus = "Connection Failed";
      dbError = e.message;
    }
  }

  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus,
      error: dbError,
      urlSet: !!process.env.DATABASE_URL
    },
    env: {
      NODE_ENV: process.env.NODE_ENV,
      JWT_SECRET_SET: !!process.env.JWT_SECRET
    }
  });
});

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
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone, address: user.address, city: user.city, county: user.county, eircode: user.eircode } });
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
    if (!user || !user.password) {
      log(`Login failed: User not found or no password for ${email}`);
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      log(`Login failed: Invalid password for ${email}`);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
    log(`Login success: ${email} (${user.role})`);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone, address: user.address, city: user.city, county: user.county, eircode: user.eircode } });
  } catch (error: any) {
    log(`CRITICAL LOGIN ERROR: ${error.message}\nStack: ${error.stack}`);
    res.status(500).json({ 
      error: "Internal server error", 
      details: error.message,
      stack: process.env.NODE_ENV === "production" ? undefined : error.stack
    });
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
                user: ${JSON.stringify({ id: user.id, email: user.email, name: user.name, role: user.role, phone: user.phone, address: user.address, city: user.city, county: user.county, eircode: user.eircode })}
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

  const { fullName, email, phone, location, type, category, brand, model, listingTitle, estimatedAge, condition, description, accessories, preferredOutcome, collectionPreference, collectionDate, estimatedPrice, youtubeUrl, address, city, eircode } = req.body;
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
        address,
        city,
        location,
        eircode,
        type,
        category,
        brand,
        model,
        listingTitle,
        estimatedAge,
        condition,
        description,
        accessories,
        preferredOutcome,
        collectionPreference,
        collectionDate: collectionDate ? new Date(collectionDate) : null,
        estimatedPrice: estimatedPrice ? parseFloat(estimatedPrice) : null,
        youtubeUrl,
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

// Marketplace API
app.get("/api/marketplace", async (req, res) => {
  const db = getPrisma();
  if (!db) return res.status(500).json({ error: "Database unavailable" });

  try {
    const items = await db.submission.findMany({
      where: {
        type: "RESALE",
        status: "APPROVED"
      },
      include: { images: true },
      orderBy: { createdAt: "desc" }
    });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch marketplace items" });
  }
});

app.get("/api/marketplace/:id", async (req, res) => {
  const db = getPrisma();
  if (!db) return res.status(500).json({ error: "Database unavailable" });

  try {
    const item = await db.submission.findUnique({
      where: { id: req.params.id },
      include: { images: true }
    });
    
    if (!item || item.status !== "APPROVED" || item.type !== "RESALE") {
      return res.status(404).json({ error: "Item not found" });
    }
    
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch item details" });
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

app.patch("/api/admin/submissions/:id/details", authenticate, isAdmin, async (req, res) => {
  const db = getPrisma();
  if (!db) return res.status(500).json({ error: "Database unavailable" });

  const { id } = req.params;
  const { listingTitle, estimatedPrice } = req.body;

  try {
    const submission = await db.submission.update({
      where: { id },
      data: {
        listingTitle,
        estimatedPrice: estimatedPrice ? parseFloat(estimatedPrice) : null,
      },
    });
    res.json(submission);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
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

  const { title, slug, content, excerpt, featuredImage, videoUrl, published, categoryId } = req.body;
  const post = await db.blogPost.create({
    data: {
      title,
      slug: slug || title.toLowerCase().replace(/ /g, "-").replace(/[^\w-]+/g, ""),
      content,
      excerpt,
      featuredImage,
      videoUrl,
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

  const { title, slug, content, excerpt, featuredImage, videoUrl, published, categoryId } = req.body;
  const post = await db.blogPost.update({
    where: { id: req.params.id },
    data: { title, slug, content, excerpt, featuredImage, videoUrl, published, categoryId },
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

// Get current user profile
app.get("/api/users/profile", authenticate, async (req: any, res) => {
  const db = getPrisma();
  if (!db) return res.status(500).json({ error: "Database unavailable" });

  try {
    const user = await db.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, name: true, role: true, phone: true, address: true, city: true, county: true, eircode: true }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Update user profile
app.put("/api/users/profile", authenticate, async (req: any, res) => {
  const db = getPrisma();
  if (!db) return res.status(500).json({ error: "Database unavailable" });

  const { name, phone, address, city, county, eircode } = req.body;
  try {
    const user = await db.user.update({
      where: { id: req.user.id },
      data: { name, phone, address, city, county, eircode },
      select: { id: true, email: true, name: true, role: true, phone: true, address: true, city: true, county: true, eircode: true }
    });
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: "Failed to update profile" });
  }
});

// Diagnostics & Setup
app.get("/api/system/check", async (req, res) => {
  const db = getPrisma();
  res.json({
    db: !!db,
    isHealthy: isDbHealthy,
    env: process.env.NODE_ENV,
    time: new Date().toISOString()
  });
});

app.get("/api/system/force-setup", async (req, res) => {
  const db = getPrisma();
  if (!db) return res.status(500).json({ error: "Database unavailable" });
  
  try {
    // Check for admin
    const admin = await db.user.findUnique({ where: { email: "petar.dekanovic@gmail.com" } });
    if (!admin) {
      await db.user.create({
        data: {
          email: "petar.dekanovic@gmail.com",
          name: "Admin User",
          role: "ADMIN"
        }
      });
    }
    
    // Clear and reseeding quotes as requested for "all quotes"
    await db.wiseQuote.deleteMany({});
    await db.wiseQuote.createMany({
      data: [
        { content: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "Motivation" },
        { content: "Talk is cheap. Show me the code.", author: "Linus Torvalds", category: "Technology" },
        { content: "Your device is a tool to change the world. Use it wisely.", author: "CompCharity", category: "Mission" },
        { content: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs", category: "Leadership" },
        { content: "Stay hungry, stay foolish.", author: "Steve Jobs", category: "Motivation" },
        { content: "Knowledge is the power to change the world.", author: "Nelson Mandela", category: "Education" },
        { content: "The best way to predict the future is to create it.", author: "Peter Drucker", category: "Vision" },
        { content: "Code is like humor. When you have to explain it, it’s bad.", author: "Cory House", category: "Technology" },
        { content: "Simplicity is the soul of efficiency.", author: "Austin Freeman", category: "Technology" },
        { content: "First, solve the problem. Then, write the code.", author: "John Johnson", category: "Technology" },
        { content: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.", author: "Martin Fowler", category: "Quality" },
        { content: "The digital divide is not just about technology, it's about opportunity.", author: "CompCharity", category: "Mission" },
        { content: "Every refurbished device is a bridge to someone's dream.", author: "CompCharity", category: "Mission" },
        { content: "Work hard in silence, let your success be your noise.", author: "Frank Ocean", category: "Motivation" },
        { content: "Don't let yesterday take up too much of today.", author: "Will Rogers", category: "Focus" },
        { content: "Life begins at the end of your comfort zone.", author: "Neale Donald Walsch", category: "Growth" },
        { content: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill", category: "Resilience" },
        { content: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt", category: "Hope" },
        { content: "Quality is not an act, it is a habit.", author: "Aristotle", category: "Excellence" },
        { content: "Logic will get you from A to B. Imagination will take you everywhere.", author: "Albert Einstein", category: "Creativity" },
        { content: "Your time is limited, so don't waste it living someone else's life.", author: "Steve Jobs", category: "Autonomy" }
      ]
    });

    res.json({ success: true, message: "System setup forced and quotes re-seeded." });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
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

// Learning & Quizzes
app.get("/api/learning/paths", async (req, res) => {
  const db = getPrisma();
  if (!db) return res.status(500).json({ error: "Database unavailable" });
  const paths = await db.learningPath.findMany({
    include: { quizzes: true },
    orderBy: { createdAt: "asc" }
  });
  res.json(paths);
});

app.get("/api/learning/quotes", async (req, res) => {
  const db = getPrisma();
  if (!db) return res.status(500).json({ error: "Database unavailable" });
  const quotes = await db.wiseQuote.findMany({
    orderBy: { createdAt: "desc" }
  });
  res.json(quotes);
});

app.get("/api/learning/quizzes/:id", async (req, res) => {
  const db = getPrisma();
  if (!db) return res.status(500).json({ error: "Database unavailable" });
  const quiz = await db.quiz.findUnique({
    where: { id: req.params.id },
    include: { learningPath: true }
  });
  res.json(quiz);
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
