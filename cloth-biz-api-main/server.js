import express from "express";
import dbconnection from "./config/dbconnection.js";
import router from "./routes/apiroute.js";
import morgan from "morgan";
import * as dotenv from "dotenv"
import corsWhitelist from "./config/corsWhitelist.js";
import { loadConfig } from "./config/env.js";
import mongoose from "mongoose";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
dotenv.config()

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(morgan("dev"))
app.use(corsWhitelist);
app.use(express.json());
app.use("/Shop", express.static(path.join(__dirname, "..", "frontend", "dist")));

app.get("/", (req, resp) => {
  return resp.redirect("/Shop/");
});

app.use("/api", router);

app.get(/^\/Shop(?:\/.*)?$/, (req, res) => {
  const indexPath = path.join(__dirname, "..", "frontend", "dist", "index.html");
  if (fs.existsSync(indexPath)) {
    return res.sendFile(indexPath);
  }
  return res.status(200).send("ClothBiz API is live! Frontend is building or not built. Access API at /api/all");
});

let httpServer;
let shutdownPromise;
let shutdownRequested = false;
let startupPromise;

async function startServer() {
	const config = loadConfig();
	await dbconnection(config.mongoUri);
	if (shutdownRequested) return;

	httpServer = app.listen(config.port, () => {
		console.log(`server is running on http://localhost:${config.port}`);
	});
}

function shutdown(signal) {
	shutdownRequested = true;
	if (shutdownPromise) return shutdownPromise;

	shutdownPromise = (async () => {
		console.log(`Received ${signal}; shutting down gracefully`);
		if (startupPromise) await startupPromise;
		if (httpServer) {
			await new Promise((resolve, reject) => {
				httpServer.close((error) => (error ? reject(error) : resolve()));
			});
		}
		await mongoose.disconnect();
		console.log("HTTP server and database connection closed");
	})().catch((error) => {
		console.error("Graceful shutdown failed", error.message);
		process.exitCode = 1;
	});

	return shutdownPromise;
}

process.on("SIGINT", () => void shutdown("SIGINT"));
process.on("SIGTERM", () => void shutdown("SIGTERM"));

startupPromise = startServer().catch(async (error) => {
	console.error("Server startup failed", error.message);
	try {
		await mongoose.disconnect();
	} catch (disconnectError) {
		console.error("Database cleanup after startup failure failed", disconnectError.message);
	}
	process.exitCode = 1;
});
