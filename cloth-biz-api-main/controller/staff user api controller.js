import express from "express";
import mongoose from "mongoose";
import StaffProfile from "../model/usercred.js";
import { validateNewStaff, validateStaffLogin } from "../config/validation.js";
import bcrypt from "bcryptjs";
import generateToken from "../config/generateJWT.js";

export async function createNewStaff(req, resp) {
	try {
		const { error, value } = validateNewStaff(req.body);
		if (error) {
			return resp.status(400).json({
				success: false,
				message: error.details[0].message,
			});
		}

		if (req.managerBootstrap && value.staffRole !== "manager") {
			return resp.status(409).json({
				success: false,
				message: "The first staff account must be a manager",
			});
		}

		if (!req.managerBootstrap && value.staffRole === "manager") {
			return resp.status(409).json({
				success: false,
				message: "A manager account is already registered",
			});
		}

		const existingstaff = await StaffProfile.findOne({
			staffEmail: value.staffEmail,
		});

		if (existingstaff) {
			return resp.status(409).json({
				success: false,
				message: "Staff already registered",
			});
		}
		const hashedStaffPassword = await bcrypt.hash(value.staffPassword, 12);
		value.staffPassword = hashedStaffPassword;

		const { staffRole, ...staffDetails } = value;
		const staffregd = await StaffProfile.create({
			...staffDetails,
			role: staffRole,
		});
		const authToken = generateToken(
			staffregd._id,
			staffregd.staffEmail,
			staffregd.staffName,
			staffregd.role
		);
		return resp.status(201).json({
			success: true,
			data: {
				name: staffregd.staffName,
				email: staffregd.staffEmail,
				role: staffregd.role,
				authToken,
			},
		});
	} catch (error) {
		if (error.code === 11000) {
			return resp.status(409).json({
				success: false,
				message: error.keyPattern?.role
					? "A manager account is already registered"
					: "Staff member is already registered",
			});
		}
		console.error("Document couldn't be saved ", error.message);
		return resp.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
}

export async function loginStaff(req, resp) {
	try {
		const { error, value } = validateStaffLogin(req.body); //this line is for validating API request
		if (error) {
			return resp.status(400).json({
				success: false,
				message: error.details[0].message,
			});
		}

		const staff = await StaffProfile.findOne({
			staffEmail: value.staffEmail,
		}).select("+staffPassword");
		if (!staff) {
			return resp.status(401).json({
				success: false,
				message: "Invalid staff details",
			});
		}

		const staffMatch = await bcrypt.compare(
			value.staffPassword,
			staff.staffPassword,
		);
		if (!staffMatch) {
			return resp.status(401).json({
				success: false,
				message: "Invalid staff details",
			});
		}

		const authToken = generateToken(
			staff._id,
			staff.staffEmail,
			staff.staffName,
			staff.role
		);
		return resp.status(200).json({
			success: true,
			message: "Staff successful login",
			data: {
				name: staff.staffName,
				role: staff.role,
				authToken,
			},
		});
	} catch (error) {
		console.error("Error occured due to " + error.message);
		return resp.sendStatus(500)
	}
}
