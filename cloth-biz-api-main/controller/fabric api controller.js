import Fabric from "../model/db schema.js";
import { validateNewFabric, validateUpdate } from "../config/validation.js";
import { parsePagination } from "../config/pagination.js";
import mongoose from "mongoose";

export async function newFabric(req, resp) {
	try {
		const { error, value } = validateNewFabric(req.body);
		console.log(value)
		if (error) {
			return resp.status(400).json({
				success: false,
				message: error.details[0].message,
			});
		}

		
		const existingfabric = await Fabric.findOne({
			fabricname: value.fabricname,
			typeMaterial: value.typeMaterial,
			color: value.color,
		});

		if (existingfabric) {
			return resp.status(409).json({
				success: false,
				message: "Fabric with that name already exists",
			});
		}

		const fabricEntered = await Fabric.create(value);
		return resp.status(201).json({
			success: true,
			data: fabricEntered,
		});
	} catch (error) {
		console.error("Document couldn't be saved ", error.message);
		return resp.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
}

function addSearchFilters(req, baseFilter = {}) {
  const filter = { ...baseFilter };
  const { search, name, material, color, tier, minPrice, maxPrice, inStock, stock } = req.query;
  const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const makeRegex = (value) => new RegExp(escapeRegex(String(value).trim()), "i");
  if (search && String(search).trim()) {
    const regex = makeRegex(search);
    filter.$or = [{ fabricname: regex }, { typeMaterial: regex }, { color: regex }];
  }
  if (name) filter.fabricname = makeRegex(name);
  if (material) filter.typeMaterial = makeRegex(material);
  if (color) filter.color = makeRegex(color);
  if (tier) {
    const normalized = String(tier).toLowerCase();
    if (!["quality", "premium"].includes(normalized)) return { error: "tier must be quality or premium" };
    if (baseFilter.tier && normalized !== baseFilter.tier) return { error: `This endpoint only returns ${baseFilter.tier} fabrics` };
    filter.tier = normalized;
  }
  if (minPrice !== undefined || maxPrice !== undefined) {
    const min = minPrice === undefined ? 0 : Number(minPrice);
    const max = maxPrice === undefined ? Infinity : Number(maxPrice);
    if (!Number.isFinite(min) || min < 0 || (maxPrice !== undefined && (!Number.isFinite(max) || max < 0)) || min > max) return { error: "Provide a valid price range using minPrice and maxPrice" };
    filter.pricePerYard = { ...(minPrice !== undefined ? { $gte: min } : {}), ...(maxPrice !== undefined ? { $lte: max } : {}) };
  }
  const stockValue = inStock ?? stock;
  if (stockValue !== undefined) {
    if (!["true", "false"].includes(String(stockValue).toLowerCase())) return { error: "inStock must be true or false" };
    filter.isInStock = String(stockValue).toLowerCase() === "true";
  }
  return { filter };
}

async function sendFabrics(req, resp, baseFilter, label) {
  const filtered = addSearchFilters(req, baseFilter);
  if (filtered.error) return resp.status(400).json({ success: false, message: filtered.error });
  const filter = filtered.filter;
	const pagination = parsePagination(req.query);
	if (pagination.error) {
		return resp.status(400).json({
			success: false,
			message: pagination.error,
		});
	}

	try {
		const [fabrics, total] = await Promise.all([
			Fabric.find(filter)
				.sort({ createdAt: -1, _id: -1 })
				.skip(pagination.skip)
				.limit(pagination.limit),
			Fabric.countDocuments(filter),
		]);

		return resp.status(200).json({
			success: true,
			count: fabrics.length,
			data: fabrics,
			pagination: {
				page: pagination.page,
				limit: pagination.limit,
				total,
				totalPages: Math.ceil(total / pagination.limit),
			},
		});
	} catch (error) {
		console.error(`Unable to fetch ${label} fabrics`, error.message);
		return resp.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
}

export async function fetchFabric(req, resp) {
	const filter = req.customer ? {} : { tier: "quality" };
	return sendFabrics(req, resp, filter, "all");
}

export async function updatefabric(req, resp) {
	try {
		if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
			return resp.status(400).json({
				success: false,
				message: "Invalid fabric id",
			});
		}

		const { error, value } = validateUpdate(req.body);
		if (error) {
			return resp.status(400).json({
				success: false,
				message: error.details[0].message,
			});
		}

		const changefab = await Fabric.findById(req.params.id);
		if (!changefab) {
			return resp.status(404).json({
				success: false,
				message: "Fabric doesnt exist",
			});
		}
		const chngname = value.fabricname || changefab.fabricname;
		const chngmaterial = value.typeMaterial || changefab.typeMaterial;
		const chngcolor = value.color || changefab.color;

		const findDup = await Fabric.findOne({
			_id: { $ne: req.params.id },
			fabricname: chngname,
			typeMaterial: chngmaterial,
			color: chngcolor,
		});

		if (findDup) {
			return resp.status(409).json({
				success: false,
				message: "Another Fabric with that name already exists",
			});
		}

		const produpdate = await Fabric.findOneAndUpdate(
			{ _id: req.params.id },
			value,
			{
				new: true,
				runValidators: true,
			},
		);

		if (!produpdate) {
			return resp.status(404).json({
				success: false,
				message: "Fabric is not in inventory",
			});
		}

		return resp.status(200).json({
			success: true,
			data: produpdate,
		});
	} catch (err) {
		console.error("the error is ", err);
		return resp.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
}

export async function deleteFabric(req, resp) {
	try {
		if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
			return resp.status(400).json({
				success: false,
				message: "Invalid fabric id",
			});
		}

		const fabric = await Fabric.findByIdAndDelete(req.params.id);

		if (!fabric) {
			return resp.status(404).json({
				success: false,
				message: "Fabric doesn't exist",
			});
		}

		return resp.status(200).json({
			success: true,
			message: "Fabric successfully deleted",
			data: fabric,
		});
	} catch (error) {
		console.error("Document couldn't be deleted ", error.message);
		return resp.status(500).json({
			success: false,
			message: "Internal server error",
		});
	}
}

export async function avaliableFabric(req, resp) {
	const filter = req.customer
		? { isInStock: true }
		: { isInStock: true, tier: "quality" };
	return sendFabrics(req, resp, filter, "available");
}

export async function premiumFabric(req, resp) {
	return sendFabrics(req, resp, { tier: "premium" }, "premium");
}

export async function qualityFabric(req, resp) {
	return sendFabrics(req, resp, { tier: "quality" }, "quality");
}