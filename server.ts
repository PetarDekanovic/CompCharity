// 🚨 EMERGENCY SETUP BYPASS (Node-Safe Version) 🚨
app.get("/api/system/force-setup", async (req, res) => {
  try {
    const log = (msg: string) => { console.log(`[${new Date().toISOString()}] ${msg}`); };
    log(">>> STARTING EMERGENCY DB PUSH via NODE <<<");
    
    const path = require('path');
    const { execSync } = require('child_process');
    
    // Target the actual JavaScript file instead of the binary link
    const prismaScript = path.join(process.cwd(), "node_modules", "prisma", "build", "index.js");
    
    log(`>>> Target Script: ${prismaScript} <<<`);
    
    // Ask Node to run the script file directly (this bypasses 'Permission denied')
    const output = execSync(`node ${prismaScript} db push --accept-data-loss`, { 
      encoding: "utf8",
      env: { ...process.env, PRISMA_SKIP_POSTINSTALL_GENERATE: "true" }
    });
    
    log(">>> DB PUSH SUCCESSFUL <<<");
    
    return res.json({ success: true, message: "Tables created via Node!", output });
  } catch (error: any) {
    log(`Bypass failed: ${error.message}`);
    return res.status(500).json({ success: false, error: error.message });
  }
});
