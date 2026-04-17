// 🚨 EMERGENCY SETUP BYPASS 🚨
app.get("/api/system/force-setup", async (req, res) => {
  try {
    const log = (msg: string) => { console.log(`[${new Date().toISOString()}] ${msg}`); };
    log(">>> STARTING EMERGENCY DB PUSH <<<");
    
    // Find absolute path to prisma
    const path = require('path');
    const fs = require('fs');
    const { execSync } = require('child_process');
    const prismaBin = path.join(process.cwd(), "node_modules", ".bin", "prisma");
    
    if (!fs.existsSync(prismaBin)) {
      throw new Error("Prisma binary not found. Please ensure npm install finished.");
    }

    const output = execSync(`${prismaBin} db push --accept-data-loss`, { encoding: "utf8" });
    log(">>> DB PUSH SUCCESSFUL <<<");
    
    return res.json({ success: true, message: "Tables created!", output });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});
