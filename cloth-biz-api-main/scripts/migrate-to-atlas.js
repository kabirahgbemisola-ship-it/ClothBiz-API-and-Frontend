import dns from "node:dns";
import * as dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

try {
  dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
} catch (e) {
  // Ignore
}

const LOCAL_URI = "mongodb://127.0.0.1:27017/clothbiz";
const TARGET_URI = process.env.MONGODB_URI;

async function migrate() {
  console.log("--------------------------------------------------");
  console.log("ClothBiz: Migrate Data to MongoDB Atlas");
  console.log("--------------------------------------------------");
  console.log("Source (Local):", LOCAL_URI);
  console.log("Destination (Atlas):", TARGET_URI ? TARGET_URI.replace(/:([^@]+)@/, ":****@") : "NOT SET");

  if (!TARGET_URI || TARGET_URI.includes("127.0.0.1") || TARGET_URI.includes("localhost")) {
    console.error("Please configure MONGODB_URI in .env to your MongoDB Atlas connection string before running migration.");
    process.exit(1);
  }

  console.log("\n1. Connecting to Local MongoDB...");
  const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
  console.log("Connected to Local MongoDB!");

  console.log("\n2. Connecting to MongoDB Atlas...");
  let atlasConn;
  try {
    atlasConn = await mongoose.createConnection(TARGET_URI, { serverSelectionTimeoutMS: 10000 }).asPromise();
    console.log("Connected to MongoDB Atlas!");
  } catch (err) {
    console.error("Failed to connect to MongoDB Atlas:", err.message);
    console.log("\nPlease make sure your IP address is whitelisted in Atlas Network Access before running migration.");
    await localConn.close();
    process.exit(1);
  }

  const collections = ["fabrics", "staffprofiles", "customers"];

  for (const colName of collections) {
    const srcCol = localConn.collection(colName);
    const destCol = atlasConn.collection(colName);

    const docs = await srcCol.find({}).toArray();
    console.log(`\nMigrating '${colName}' (${docs.length} documents)...`);

    if (docs.length === 0) {
      console.log(`No documents found in local '${colName}'. Skipping.`);
      continue;
    }

    let inserted = 0;
    for (const doc of docs) {
      try {
        await destCol.replaceOne({ _id: doc._id }, doc, { upsert: true });
        inserted++;
      } catch (insertErr) {
        console.warn(` - Warning inserting doc ${doc._id}: ${insertErr.message}`);
      }
    }
    console.log(`Successfully migrated ${inserted}/${docs.length} documents into '${colName}' on Atlas!`);
  }

  await localConn.close();
  await atlasConn.close();
  console.log("\n--------------------------------------------------");
  console.log("Migration completed successfully!");
  console.log("--------------------------------------------------");
  process.exit(0);
}

migrate().catch(err => {
  console.error("Migration error:", err);
  process.exit(1);
});
