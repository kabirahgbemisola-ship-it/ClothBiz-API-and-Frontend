import Joi from "joi";

const staffroles = ["manager", "cashier", "marketer", "cleaner"];

export function validateNewFabric(x) {
	const createnewschema = Joi.object({
		fabricname: Joi.string().trim().required().messages({
			"string.empty": "the fabric name is required",
		}),
		typeMaterial: Joi.string().trim().required().messages({
			"string.empty": "the type of fabric is required",
		}),
		color: Joi.string().trim().required().messages({
			"string.empty": "the color of fabric is required",
		}),
		tier: Joi.string()
			.valid("quality", "premium")
			.lowercase()
			.default("quality")
			.messages({
				"any.only":
					"{#value} is not a valid fabric tier. Allowed values: quality, premium",
			}),
		yard: Joi.number()
			.min(0)
			.required()
			.messages({ "yard.min": "the yard cant be a negative number" }),
		pricePerYard: Joi.number()
			.required()
			.messages({ pricePerYard: "the value must not be less than one" }),
		isInStock: Joi.bool()
			.required()
			.messages({ instock: "specify is avaliable or not" }),
	});

	return createnewschema.validate(x);
}

export function validateUpdate(x) {
	const updateinput = Joi.object({
		fabricname: Joi.string().trim(),
		typeMaterial: Joi.string().trim(),
		color: Joi.string().trim(),
		tier: Joi.string().valid("quality", "premium").lowercase().messages({
			"any.only":
				"{#value} is not a valid fabric tier. Allowed values: quality, premium",
		}),
		yard: Joi.number().min(0),
		pricePerYard: Joi.number().min(0),
		isInStock: Joi.bool(),
	});

	return updateinput.validate(x);
}

export function validateNewStaff(x) {
	const newStaffSchema = Joi.object({
		staffName: Joi.string().required().trim().messages({
			"string.empty": "Name of the staff is important",
			"any.required": "Tell us the name of the staff",
		}),
		staffEmail: Joi.string().required().trim().email().lowercase().messages({
			"string.empty": "Email of the staff is important",
			"any.required": "Provide the email of the staff",
		}),
		staffRole: Joi.valid(...staffroles)
			.required()
			.messages({
				"string.empty": " Role of staff should be provided",
				"any.only": `Role must be one of ${staffroles.join(", ")}`,
			}),
		staffPassword: Joi.string().required().min(8).messages({
			"string.empty": "provide the password",
		}),
	});

	return newStaffSchema.validate(x);
}

export function validateStaffLogin(params) {
	const staffLoginSchema = Joi.object({
		staffEmail: Joi.string().required().trim().email().lowercase().messages({
			"string.empty": "Email of the staff is important",
			"any.required": "Provide the email of the staff",
		}),
		staffPassword: Joi.string().required().min(8).messages({
			"string.empty": "provide the password",
		}),
	});
	return staffLoginSchema.validate(params);
}

export function validateNewCustomer(x) {
	const newCustomerSchema = Joi.object({
		fullName: Joi.string().required().trim().messages({
			"string.empty": "FullName is required",
			"any.required": "FullName is required",
		}),
		email: Joi.string().required().trim().email().lowercase().messages({
			"string.empty": "Email is required",
			"any.required": "Email is required",
		}),
		password: Joi.string().required().min(8).messages({
			"string.empty": "Password is required",
			"string.min": "Password must be at least 8 characters",
			"any.required": "Password is required",
		}),
		phoneNumber: Joi.alternatives().try(Joi.string().trim().min(7).max(20), Joi.number()).optional().allow("").default("N/A"),
	}).unknown(true);

	return newCustomerSchema.validate(x);
}

export function validateCustomerLogin(params) {
	const customerSchema = Joi.object({
		email: Joi.string().required().trim().email().lowercase().messages({
			"string.empty": "Provie your email",
			"any.required": "Provide the email of the staff",
		}),
		password: Joi.string().required().min(8).messages({
			"string.empty": "provide the password",
		}),
	});
	return customerSchema.validate(params);
}
