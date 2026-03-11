import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

const API = "http://localhost:5000/api/customers";

export function AuthProvider({ children }) {
  const [user,        setUser]        = useState(null);
  const [token,       setToken]       = useState(() => localStorage.getItem("marc_token"));
  const [authLoading, setAuthLoading] = useState(true);

  // Verify token on mount
  useEffect(() => {
    if (!token) { setAuthLoading(false); return; }

    fetch(`${API}/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setUser(data.customer);
        else              _clearToken();
      })
      .catch(_clearToken)
      .finally(() => setAuthLoading(false));
  }, []); // eslint-disable-line

  function _clearToken() {
    localStorage.removeItem("marc_token");
    setToken(null);
    setUser(null);
  }

  const login = (newToken, customer) => {
    localStorage.setItem("marc_token", newToken);
    setToken(newToken);
    setUser(customer);
  };

  const logout = () => _clearToken();

  return (
    <AuthContext.Provider value={{ user, token, authLoading, login, logout, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
