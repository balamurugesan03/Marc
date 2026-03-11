import { useEffect, useState } from "react";
import api from "../api/axios";
import Pagination from "../components/Pagination";

const PAGE_SIZE = 10;

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [page,      setPage]      = useState(1);

  const fetchCustomers = (q = "") => {
    setLoading(true);
    api.get(`/customers/admin/all${q ? `?search=${q}` : ""}`)
      .then((res) => setCustomers(res.data.customers))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCustomers(); }, []);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
    fetchCustomers(e.target.value);
  };

  const totalRevenue    = customers.reduce((s, c) => s + c.totalSpent, 0);
  const totalPages      = Math.ceil(customers.length / PAGE_SIZE);
  const paginatedCustomers = customers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Customers</h1>
          <p style={s.desc}>{customers.length} registered customers</p>
        </div>
      </div>

      {/* Summary cards */}
      <div style={s.statRow}>
        <div style={{ ...s.statCard, borderTop: "4px solid #C9A465" }}>
          <div style={s.statIcon}>👥</div>
          <div style={s.statVal}>{customers.length}</div>
          <div style={s.statLbl}>Total Customers</div>
        </div>
        <div style={{ ...s.statCard, borderTop: "4px solid #10b981" }}>
          <div style={s.statIcon}>🛍️</div>
          <div style={s.statVal}>{customers.reduce((s, c) => s + c.orderCount, 0)}</div>
          <div style={s.statLbl}>Total Orders</div>
        </div>
        <div style={{ ...s.statCard, borderTop: "4px solid #3b82f6" }}>
          <div style={s.statIcon}>💰</div>
          <div style={s.statVal}>₹{totalRevenue.toLocaleString("en-IN")}</div>
          <div style={s.statLbl}>Total Revenue</div>
        </div>
        <div style={{ ...s.statCard, borderTop: "4px solid #8b5cf6" }}>
          <div style={s.statIcon}>📊</div>
          <div style={s.statVal}>
            ₹{customers.length ? Math.round(totalRevenue / customers.length).toLocaleString("en-IN") : 0}
          </div>
          <div style={s.statLbl}>Avg. Spend / Customer</div>
        </div>
      </div>

      {/* Search */}
      <div style={s.toolbar}>
        <input
          type="text"
          placeholder="🔍  Search by name or email…"
          value={search}
          onChange={handleSearch}
          style={s.searchInput}
        />
      </div>

      {/* Table */}
      <div style={s.tableCard}>
        {loading ? (
          <div style={s.empty}>Loading customers…</div>
        ) : customers.length === 0 ? (
          <div style={s.empty}>No customers found.</div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>#</th>
                <th style={s.th}>Customer</th>
                <th style={s.th}>Email</th>
                <th style={s.th}>Joined</th>
                <th style={s.th}>Orders</th>
                <th style={s.th}>Total Spent</th>
                <th style={s.th}>Avg. Order</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCustomers.map((c, i) => (
                <tr key={c._id} style={s.tr}>
                  <td style={{ ...s.td, color: "#9ca3af", fontWeight: 500 }}>{(page - 1) * PAGE_SIZE + i + 1}</td>
                  <td style={s.td}>
                    <div style={s.customerCell}>
                      <div style={s.avatar}>
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <span style={s.customerName}>{c.name}</span>
                    </div>
                  </td>
                  <td style={{ ...s.td, color: "#6b7280" }}>{c.email}</td>
                  <td style={{ ...s.td, color: "#6b7280" }}>
                    {new Date(c.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </td>
                  <td style={s.td}>
                    <span style={{
                      ...s.countBadge,
                      background: c.orderCount > 0 ? "#d1fae5" : "#f3f4f6",
                      color:      c.orderCount > 0 ? "#065f46"  : "#9ca3af",
                    }}>
                      {c.orderCount} {c.orderCount === 1 ? "order" : "orders"}
                    </span>
                  </td>
                  <td style={{ ...s.td, fontWeight: 700, color: "#111827" }}>
                    ₹{c.totalSpent.toLocaleString("en-IN")}
                  </td>
                  <td style={{ ...s.td, color: "#6b7280" }}>
                    ₹{c.orderCount ? Math.round(c.totalSpent / c.orderCount).toLocaleString("en-IN") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Pagination
          page={page}
          totalPages={totalPages}
          total={customers.length}
          pageSize={PAGE_SIZE}
          onChange={setPage}
        />
      </div>
    </div>
  );
}

const s = {
  page:   { padding: "28px 32px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  title:  { fontSize: 26, fontWeight: 700, color: "#111827" },
  desc:   { color: "#6b7280", fontSize: 14, marginTop: 4 },

  statRow: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, marginBottom: 24 },
  statCard: { background: "#fff", borderRadius: 12, padding: "20px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" },
  statIcon: { fontSize: 22, marginBottom: 10 },
  statVal:  { fontSize: 24, fontWeight: 700, color: "#111827", marginBottom: 4 },
  statLbl:  { fontSize: 12, fontWeight: 600, color: "#6b7280" },

  toolbar:     { marginBottom: 16 },
  searchInput: {
    width: "100%", maxWidth: 400,
    border: "1.5px solid #e5e7eb", borderRadius: 8,
    padding: "9px 14px", fontSize: 14, outline: "none",
  },

  tableCard: { background: "#fff", borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", overflow: "auto" },
  empty:     { padding: "60px 20px", textAlign: "center", color: "#9ca3af", fontSize: 14 },

  table: { width: "100%", borderCollapse: "collapse", minWidth: 700 },
  th: {
    padding: "10px 16px", textAlign: "left",
    fontSize: 11, fontWeight: 600, color: "#6b7280",
    textTransform: "uppercase", letterSpacing: 0.5,
    background: "#f9fafb", borderBottom: "1px solid #f3f4f6",
    whiteSpace: "nowrap",
  },
  tr: { borderBottom: "1px solid #f9fafb" },
  td: { padding: "13px 16px", fontSize: 13, color: "#374151", verticalAlign: "middle" },

  customerCell: { display: "flex", alignItems: "center", gap: 10 },
  avatar: {
    width: 34, height: 34, borderRadius: "50%",
    background: "#C9A465", color: "#111827",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 700, fontSize: 14, flexShrink: 0,
  },
  customerName: { fontWeight: 600, color: "#111827" },
  countBadge: {
    display: "inline-block",
    padding: "3px 10px", borderRadius: 20,
    fontSize: 12, fontWeight: 600,
  },
};
