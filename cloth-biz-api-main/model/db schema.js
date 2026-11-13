import mongoose from "mongoose";

const fabricSchema = mongoose.Schema({
	fabricname: {
		type: String,
		required: [true, "Fabric name must be provided"],
		trim: true,
	},
	typeMaterial: {
		type: String,
		required: [true, "Provide the type of material"],
		trim: true,
	},
	color: {
		type: String,
		required: [true, "provide the color of the fabric"],
		trim: true,
	},
	yard: {
		type: Number,
		required: true,
		min: [0, "quantity can't be negative"],
	},
	pricePerYard: {
		type: Number,
		required: true,
		min: 0,
	},
	isInStock: {
		type: Boolean,
		required: true,
	},
	tier: {
		type: String,
		enum: {
			values: ["quality", "premium"],
			message:
				"{VALUE} is not a valid fabric tier. Allowed values: quality, premium",
		},
		default: "quality",
		lowercase: true,
	},
});

const Fabric = mongoose.model("fabric", fabricSchema);

export default Fabric;
