import dns from "node:dns";
import tls from "node:tls";
import * as dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

try {
  dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
} catch (e) {
  // Ignore
}

async function getPublicIP() {
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const json = await res.json();
    return json.ip;
  } catch {
    return "Unavailable";
  }
}

async function testConnection() {
  const uri = process.env.MONGODB_URI;
  console.log("--------------------------------------------------");
  console.log("MongoDB Connection Diagnostic Tool");
  console.log("--------------------------------------------------");
  console.log("Configured MONGODB_URI:", uri ? uri.replace(/:([^@]+)@/, ":****@") : "NOT SET");
  
  const publicIP = await getPublicIP();
  console.log("Your Current Public IP Address:", publicIP);
  console.log("--------------------------------------------------");

  if (!uri) {
    console.error("ERROR: MONGODB_URI is not defined in .env");
    process.exit(1);
  }

  console.log("Attempting to connect...");
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    console.log("SUCCESS: Connected to database successfully!");
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log(`Collections found (${collections.length}):`);
    for (const col of collections) {
      const count = await db.collection(col.name).countDocuments();
      console.log(` - ${col.name}: ${count} document(s)`);
    }

    await mongoose.disconnect();
    console.log("--------------------------------------------------");
    console.log("All database tests passed!");
    process.exit(0);
  } catch (err) {
    console.error("\nFAILED TO CONNECT:");
    console.error("Error Message:", err.message);

    if (uri.includes("mongodb.net") || uri.includes("mongodb+srv")) {
      console.log("\n>>> MONGODB ATLAS TROUBLESHOOTING GUIDE <<<");
      console.log("1. Check IP Access List (Whitelist):");
      console.log(`   - Your current IP is: ${publicIP}`);
      console.log("   - Log in to https://cloud.mongodb.com");
      console.log("   - Go to 'Network Access' (under Security)");
      console.log("   - Click 'Add IP Address'");
      console.log("   - Choose 'Add Current IP Address' or add '0.0.0.0/0' (allow access from anywhere)");
      console.log("   - Click 'Confirm' and wait 1 minute for it to become active.");
      console.log("2. Check Database User & Password:");
      console.log("   - Go to 'Database Access' in Atlas");
      console.log("   - Ensure the username and password in MONGODB_URI match an active Atlas user.");
    }

    process.exit(1);
  }
}

testConnection();
