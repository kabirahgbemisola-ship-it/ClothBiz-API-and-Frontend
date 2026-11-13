import dns from "node:dns";
import mongoose from "mongoose";
import StaffProfile from "../model/usercred.js";
import Customer from "../model/customer.js";
import RefreshToken from "../model/refreshToken.js";

// Ensure Node can resolve MongoDB SRV records on Windows / ISP networks
try {
	dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
} catch (e) {
	console.warn("Could not set custom DNS servers:", e.message);
}

async function dbconnection(uri) {
	try {
		await mongoose.connect(uri, {
			serverSelectionTimeoutMS: 15000,
		});
		console.log("database connected successfully");
	} catch (error) {
		if (uri.includes("mongodb+srv") || uri.includes("mongodb.net")) {
			console.error("\n================ MONGODB ATLAS CONNECTION ERROR ================");
			console.error("Failed to connect to MongoDB Atlas cluster.");
			console.error("Reason:", error.message);
			console.error("\nHow to fix in MongoDB Atlas:");
			console.error("1. Open MongoDB Atlas (https://cloud.mongodb.com/)");
			console.error("2. Under 'Security' in the left menu, select 'Network Access'");
			console.error("3. Click '+ Add IP Address'");
			console.error("4. Click 'Add Current IP Address' (or use 0.0.0.0/0 to allow all) and click 'Confirm'");
			console.error("5. Ensure database user credentials in MONGODB_URI are correct");
			console.error("=================================================================\n");
		}
		throw error;
	}

	// Synchronize indexes and drop any obsolete/stale indexes (e.g. old token_1 index on refreshtokens)
	try {
		await StaffProfile.init();
		await Customer.init();
		await RefreshToken.init();
		await RefreshToken.syncIndexes();
		await Customer.syncIndexes();
	} catch (idxError) {
		console.warn("Index synchronization warning:", idxError.message);
	}
}

export default dbconnection;