import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { registerCustomer } from "../api/customers";
import styles from "./Login.module.css"; // reuse same layout styles
import signupStyles from "./Signup.module.css";

export default function Signup() {
  const { login }   = useAuth();
  const navigate    = useNavigate();

  const [form,    setForm]    = useState({ name: "", email: "", password: "", confirm: "" });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError("Please fill in all fields.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const data = await registerCustomer(form.name, form.email, form.password);
      if (data.success) {
        login(data.token, data.customer);
        navigate("/profile", { replace: true });
      } else {
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch {
      setError("Cannot connect to server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Left panel */}
      <div className={styles.left}>
        <div className={styles.leftContent}>
          <div className={styles.brand}>MARC</div>
          <h2 className={styles.tagline}>
            Join the<br />MARC Family
          </h2>
          <p className={styles.sub}>
            Create your account and start shopping the finest curated fashion
            for every member of your family.
          </p>
          <div className={styles.decorLine} />
          <div className={styles.perks}>
            {["Free returns within 30 days", "Exclusive member-only deals", "Track all your orders live"].map((p) => (
              <div key={p} className={styles.perk}>
                <span className={styles.perkDot} />
                {p}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className={styles.right}>
        <div className={styles.card}>
          <h1 className={styles.title}>Create account</h1>
          <p className={styles.subtitle}>Join thousands of happy MARC families</p>

          {error && <div className={styles.errorBox}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="name">Full name</label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your full name"
                className={styles.input}
              />
            </div>

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

            <div className={signupStyles.row2}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 6 characters"
                  className={styles.input}
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="confirm">Confirm password</label>
                <input
                  id="confirm"
                  name="confirm"
                  type="password"
                  autoComplete="new-password"
                  value={form.confirm}
                  onChange={handleChange}
                  placeholder="Repeat password"
                  className={styles.input}
                />
              </div>
            </div>

            <button type="submit" className={styles.btn} disabled={loading}>
              {loading ? <span className={styles.spinner} /> : "Create Account"}
            </button>
          </form>

          <p className={styles.footer}>
            Already have an account?{" "}
            <Link to="/login" className={styles.link}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
