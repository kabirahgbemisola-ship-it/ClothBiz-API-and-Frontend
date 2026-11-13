import mongoose from "mongoose";
const staffroles = ["manager", "cashier", "marketer", "cleaner"];
const staffModelSchema = mongoose.Schema(
	{
		staffName: {
			type: String,
			required: [true, "Staff name has to be provided"],
			trim: true,
		},
		staffEmail: {
			type: String,
			required: [true, "Staff email has to be provided"],
			trim: true,
			lowercase: true,
			unique: true,
		},
		role: {
			type: String,
			required: [true, "Role of staff should be defined"],
			trim: true,
			enum: {
				values: staffroles,
				message: "Entered role is not recognized",
			},
		},
		staffPassword: {
			type: String,
			required: [true, "Password is required"],
			trim: true,
			minlength: [8, "Password should be at least 8 characters long"],
			select: false,
		},
	},
	{
		timestamp: true,
	},
);

staffModelSchema.index(
	{ role: 1 },
	{
		unique: true,
		partialFilterExpression: { role: "manager" },
		name: "one_manager_only",
	},
);

const StaffProfile = mongoose.model("staffprofile", staffModelSchema);
export default StaffProfile;
