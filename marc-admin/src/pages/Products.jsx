import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Pagination from "../components/Pagination";

const PAGE_SIZE = 10;

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [page,     setPage]     = useState(1);

  const fetchProducts = () => {
    setLoading(true);
    api.get("/products/admin/all")
      .then((res) => setProducts(res.data.products))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const filtered = products.filter((p) => {
    const matchCat = catFilter === "all" || p.category === catFilter;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const totalPages        = Math.ceil(filtered.length / PAGE_SIZE);
  const paginatedFiltered = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.delete(`/products/${deleteId}`);
      setProducts((prev) => prev.filter((p) => p._id !== deleteId));
      setDeleteId(null);
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Products</h1>
          <p style={styles.desc}>{filtered.length} of {products.length} products</p>
        </div>
        <Link to="/add-product" style={styles.addBtn}>➕ Add Product</Link>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <input
          type="text"
          placeholder="🔍  Search products..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={styles.searchInput}
        />
        <div style={styles.catTabs}>
          {["all", "men", "women", "boys", "girls", "footwear", "innerwear", "undergarments", "shawl", "hijab"].map((cat) => (
            <button
              key={cat}
              onClick={() => { setCatFilter(cat); setPage(1); }}
              style={{
                ...styles.catTab,
                background: catFilter === cat ? "#111827" : "#ffffff",
                color: catFilter === cat ? "#C9A465" : "#374151",
                border: `1.5px solid ${catFilter === cat ? "#111827" : "#e5e7eb"}`,
              }}
            >
              {cat === "all" ? "All" : cat === "footwear" ? "Footwear" : cat === "innerwear" ? "Innerwear" : cat === "undergarments" ? "Undergarments" : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={styles.tableCard}>
        {loading ? (
          <div style={styles.empty}>Loading products...</div>
        ) : filtered.length === 0 ? (
          <div style={styles.empty}>No products found.</div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Product</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Price</th>
                <th style={styles.th}>Old Price</th>
                <th style={styles.th}>Badge</th>
                <th style={styles.th}>Stock</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedFiltered.map((p) => (
                <tr key={p._id} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={styles.productCell}>
                      <div style={styles.emojiBox}>{p.emoji}</div>
                      <div>
                        <div style={styles.productName}>{p.name}</div>
                        <div style={styles.productMeta}>{p.material}</div>
                      </div>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={{ ...styles.catBadge, ...catColor(p.category) }}>
                      {p.category}
                    </span>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.price}>₹{p.price.toLocaleString("en-IN")}</span>
                  </td>
                  <td style={styles.td}>
                    {p.oldPrice ? (
                      <span style={styles.oldPrice}>₹{p.oldPrice.toLocaleString("en-IN")}</span>
                    ) : "—"}
                  </td>
                  <td style={styles.td}>
                    {p.badge ? (
                      <span style={{ ...styles.badge, ...badgeColor(p.badge) }}>{p.badge}</span>
                    ) : "—"}
                  </td>
                  <td style={styles.td}>{p.stock}</td>
                  <td style={styles.td}>
                    <span style={{ ...styles.statusDot, background: p.isActive ? "#10b981" : "#ef4444" }} />
                    {p.isActive ? "Active" : "Inactive"}
                  </td>
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      <Link to={`/edit-product/${p._id}`} style={styles.editBtn}>
                        ✏️ Edit
                      </Link>
                      <button
                        style={styles.delBtn}
                        onClick={() => setDeleteId(p._id)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Pagination
          page={page}
          totalPages={totalPages}
          total={filtered.length}
          pageSize={PAGE_SIZE}
          onChange={setPage}
        />
      </div>

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <div style={styles.modalIcon}>🗑️</div>
            <h3 style={styles.modalTitle}>Delete Product?</h3>
            <p style={styles.modalText}>
              This action cannot be undone. The product will be permanently removed.
            </p>
            <div style={styles.modalBtns}>
              <button style={styles.cancelBtn} onClick={() => setDeleteId(null)}>
                Cancel
              </button>
              <button style={styles.confirmDelBtn} onClick={handleDelete} disabled={deleting}>
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const catColor = (cat) => {
  if (cat === "men")      return { background: "#dbeafe", color: "#1e40af" };
  if (cat === "women")    return { background: "#fce7f3", color: "#9d174d" };
  if (cat === "boys")     return { background: "#d1fae5", color: "#065f46" };
  if (cat === "girls")    return { background: "#fdf4ff", color: "#86198f" };
  if (cat === "footwear")  return { background: "#fef3c7", color: "#92400e" };
  if (cat === "innerwear")     return { background: "#ede9fe", color: "#5b21b6" };
  if (cat === "undergarments") return { background: "#e0f2fe", color: "#0369a1" };
  return { background: "#f3f4f6", color: "#374151" };
};

const badgeColor = (badge) => {
  if (badge === "Sale") return { background: "#fef3c7", color: "#92400e" };
  return { background: "#dbeafe", color: "#1e40af" };
};

const styles = {
  page: { padding: "28px 32px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  title: { fontSize: 26, fontWeight: 700, color: "#111827" },
  desc: { color: "#6b7280", fontSize: 14, marginTop: 4 },
  addBtn: {
    background: "#C9A465",
    color: "#111827",
    borderRadius: 8,
    padding: "10px 18px",
    fontSize: 14,
    fontWeight: 600,
    display: "inline-block",
  },
  filters: { display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" },
  searchInput: {
    flex: 1,
    minWidth: 240,
    border: "1.5px solid #e5e7eb",
    borderRadius: 8,
    padding: "9px 14px",
    fontSize: 14,
    outline: "none",
  },
  catTabs: { display: "flex", gap: 6 },
  catTab: {
    padding: "8px 16px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s",
  },
  tableCard: {
    background: "#ffffff",
    borderRadius: 12,
    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
    overflow: "auto",
  },
  empty: { padding: "48px 20px", textAlign: "center", color: "#9ca3af", fontSize: 14 },
  table: { width: "100%", borderCollapse: "collapse", minWidth: 900 },
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
    whiteSpace: "nowrap",
  },
  tr: { borderBottom: "1px solid #f9fafb", transition: "background 0.1s" },
  td: { padding: "12px 16px", fontSize: 13, color: "#374151", verticalAlign: "middle" },
  productCell: { display: "flex", alignItems: "center", gap: 12, minWidth: 200 },
  emojiBox: {
    width: 40, height: 40, borderRadius: 8, background: "#f9fafb",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 20, flexShrink: 0,
  },
  productName: { fontWeight: 600, color: "#111827", fontSize: 13 },
  productMeta: { fontSize: 11, color: "#9ca3af", marginTop: 2 },
  catBadge: { padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, textTransform: "capitalize" },
  price: { fontWeight: 700, color: "#111827" },
  oldPrice: { textDecoration: "line-through", color: "#9ca3af" },
  badge: { padding: "3px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600 },
  statusDot: { display: "inline-block", width: 8, height: 8, borderRadius: "50%", marginRight: 6 },
  actions: { display: "flex", gap: 8 },
  editBtn: {
    background: "#f3f4f6", border: "none", borderRadius: 6,
    padding: "6px 12px", fontSize: 12, fontWeight: 600, color: "#374151",
    cursor: "pointer", display: "inline-block",
  },
  delBtn: {
    background: "#fef2f2", border: "none", borderRadius: 6,
    padding: "6px 12px", fontSize: 12, fontWeight: 600, color: "#dc2626",
    cursor: "pointer",
  },
  overlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999,
  },
  modal: {
    background: "#fff", borderRadius: 16, padding: "36px 32px",
    maxWidth: 380, width: "100%", textAlign: "center",
    boxShadow: "0 25px 50px rgba(0,0,0,0.3)",
  },
  modalIcon: { fontSize: 40, marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: 700, color: "#111827", marginBottom: 10 },
  modalText: { fontSize: 14, color: "#6b7280", marginBottom: 24, lineHeight: 1.6 },
  modalBtns: { display: "flex", gap: 12 },
  cancelBtn: {
    flex: 1, background: "#f3f4f6", border: "none", borderRadius: 8,
    padding: "11px", fontWeight: 600, fontSize: 14, cursor: "pointer",
  },
  confirmDelBtn: {
    flex: 1, background: "#ef4444", border: "none", borderRadius: 8,
    padding: "11px", color: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer",
  },
};
