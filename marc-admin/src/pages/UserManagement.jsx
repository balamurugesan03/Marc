import { useEffect, useState } from "react";
import api from "../api/axios";

const ROLES = [
  { value: "superadmin", label: "Super Admin",  color: "#7c3aed", bg: "#ede9fe", desc: "Full access to everything" },
  { value: "manager",    label: "Manager",       color: "#0369a1", bg: "#e0f2fe", desc: "Manage products & orders"  },
  { value: "editor",     label: "Editor",        color: "#065f46", bg: "#d1fae5", desc: "Edit products only"        },
];

const roleInfo = (role) => ROLES.find((r) => r.value === role) || ROLES[2];

const emptyForm = { name: "", email: "", password: "", role: "editor" };

export default function UserManagement() {
  const [employees,   setEmployees]   = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [showForm,    setShowForm]    = useState(false);
  const [editTarget,  setEditTarget]  = useState(null);   // employee being edited
  const [form,        setForm]        = useState(emptyForm);
  const [pwdModal,    setPwdModal]    = useState(null);   // employee for password reset
  const [newPwd,      setNewPwd]      = useState("");
  const [deleteId,    setDeleteId]    = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [toast,       setToast]       = useState({ msg: "", type: "ok" });

  /* ── helpers ── */
  const showToast = (msg, type = "ok") => { setToast({ msg, type }); setTimeout(() => setToast({ msg: "" }), 3500); };
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const fetchEmployees = () => {
    setLoading(true);
    api.get("/admins")
      .then((r) => setEmployees(r.data.admins))
      .catch(() => showToast("Failed to load employees", "err"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchEmployees(); }, []);

  /* ── open create form ── */
  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  /* ── open edit form ── */
  const openEdit = (emp) => {
    setEditTarget(emp);
    setForm({ name: emp.name, email: emp.email, password: "", role: emp.role });
    setShowForm(true);
  };

  /* ── submit create / edit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editTarget) {
        const payload = { name: form.name, email: form.email, role: form.role };
        await api.put(`/admins/${editTarget._id}`, payload);
        showToast("Employee updated successfully");
      } else {
        await api.post("/admins", form);
        showToast("Employee account created successfully");
      }
      setShowForm(false);
      fetchEmployees();
    } catch (err) {
      showToast(err.response?.data?.message || "Something went wrong", "err");
    } finally {
      setSaving(false);
    }
  };

  /* ── toggle active ── */
  const toggleActive = async (emp) => {
    try {
      await api.put(`/admins/${emp._id}`, { isActive: !emp.isActive });
      showToast(emp.isActive ? "Employee deactivated" : "Employee activated");
      fetchEmployees();
    } catch (err) {
      showToast(err.response?.data?.message || "Error", "err");
    }
  };

  /* ── reset password ── */
  const resetPassword = async () => {
    if (!newPwd || newPwd.length < 6) return showToast("Password must be at least 6 characters", "err");
    setSaving(true);
    try {
      await api.put(`/admins/${pwdModal._id}/reset-password`, { password: newPwd });
      showToast("Password reset successfully");
      setPwdModal(null);
      setNewPwd("");
    } catch (err) {
      showToast(err.response?.data?.message || "Error", "err");
    } finally {
      setSaving(false);
    }
  };

  /* ── delete ── */
  const handleDelete = async () => {
    setSaving(true);
    try {
      await api.delete(`/admins/${deleteId}`);
      showToast("Employee deleted successfully");
      setDeleteId(null);
      fetchEmployees();
    } catch (err) {
      showToast(err.response?.data?.message || "Error", "err");
    } finally {
      setSaving(false);
    }
  };

  /* ── stats ── */
  const total    = employees.length;
  const active   = employees.filter((e) => e.isActive).length;
  const inactive = employees.filter((e) => !e.isActive).length;

  return (
    <div style={s.page}>

      {/* ── TOAST ── */}
      {toast.msg && (
        <div style={{ ...s.toast, background: toast.type === "err" ? "#fef2f2" : "#f0fdf4", color: toast.type === "err" ? "#dc2626" : "#16a34a", border: `1px solid ${toast.type === "err" ? "#fecaca" : "#bbf7d0"}` }}>
          {toast.type === "err" ? "❌" : "✅"} {toast.msg}
        </div>
      )}

      {/* ── HEADER ── */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>User Management</h1>
          <p style={s.desc}>Create and manage employee login credentials</p>
        </div>
        <button style={s.addBtn} onClick={openCreate}>+ Add Employee</button>
      </div>

      {/* ── STATS ── */}
      <div style={s.statRow}>
        {[
          { icon: "👤", val: total,    lbl: "Total Employees", color: "#C9A465" },
          { icon: "✅", val: active,   lbl: "Active",          color: "#10b981" },
          { icon: "⛔", val: inactive, lbl: "Inactive",        color: "#ef4444" },
        ].map((st) => (
          <div key={st.lbl} style={{ ...s.statCard, borderTop: `4px solid ${st.color}` }}>
            <div style={s.statIcon}>{st.icon}</div>
            <div style={s.statVal}>{st.val}</div>
            <div style={s.statLbl}>{st.lbl}</div>
          </div>
        ))}

        {/* Role legend */}
        <div style={{ ...s.statCard, borderTop: "4px solid #8b5cf6" }}>
          <div style={s.statIcon}>🛡️</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {ROLES.map((r) => (
              <div key={r.value} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ ...s.roleBadge, background: r.bg, color: r.color }}>{r.label}</span>
                <span style={{ fontSize: 11, color: "#9ca3af" }}>{r.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TABLE ── */}
      <div style={s.tableCard}>
        {loading ? (
          <div style={s.empty}>Loading employees…</div>
        ) : employees.length === 0 ? (
          <div style={s.empty}>No employees yet. Click "Add Employee" to create one.</div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                {["#", "Employee", "Email", "Role", "Status", "Created", "Actions"].map((h) => (
                  <th key={h} style={s.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map((emp, i) => {
                const role = roleInfo(emp.role);
                return (
                  <tr key={emp._id} style={s.tr}>
                    <td style={{ ...s.td, color: "#9ca3af" }}>{i + 1}</td>

                    <td style={s.td}>
                      <div style={s.empCell}>
                        <div style={{ ...s.avatar, background: emp.isActive ? "#C9A465" : "#e5e7eb", color: emp.isActive ? "#111827" : "#9ca3af" }}>
                          {emp.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={s.empName}>{emp.name}</div>
                        </div>
                      </div>
                    </td>

                    <td style={{ ...s.td, color: "#6b7280" }}>{emp.email}</td>

                    <td style={s.td}>
                      <span style={{ ...s.roleBadge, background: role.bg, color: role.color }}>{role.label}</span>
                    </td>

                    <td style={s.td}>
                      <span style={{ ...s.statusBadge, background: emp.isActive ? "#d1fae5" : "#fee2e2", color: emp.isActive ? "#065f46" : "#dc2626" }}>
                        {emp.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td style={{ ...s.td, color: "#9ca3af", fontSize: 12 }}>
                      {new Date(emp.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>

                    <td style={s.td}>
                      <div style={s.actionRow}>
                        <button style={s.iconBtn} title="Edit" onClick={() => openEdit(emp)}>✏️</button>
                        <button style={s.iconBtn} title="Reset Password" onClick={() => { setPwdModal(emp); setNewPwd(""); }}>🔑</button>
                        <button
                          style={{ ...s.iconBtn, background: emp.isActive ? "#fee2e2" : "#d1fae5" }}
                          title={emp.isActive ? "Deactivate" : "Activate"}
                          onClick={() => toggleActive(emp)}
                        >
                          {emp.isActive ? "⛔" : "✅"}
                        </button>
                        <button style={{ ...s.iconBtn, background: "#fee2e2" }} title="Delete" onClick={() => setDeleteId(emp._id)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ══ CREATE / EDIT MODAL ══ */}
      {showForm && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>{editTarget ? "Edit Employee" : "Create Employee Account"}</h2>
              <button style={s.closeX} onClick={() => setShowForm(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={s.field}>
                <label style={s.label}>Full Name *</label>
                <input style={s.input} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Ravi Kumar" required />
              </div>

              <div style={s.field}>
                <label style={s.label}>Email Address *</label>
                <input style={s.input} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="ravi@marc.com" required />
              </div>

              {!editTarget && (
                <div style={s.field}>
                  <label style={s.label}>Password *</label>
                  <input style={s.input} type="password" value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="Min 6 characters" required minLength={6} />
                </div>
              )}

              <div style={s.field}>
                <label style={s.label}>Role *</label>
                <div style={s.roleGrid}>
                  {ROLES.map((r) => (
                    <div
                      key={r.value}
                      onClick={() => set("role", r.value)}
                      style={{
                        ...s.roleCard,
                        border: form.role === r.value ? `2px solid ${r.color}` : "2px solid #e5e7eb",
                        background: form.role === r.value ? r.bg : "#fafafa",
                      }}
                    >
                      <span style={{ ...s.roleBadge, background: r.bg, color: r.color, marginBottom: 4 }}>{r.label}</span>
                      <span style={{ fontSize: 11, color: "#6b7280" }}>{r.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={s.modalFooter}>
                <button type="button" style={s.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" style={s.saveBtn} disabled={saving}>
                  {saving ? "Saving…" : editTarget ? "💾 Update Employee" : "✅ Create Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ RESET PASSWORD MODAL ══ */}
      {pwdModal && (
        <div style={s.overlay}>
          <div style={{ ...s.modal, maxWidth: 400 }}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>Reset Password</h2>
              <button style={s.closeX} onClick={() => setPwdModal(null)}>✕</button>
            </div>
            <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>
              Set a new password for <strong>{pwdModal.name}</strong>
            </p>
            <div style={s.field}>
              <label style={s.label}>New Password *</label>
              <input
                style={s.input}
                type="password"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                placeholder="Min 6 characters"
                autoFocus
              />
            </div>
            <div style={s.modalFooter}>
              <button style={s.cancelBtn} onClick={() => setPwdModal(null)}>Cancel</button>
              <button style={s.saveBtn} onClick={resetPassword} disabled={saving}>
                {saving ? "Resetting…" : "🔑 Reset Password"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ DELETE CONFIRM MODAL ══ */}
      {deleteId && (
        <div style={s.overlay}>
          <div style={{ ...s.modal, maxWidth: 380, textAlign: "center" }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>🗑️</div>
            <h3 style={s.modalTitle}>Delete Employee?</h3>
            <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 24, lineHeight: 1.6 }}>
              This will permanently delete the employee account and they will no longer be able to log in.
            </p>
            <div style={s.modalFooter}>
              <button style={s.cancelBtn} onClick={() => setDeleteId(null)} disabled={saving}>Cancel</button>
              <button style={{ ...s.saveBtn, background: "#ef4444" }} onClick={handleDelete} disabled={saving}>
                {saving ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── styles ── */
const s = {
  page:  { padding: "28px 32px", position: "relative" },
  header:{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  title: { fontSize: 26, fontWeight: 700, color: "#111827" },
  desc:  { color: "#6b7280", fontSize: 14, marginTop: 4 },
  addBtn:{ background: "#C9A465", border: "none", borderRadius: 8, padding: "10px 20px", fontSize: 14, fontWeight: 700, color: "#111827", cursor: "pointer" },

  statRow:  { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))", gap: 16, marginBottom: 24 },
  statCard: { background: "#fff", borderRadius: 12, padding: "20px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" },
  statIcon: { fontSize: 22, marginBottom: 10 },
  statVal:  { fontSize: 24, fontWeight: 700, color: "#111827", marginBottom: 4 },
  statLbl:  { fontSize: 12, fontWeight: 600, color: "#6b7280" },

  tableCard: { background: "#fff", borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", overflow: "auto" },
  empty:     { padding: "60px 20px", textAlign: "center", color: "#9ca3af", fontSize: 14 },
  table:     { width: "100%", borderCollapse: "collapse", minWidth: 700 },
  th: {
    padding: "10px 16px", textAlign: "left",
    fontSize: 11, fontWeight: 600, color: "#6b7280",
    textTransform: "uppercase", letterSpacing: 0.5,
    background: "#f9fafb", borderBottom: "1px solid #f3f4f6",
    whiteSpace: "nowrap",
  },
  tr:  { borderBottom: "1px solid #f9fafb" },
  td:  { padding: "13px 16px", fontSize: 13, color: "#374151", verticalAlign: "middle" },

  empCell: { display: "flex", alignItems: "center", gap: 10 },
  avatar:  { width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 15, flexShrink: 0 },
  empName: { fontWeight: 600, color: "#111827" },

  roleBadge:   { display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700 },
  statusBadge: { display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 },

  actionRow: { display: "flex", gap: 6 },
  iconBtn:   { background: "#f3f4f6", border: "none", borderRadius: 6, padding: "6px 10px", fontSize: 14, cursor: "pointer" },

  /* modals */
  overlay:     { position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999 },
  modal:       { background: "#fff", borderRadius: 16, padding: "28px 28px 24px", width: "100%", maxWidth: 520, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle:  { fontSize: 18, fontWeight: 700, color: "#111827" },
  closeX:      { background: "none", border: "none", fontSize: 18, color: "#9ca3af", cursor: "pointer", padding: 4 },

  field:  { display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 },
  label:  { fontSize: 12, fontWeight: 600, color: "#374151", textTransform: "uppercase", letterSpacing: 0.5 },
  input:  { border: "1.5px solid #e5e7eb", borderRadius: 8, padding: "10px 12px", fontSize: 14, color: "#111827", outline: "none" },

  roleGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 },
  roleCard: { borderRadius: 10, padding: "12px 10px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", transition: "all 0.15s" },

  modalFooter: { display: "flex", gap: 10, marginTop: 8 },
  cancelBtn:   { flex: 1, background: "#f3f4f6", border: "none", borderRadius: 8, padding: "11px", fontSize: 14, fontWeight: 600, cursor: "pointer" },
  saveBtn:     { flex: 1, background: "#C9A465", border: "none", borderRadius: 8, padding: "11px", fontSize: 14, fontWeight: 700, color: "#111827", cursor: "pointer" },

  toast: { position: "fixed", top: 20, right: 20, zIndex: 1000, padding: "12px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" },
};
