const BASE = "http://localhost:5000/api/customers";

const req = async (path, options = {}) => {
  const { headers: extraHeaders, ...rest } = options;
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...extraHeaders },
    ...rest,
  });
  return res.json();
};

export const registerCustomer = (name, email, password) =>
  req("/register", { method: "POST", body: JSON.stringify({ name, email, password }) });

export const loginCustomer = (email, password) =>
  req("/login", { method: "POST", body: JSON.stringify({ email, password }) });

export const getMyOrders = (token) =>
  req("/orders", { headers: { Authorization: `Bearer ${token}` } });

export const placeOrder = (token, payload) =>
  req("/orders", {
    method:  "POST",
    headers: { Authorization: `Bearer ${token}` },
    body:    JSON.stringify(payload),
  });

export const uploadScreenshot = async (file) => {
  const formData = new FormData();
  formData.append("screenshot", file);
  const res = await fetch(`${BASE}/upload-screenshot`, {
    method: "POST",
    body:   formData,
  });
  return res.json();
};
