import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Attach token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("marc_admin_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("marc_admin_token");
      localStorage.removeItem("marc_admin_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
