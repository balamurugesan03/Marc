import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import loginImage from "../assets/loginimage.jpeg";

export default function Login() {
  const [email, setEmail] = useState("admin@marc.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoWrap}>
          <img src={loginImage} alt="Marc Logo" style={styles.logoCircle} />
          <h1 style={styles.brand}>MARC FASHION</h1>
          <p style={styles.subtitle}>Admin Panel — Sign In</p>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              placeholder="admin@marc.com"
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? "Signing in..." : "Sign In →"}
          </button>
        </form>

        <p style={styles.hint}>
          Default: admin@marc.com / admin123
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #111827 0%, #1f2937 50%, #111827 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    background: "#ffffff",
    borderRadius: 16,
    padding: "40px 36px",
    width: "100%",
    maxWidth: 420,
    boxShadow: "0 25px 50px rgba(0,0,0,0.4)",
  },
  logoWrap: {
    textAlign: "center",
    marginBottom: 32,
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 16,
    objectFit: "cover",
    display: "block",
    margin: "0 auto 16px",
  },
  brand: {
    fontSize: 22,
    fontWeight: 800,
    letterSpacing: 3,
    color: "#111827",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "#6b7280",
    letterSpacing: 0.5,
  },
  errorBox: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: 8,
    padding: "10px 14px",
    color: "#dc2626",
    fontSize: 13,
    marginBottom: 20,
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
  },
  input: {
    border: "1.5px solid #e5e7eb",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 14,
    color: "#111827",
    outline: "none",
    transition: "border-color 0.15s",
  },
  btn: {
    background: "#C9A465",
    color: "#111827",
    border: "none",
    borderRadius: 8,
    padding: "12px 20px",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    marginTop: 4,
    transition: "background 0.15s",
  },
  hint: {
    textAlign: "center",
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 20,
  },
};
