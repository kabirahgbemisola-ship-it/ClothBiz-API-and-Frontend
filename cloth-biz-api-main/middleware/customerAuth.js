import jwt from "jsonwebtoken";
import Customer from "../model/customer.js";

async function loadCustomer(req, res, next, required) {
	const authorization = req.headers.authorization;
	if (!authorization) {
		if (required) {
			return res.status(401).json({
				success: false,
				message: "Not authorized, no token provided",
			});
		}
		return next();
	}

	if (!authorization.startsWith("Bearer ")) {
		return res.status(401).json({
			success: false,
			message: "Not authorized, invalid authorization header",
		});
	}

	let decoded;
	try {
		decoded = jwt.verify(
			authorization.slice("Bearer ".length),
			process.env.JWT_SECRET_KEY,
		);
	} catch (error) {
		if (error instanceof jwt.JsonWebTokenError) {
			return res.status(401).json({
				success: false,
				message: "Not authorized, token failed or expired",
			});
		}
		console.error("Unable to verify customer token", error.message);
		return res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}

	const customerId = decoded?.userDetails?.uid;
	if (!customerId) {
		return res.status(401).json({
			success: false,
			message: "Not authorized, invalid token",
		});
	}

	try {
		const customer = await Customer.findById(customerId).select("-password");
		if (!customer) {
			return res.status(401).json({
				success: false,
				message: "Customer account no longer exists",
			});
		}
		if (customer.role !== "customer") {
			return res.status(403).json({
				success: false,
				message: "A customer account is required to access this resource",
			});
		}

		req.customer = customer;
		return next();
	} catch (error) {
		console.error("Unable to authenticate customer", error.message);
		return res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
}

export function optionalCustomerAuth(req, res, next) {
	return loadCustomer(req, res, next, false);
}

export function authenticateCustomer(req, res, next) {
	return loadCustomer(req, res, next, true);
}
