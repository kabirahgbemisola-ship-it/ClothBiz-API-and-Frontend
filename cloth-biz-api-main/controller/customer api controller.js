import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { validateNewCustomer, validateCustomerLogin } from "../config/validation.js";
import { generateAccessToken, generateRefreshToken } from "../config/generateJWT.js";
import Customer from "../model/customer.js";
import RefreshToken from "../model/refreshToken.js";

const refreshDays = Math.max(1, Number(process.env.REFRESH_TOKEN_DAYS || 7));
const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");
async function issueTokens(customer) {
  const accessToken = generateAccessToken(customer);
  const refreshToken = generateRefreshToken();
  
  await RefreshToken.create({ customer: customer._id, tokenHash: hashToken(refreshToken), expiresAt: new Date(Date.now() + refreshDays * 86400000) });
  return { accessToken, refreshToken, tokenType: "Bearer", expiresIn: process.env.JWT_EXPIRY || "15m" };
}
function publicCustomer(customer) {
  return { id: customer._id, fullName: customer.fullName, email: customer.email, phoneNumber: customer.phoneNumber, role: customer.role };
}

export async function createNewCustomer(req, res) {
  try {
    const payload = { ...req.body };
    if (!payload.fullName && payload.name) {
      payload.fullName = payload.name;
    }
    const { error, value } = validateNewCustomer(payload);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });
    if (await Customer.findOne({ email: value.email })) return res.status(409).json({ success: false, message: "Customer already registered" });
    value.password = await bcrypt.hash(value.password, 12);
    const customer = await Customer.create({ ...value, role: "customer" });
    const tokens = await issueTokens(customer);
    return res.status(201).json({ success: true, message: "Customer registration successful", data: { customer: publicCustomer(customer), ...tokens } });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: "Email already registered" });
    console.error("Customer registration failed", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function loginCustomer(req, res) {
  try {
    const { error, value } = validateCustomerLogin(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });
    const customer = await Customer.findOne({ email: value.email }).select("+password");
    if (!customer || !customer.password || !(await bcrypt.compare(value.password, customer.password))) {
      return res.status(401).json({ success: false, message: "Invalid customer details" });
    }
    const tokens = await issueTokens(customer);
    return res.status(200).json({ success: true, message: "Customer login successful", data: { customer: publicCustomer(customer), ...tokens } });
  } catch (error) {
    console.error("Customer login failed", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function refreshCustomerToken(req, res) {
  try {
    const { refreshToken } = req.body;
    if (typeof refreshToken !== "string" || !refreshToken) return res.status(400).json({ success: false, message: "Refresh token is required" });
    const old = await RefreshToken.findOne({ tokenHash: hashToken(refreshToken), revokedAt: null, expiresAt: { $gt: new Date() } });
    if (!old) return res.status(401).json({ success: false, message: "Refresh token is invalid, expired, or already used. Please log in again." });
    const customer = await Customer.findById(old.customer);
    if (!customer) { await RefreshToken.updateOne({ _id: old._id }, { revokedAt: new Date() }); return res.status(401).json({ success: false, message: "Customer account no longer exists" }); }
    // Rotate refresh tokens: each token can be used only once.
    old.revokedAt = new Date(); await old.save();
    const tokens = await issueTokens(customer);
    return res.status(200).json({ success: true, data: { ...tokens } });
  } catch (error) {
    console.error("Token refresh failed", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function logoutCustomer(req, res) {
  try {
    const { refreshToken } = req.body;
    if (typeof refreshToken === "string" && refreshToken) await RefreshToken.updateOne({ tokenHash: hashToken(refreshToken), revokedAt: null }, { revokedAt: new Date() });
    return res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout failed", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function getCustomerProfile(req, res) {
  return res.status(200).json({ success: true, data: { customer: publicCustomer(req.customer) } });
}

export async function updateCustomerProfile(req, res) {
  try {
    const body = { ...req.body };
    if (body.name !== undefined && body.fullName === undefined) {
      body.fullName = body.name;
    }
    delete body.name;

    const allowed = ["fullName", "email", "phoneNumber"];
    const keys = Object.keys(body || {});
    if (!keys.length) return res.status(400).json({ success: false, message: "Provide at least one profile field to update" });
    const unexpected = keys.filter((key) => !allowed.includes(key));
    if (unexpected.length) return res.status(400).json({ success: false, message: `These fields cannot be updated here: ${unexpected.join(", ")}` });
    const updates = {};
    if (body.fullName !== undefined) {
      if (typeof body.fullName !== "string" || !body.fullName.trim()) return res.status(400).json({ success: false, message: "Full name must not be empty" });
      updates.fullName = body.fullName.trim();
    }
    if (body.email !== undefined) {
      if (typeof body.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email.trim())) return res.status(400).json({ success: false, message: "Provide a valid email address" });
      updates.email = body.email.trim().toLowerCase();
    }
    if (body.phoneNumber !== undefined) {
      const phone = String(body.phoneNumber).trim();
      if (!/^[+\d][\d\s()-]{6,19}$/.test(phone)) return res.status(400).json({ success: false, message: "Provide a valid phone number" });
      updates.phoneNumber = phone;
    }
    const updated = await Customer.findByIdAndUpdate(req.customer._id, updates, { returnDocument: "after", runValidators: true });
    return res.status(200).json({ success: true, message: "Profile updated successfully", data: { customer: publicCustomer(updated) } });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: "That email address is already in use" });
    console.error("Profile update failed", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export async function changeCustomerPassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Current password and new password are required" });
    }
    if (typeof newPassword !== "string" || newPassword.length < 8) {
      return res.status(400).json({ success: false, message: "New password must be at least 8 characters long" });
    }
    const customer = await Customer.findById(req.customer._id).select("+password");
    if (!customer || !customer.password || !(await bcrypt.compare(currentPassword, customer.password))) {
      return res.status(401).json({ success: false, message: "Current password is incorrect" });
    }
    customer.password = await bcrypt.hash(newPassword, 12);
    await customer.save();
    return res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Password change failed", error.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}
