import jwt from "jsonwebtoken";
import crypto from "node:crypto";

export function generateAccessToken(user) {
  return jwt.sign({ userDetails: { uid: user._id, uname: user.fullName, uemail: user.email, role: user.role } }, process.env.JWT_SECRET_KEY, { expiresIn: process.env.JWT_EXPIRY || "15m" });
}

export function generateRefreshToken() {
  return crypto.randomBytes(48).toString("hex");
}

export default function generateToken(userId, email, name, role = "customer") {

    console.log(
        "Token generation secret exists:",
        !!process.env.JWT_SECRET_KEY
    );

    return jwt.sign(
        {
            userDetails: {
                uid: userId,
                uname: name,
                uemail: email,
                role
            }
        },
        process.env.JWT_SECRET_KEY,
        { expiresIn: process.env.JWT_EXPIRY || "15m" }
    );
}
