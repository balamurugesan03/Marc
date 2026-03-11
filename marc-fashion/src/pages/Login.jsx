import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginCustomer } from "../api/customers";
import styles from "./Login.module.css";

export default function Login() {
  const { login }   = useAuth();
  const navigate    = useNavigate();
  const location    = useLocation();
  const from        = location.state?.from || "/profile";

  const [form,    setForm]    = useState({ email: "", password: "" });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const data = await loginCustomer(form.email, form.password);
      if (data.success) {
        login(data.token, data.customer);
        navigate(from, { replace: true });
      } else {
        setError(data.message || "Login failed. Please try again.");
      }
    } catch {
      setError("Cannot connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.left}>
        <div className={styles.leftContent}>
          <div className={styles.brand}>MARC</div>
          <h2 className={styles.tagline}>
            Fashion for<br />Every Family
          </h2>
          <p className={styles.sub}>
            Sign in to track your orders, manage your wishlist, and enjoy a
            personalised shopping experience.
          </p>
          <div className={styles.decorLine} />
          <div className={styles.perks}>
            {["Order history at a glance", "Saved addresses", "Exclusive member deals"].map((p) => (
              <div key={p} className={styles.perk}>
                <span className={styles.perkDot} />
                {p}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.right}>
        <div className={styles.card}>
          <h1 className={styles.title}>Welcome back</h1>
          <p className={styles.subtitle}>Sign in to your MARC account</p>

          {error && <div className={styles.errorBox}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={styles.input}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={styles.input}
              />
            </div>

            <button type="submit" className={styles.btn} disabled={loading}>
              {loading ? <span className={styles.spinner} /> : "Sign In"}
            </button>
          </form>

          <p className={styles.footer}>
            Don't have an account?{" "}
            <Link to="/signup" className={styles.link}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
