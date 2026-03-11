import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

function StatCard({ icon, label, value, color, sub }) {
  return (
    <div style={{ ...styles.statCard, borderTop: `4px solid ${color}` }}>
      <div style={styles.statIcon}>{icon}</div>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
      {sub && <div style={styles.statSub}>{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const [products, setProducts] = useState([]);
  const [storeStats, setStoreStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/products/admin/all"),
      api.get("/customers/admin/stats"),
    ])
      .then(([prodRes, statsRes]) => {
        setProducts(prodRes.data.products);
        setStoreStats(statsRes.data.stats);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const total = products.length;
  const men = products.filter((p) => p.category === "men").length;
  const women = products.filter((p) => p.category === "women").length;
  const kids = products.filter((p) => ["boys", "girls"].includes(p.category)).length;
  const onSale = products.filter((p) => p.isSale).length;
  const active = products.filter((p) => p.isActive).length;
  const recent = [...products].slice(0, 5);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Dashboard</h1>
          <p style={styles.desc}>Welcome back! Here's what's happening in your store.</p>
        </div>
        <Link to="/add-product" style={styles.addBtn}>
          ➕ Add Product
        </Link>
      </div>

      {/* Stats */}
      {loading ? (
        <p style={{ color: "#6b7280" }}>Loading stats...</p>
      ) : (
        <>
          {/* Store overview */}
          {storeStats && (
            <div style={styles.overviewGrid}>
              <StatCard icon="👥" label="Total Customers" value={storeStats.totalCustomers} color="#C9A465" />
              <StatCard icon="🧾" label="Total Orders" value={storeStats.totalOrders} color="#3b82f6" />
              <StatCard icon="💰" label="Revenue" value={`₹${storeStats.revenue.toLocaleString("en-IN")}`} color="#10b981" />
              <StatCard icon="⏳" label="Pending Orders" value={storeStats.pendingOrders} color="#f59e0b" sub="Processing" />
            </div>
          )}

          <div style={styles.statsGrid}>
            <StatCard icon="📦" label="Total Products" value={total} color="#C9A465" />
            <StatCard icon="👔" label="Men's" value={men} color="#3b82f6" sub={`${Math.round((men/total)*100)||0}% of total`} />
            <StatCard icon="👗" label="Women's" value={women} color="#ec4899" sub={`${Math.round((women/total)*100)||0}% of total`} />
            <StatCard icon="🧒" label="Kids" value={kids} color="#10b981" sub={`${Math.round((kids/total)*100)||0}% of total`} />
            <StatCard icon="🏷️" label="On Sale" value={onSale} color="#f59e0b" sub={`${Math.round((onSale/total)*100)||0}% of total`} />
            <StatCard icon="✅" label="Active" value={active} color="#6366f1" sub={`${total - active} inactive`} />
          </div>

          {/* Recent Products */}
          <div style={styles.recentCard}>
            <div style={styles.recentHeader}>
              <h2 style={styles.recentTitle}>Recent Products</h2>
              <Link to="/products" style={styles.viewAll}>View All →</Link>
            </div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Product</th>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Price</th>
                  <th style={styles.th}>Badge</th>
                  <th style={styles.th}>Stock</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((p) => (
                  <tr key={p._id} style={styles.tr}>
                    <td style={styles.td}>
                      <div style={styles.productCell}>
                        <span style={styles.emoji}>{p.emoji}</span>
                        <span style={styles.productName}>{p.name}</span>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <span style={{ ...styles.catBadge, ...catColor(p.category) }}>
                        {p.category}
                      </span>
                    </td>
                    <td style={styles.td}>₹{p.price.toLocaleString("en-IN")}</td>
                    <td style={styles.td}>
                      {p.badge ? (
                        <span style={{ ...styles.badge, background: p.badge === "Sale" ? "#fef3c7" : "#dbeafe", color: p.badge === "Sale" ? "#92400e" : "#1e40af" }}>
                          {p.badge}
                        </span>
                      ) : "—"}
                    </td>
                    <td style={styles.td}>{p.stock}</td>
                    <td style={styles.td}>
                      <Link to={`/edit-product/${p._id}`} style={styles.editLink}>Edit</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

const catColor = (cat) => {
  if (cat === "men") return { background: "#dbeafe", color: "#1e40af" };
  if (cat === "women") return { background: "#fce7f3", color: "#9d174d" };
  return { background: "#d1fae5", color: "#065f46" };
};

const styles = {
  page: { padding: "28px 32px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 },
  title: { fontSize: 26, fontWeight: 700, color: "#111827" },
  desc: { color: "#6b7280", fontSize: 14, marginTop: 4 },
  addBtn: {
    background: "#C9A465",
    color: "#111827",
    border: "none",
    borderRadius: 8,
    padding: "10px 18px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    display: "inline-block",
  },
  overviewGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: 16,
    marginBottom: 20,
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
    gap: 16,
    marginBottom: 28,
  },
  statCard: {
    background: "#ffffff",
    borderRadius: 12,
    padding: "20px 16px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
  },
  statIcon: { fontSize: 24, marginBottom: 10 },
  statValue: { fontSize: 28, fontWeight: 700, color: "#111827", marginBottom: 4 },
  statLabel: { fontSize: 13, fontWeight: 600, color: "#374151" },
  statSub: { fontSize: 11, color: "#9ca3af", marginTop: 4 },
  recentCard: {
    background: "#ffffff",
    borderRadius: 12,
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    overflow: "hidden",
  },
  recentHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 20px",
    borderBottom: "1px solid #f3f4f6",
  },
  recentTitle: { fontSize: 16, fontWeight: 600, color: "#111827" },
  viewAll: { fontSize: 13, color: "#C9A465", fontWeight: 600 },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    padding: "10px 16px",
    textAlign: "left",
    fontSize: 11,
    fontWeight: 600,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    background: "#f9fafb",
    borderBottom: "1px solid #f3f4f6",
  },
  tr: { borderBottom: "1px solid #f9fafb" },
  td: { padding: "12px 16px", fontSize: 13, color: "#374151", verticalAlign: "middle" },
  productCell: { display: "flex", alignItems: "center", gap: 10 },
  emoji: { fontSize: 20 },
  productName: { fontWeight: 500, color: "#111827" },
  catBadge: { padding: "3px 8px", borderRadius: 20, fontSize: 11, fontWeight: 600, textTransform: "capitalize" },
  badge: { padding: "3px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600 },
  editLink: { color: "#C9A465", fontWeight: 600, fontSize: 13 },
};
