import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    const saved = localStorage.getItem("marc_admin_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("marc_admin_token");
    if (token) {
      api.get("/auth/verify")
        .then((res) => setAdmin(res.data.admin))
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    const { token, admin } = res.data;
    localStorage.setItem("marc_admin_token", token);
    localStorage.setItem("marc_admin_user", JSON.stringify(admin));
    setAdmin(admin);
    return admin;
  };

  const logout = () => {
    localStorage.removeItem("marc_admin_token");
    localStorage.removeItem("marc_admin_user");
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
