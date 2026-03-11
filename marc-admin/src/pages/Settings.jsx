import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Settings() {
  const [indiaPost, setIndiaPost] = useState("");
  const [dtdc,      setDtdc]      = useState("");
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [msg,       setMsg]       = useState(null); // { type: "success"|"error", text }

  useEffect(() => {
    api.get("/settings")
      .then((res) => {
        const r = res.data.settings?.shippingRates || {};
        setIndiaPost(r.indiaPost ?? 0);
        setDtdc(r.dtdc ?? 49);
      })
      .catch(() => setMsg({ type: "error", text: "Failed to load settings." }))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (indiaPost === "" || dtdc === "") return;
    setSaving(true);
    setMsg(null);
    try {
      await api.put("/settings", {
        indiaPost: Number(indiaPost),
        dtdc:      Number(dtdc),
      });
      setMsg({ type: "success", text: "✅ Shipping rates saved successfully." });
    } catch {
      setMsg({ type: "error", text: "❌ Failed to save. Please try again." });
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(null), 4000);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h1 style={s.title}>Settings</h1>
        <p style={s.desc}>Manage store-wide configuration</p>
      </div>

      {loading ? (
        <div style={s.loading}>Loading settings…</div>
      ) : (
        <form onSubmit={handleSave} style={s.card}>
          <div style={s.sectionTitle}>
            <span style={s.sectionIcon}>🚚</span>
            Shipping Rates
          </div>
          <p style={s.sectionDesc}>
            These prices appear on the checkout page. Set to <strong>0</strong> for free shipping.
          </p>

          {msg && (
            <div style={{
              ...s.toast,
              background: msg.type === "success" ? "#d1fae5" : "#fee2e2",
              color:      msg.type === "success" ? "#065f46" : "#991b1b",
              border:     `1px solid ${msg.type === "success" ? "#6ee7b7" : "#fca5a5"}`,
            }}>
              {msg.text}
            </div>
          )}

          <div style={s.fieldRow}>
            {/* India Post */}
            <div style={s.field}>
              <div style={s.fieldHeader}>
                <span style={s.methodIcon}>📮</span>
                <div>
                  <div style={s.fieldLabel}>India Post</div>
                  <div style={s.fieldNote}>5–7 business days</div>
                </div>
              </div>
              <div style={s.inputWrap}>
                <span style={s.rupee}>₹</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={indiaPost}
                  onChange={(e) => setIndiaPost(e.target.value)}
                  style={s.input}
                  placeholder="0"
                />
              </div>
              {Number(indiaPost) === 0 && (
                <span style={s.freeBadge}>FREE for customers</span>
              )}
            </div>

            {/* DTDC */}
            <div style={s.field}>
              <div style={s.fieldHeader}>
                <span style={s.methodIcon}>📦</span>
                <div>
                  <div style={s.fieldLabel}>DTDC Courier</div>
                  <div style={s.fieldNote}>3–5 business days</div>
                </div>
              </div>
              <div style={s.inputWrap}>
                <span style={s.rupee}>₹</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={dtdc}
                  onChange={(e) => setDtdc(e.target.value)}
                  style={s.input}
                  placeholder="49"
                />
              </div>
              {Number(dtdc) === 0 && (
                <span style={s.freeBadge}>FREE for customers</span>
              )}
            </div>
          </div>

          {/* Preview */}
          <div style={s.preview}>
            <div style={s.previewTitle}>Preview — what customers will see at checkout</div>
            <div style={s.previewRow}>
              <span>📮 India Post (5–7 days)</span>
              <span style={{ fontWeight: 700, color: Number(indiaPost) === 0 ? "#27ae60" : "#111" }}>
                {Number(indiaPost) === 0 ? "FREE" : `₹${Number(indiaPost)}`}
              </span>
            </div>
            <div style={s.previewRow}>
              <span>📦 DTDC Courier (3–5 days)</span>
              <span style={{ fontWeight: 700, color: Number(dtdc) === 0 ? "#27ae60" : "#111" }}>
                {Number(dtdc) === 0 ? "FREE" : `₹${Number(dtdc)}`}
              </span>
            </div>
          </div>

          <button type="submit" disabled={saving} style={s.saveBtn}>
            {saving ? "Saving…" : "💾 Save Shipping Rates"}
          </button>
        </form>
      )}
    </div>
  );
}

const s = {
  page:   { padding: "28px 32px" },
  header: { marginBottom: 28 },
  title:  { fontSize: 26, fontWeight: 700, color: "#111827", marginBottom: 4 },
  desc:   { color: "#6b7280", fontSize: 14 },
  loading:{ padding: 40, textAlign: "center", color: "#9ca3af" },

  card: {
    background: "#fff",
    borderRadius: 14,
    padding: "28px 32px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
    maxWidth: 680,
  },

  sectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontSize: 17,
    fontWeight: 700,
    color: "#111827",
    marginBottom: 6,
  },
  sectionIcon: { fontSize: 20 },
  sectionDesc: { fontSize: 13, color: "#6b7280", marginBottom: 20, lineHeight: 1.5 },

  toast: {
    padding: "10px 16px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 600,
    marginBottom: 18,
  },

  fieldRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
    marginBottom: 24,
  },

  field: {
    background: "#f9fafb",
    borderRadius: 12,
    padding: "18px 20px",
    border: "1.5px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  fieldHeader: { display: "flex", alignItems: "center", gap: 10 },
  methodIcon:  { fontSize: 22 },
  fieldLabel:  { fontWeight: 700, fontSize: 14, color: "#111827" },
  fieldNote:   { fontSize: 11, color: "#9ca3af", marginTop: 2 },

  inputWrap: {
    display: "flex",
    alignItems: "center",
    border: "1.5px solid #C9A465",
    borderRadius: 8,
    overflow: "hidden",
    background: "#fff",
  },
  rupee: {
    padding: "10px 12px",
    background: "#fdf8ef",
    color: "#C9A465",
    fontWeight: 700,
    fontSize: 16,
    borderRight: "1px solid #e5d9c3",
  },
  input: {
    flex: 1,
    border: "none",
    outline: "none",
    padding: "10px 14px",
    fontSize: 18,
    fontWeight: 700,
    color: "#111827",
    fontFamily: "monospace",
    background: "transparent",
  },

  freeBadge: {
    display: "inline-block",
    background: "#d1fae5",
    color: "#065f46",
    fontSize: 11,
    fontWeight: 700,
    padding: "3px 10px",
    borderRadius: 20,
    letterSpacing: "0.04em",
  },

  preview: {
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    borderRadius: 10,
    padding: "14px 18px",
    marginBottom: 24,
  },
  previewTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: 10,
  },
  previewRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 13,
    color: "#374151",
    padding: "5px 0",
    borderBottom: "1px solid #dcfce7",
  },

  saveBtn: {
    background: "#C9A465",
    color: "#111827",
    border: "none",
    borderRadius: 10,
    padding: "12px 28px",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    letterSpacing: "0.04em",
  },
};
