import jwt from "jsonwebtoken";
import StaffProfile from "../model/usercred.js";

export async function authenticateStaff(req, res, next) {
	const authorization = req.headers.authorization;
	if (!authorization?.startsWith("Bearer ")) {
		return res.status(401).json({
			success: false,
			message: "Not authorized, no token provided",
		});
	}

	let decoded;
	try {
		console.log(
    	"Token verification secret exists:",
   	 	!!process.env.JWT_SECRET_KEY
);
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
		console.error("Unable to verify staff token", error.message);
		return res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}

	const staffId = decoded?.userDetails?.uid;
	if (!staffId) {
		return res.status(401).json({
			success: false,
			message: "Not authorized, invalid token",
		});
	}

	try {
		const staff = await StaffProfile.findById(staffId).select("-staffPassword");
		if (!staff) {
			return res.status(401).json({
				success: false,
				message: "Staff account no longer exists",
			});
		}

		req.staff = staff;
		return next();
	} catch (error) {
		console.error("Unable to authenticate staff", error.message);
		return res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
}

export function authorizeStaffRoles(...roles) {
	return (req, res, next) => {
		if (!req.staff) {
			return res.status(401).json({
				success: false,
				message: "Staff authentication required",
			});
		}

		if (!roles.includes(req.staff.role)) {
			return res.status(403).json({
				success: false,
				message: "Your role is not authorized to perform this operation",
			});
		}

		return next();
	};
}

export async function authorizeStaffRegistration(req, res, next) {
	try {
		const managerExists = await StaffProfile.exists({ role: "manager" });
		if (!managerExists) {
			req.managerBootstrap = true;
			return next();
		}

		return authenticateStaff(req, res, () =>
			authorizeStaffRoles("manager")(req, res, next),
		);
	} catch (error) {
		console.error("Unable to authorize staff registration", error.message);
		return res.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
}
