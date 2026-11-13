import mongoose from "mongoose";
const customerSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true, select: false },
  phoneNumber: { type: String, required: true, trim: true },
  role: { type: String, default: "customer", trim: true },
}, { timestamps: true });
export default mongoose.model("Customer", customerSchema);
