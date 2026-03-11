const API_BASE = "http://localhost:5000/api";
const SERVER_BASE = "http://localhost:5000";

export async function fetchProducts(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/products${query ? "?" + query : ""}`);
  const data = await res.json();
  return data.products || [];
}

export async function fetchProductById(id) {
  const res = await fetch(`${API_BASE}/products/${id}`);
  const data = await res.json();
  return data.product || null;
}

export async function fetchFeaturedProducts() {
  const res = await fetch(`${API_BASE}/products/featured`);
  const data = await res.json();
  return data.products || [];
}

export function getImageUrl(imageName) {
  if (!imageName) return null;
  return `${SERVER_BASE}/uploads/${imageName}`;
}
