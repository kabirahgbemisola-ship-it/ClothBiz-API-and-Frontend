
const API_BASE_URL =
  typeof window !== "undefined" && window.location.port === "3003"
    ? "/api"
    : "http://localhost:3003/api";

export function getItems(data) {
  const items =
    data?.data?.fabrics ??
    data?.data?.items ??
    data?.fabrics ??
    data?.items ??
    data?.data;
  return Array.isArray(items) ? items : [];
}

export async function apiRequest(endpoint, options = {}) {
  const token =
    typeof window !== "undefined" ? sessionStorage.getItem("accessToken") : null;

  const authHeader = token && !options.headers?.Authorization ? { Authorization: `Bearer ${token}` } : {};

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(!options.body || options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...authHeader,
      ...options.headers,
    },
  });

  let data;
  try {
    data = await response.json();
  } catch {
    data = { message: `Request failed with status ${response.status}` };
  }

  if (!response.ok) {
    throw new Error(
      data.message || `Request failed: ${response.status}`
    );
  }

  return data;
}
