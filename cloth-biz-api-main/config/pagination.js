const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function parsePositiveInteger(value, field) {
	if (typeof value !== "string" || !/^\d+$/.test(value)) {
		return { error: `${field} must be a positive integer` };
	}

	const parsed = Number(value);
	if (!Number.isSafeInteger(parsed) || parsed < 1) {
		return { error: `${field} must be a positive integer` };
	}

	return { value: parsed };
}

export function parsePagination(query) {
	let page = DEFAULT_PAGE;
	let limit = DEFAULT_LIMIT;

	if (query.page !== undefined) {
		const parsedPage = parsePositiveInteger(query.page, "page");
		if (parsedPage.error) return parsedPage;
		page = parsedPage.value;
	}

	if (query.limit !== undefined) {
		const parsedLimit = parsePositiveInteger(query.limit, "limit");
		if (parsedLimit.error) return parsedLimit;
		limit = Math.min(parsedLimit.value, MAX_LIMIT);
	}

	const skip = (page - 1) * limit;
	if (!Number.isSafeInteger(skip)) {
		return { error: "page is too large" };
	}

	return { page, limit, skip };
}
