import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import nameImg from "../assets/name.png";

const NAV = [
  { to: "/",               icon: "📊", label: "Dashboard"       },
  { to: "/products",       icon: "👔", label: "Products"         },
  { to: "/add-product",    icon: "➕", label: "Add Product"      },
  { to: "/customers",      icon: "👥", label: "Customers"        },
  { to: "/user-management",icon: "🛡️", label: "User Management"  },
  { to: "/orders",         icon: "🧾", label: "Orders"           },
  { to: "/settings",       icon: "⚙️", label: "Settings"         },
];

export default function Sidebar() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logo}>
        <img src={nameImg} alt="MARC" style={styles.logoImg} />
        <div style={styles.logoSub}>Admin Panel</div>
      </div>

      {/* Nav */}
      <nav style={styles.nav}>
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            style={({ isActive }) => ({
              ...styles.navLink,
              background: isActive ? "rgba(201,164,101,0.15)" : "transparent",
              color: isActive ? "#C9A465" : "#9ca3af",
              borderLeft: isActive ? "3px solid #C9A465" : "3px solid transparent",
            })}
          >
            <span style={styles.navIcon}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={styles.sidebarFooter}>
        <div style={styles.adminInfo}>
          <div style={styles.adminAvatar}>
            {admin?.name?.[0]?.toUpperCase() || "A"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={styles.adminName}>{admin?.name || "Admin"}</div>
            <div style={styles.adminEmail}>{admin?.email}</div>
            <span style={roleBadgeStyle(admin?.role)}>
              {roleLabel(admin?.role)}
            </span>
          </div>
        </div>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}

const ROLE_MAP = {
  superadmin: { label: "Super Admin", color: "#7c3aed", bg: "#ede9fe" },
  manager:    { label: "Manager",     color: "#0369a1", bg: "#e0f2fe" },
  editor:     { label: "Editor",      color: "#065f46", bg: "#d1fae5" },
};

const roleLabel = (role) => ROLE_MAP[role]?.label || "Admin";

const roleBadgeStyle = (role) => {
  const r = ROLE_MAP[role] || ROLE_MAP.editor;
  return {
    display: "inline-block",
    marginTop: 4,
    padding: "2px 8px",
    borderRadius: 20,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 0.3,
    background: r.bg,
    color: r.color,
  };
};

const styles = {
  sidebar: {
    width: 240,
    minHeight: "100vh",
    background: "#b91c1c",
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 100,
  },
  logo: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 4,
    padding: "20px 16px 16px",
    borderBottom: "1px solid #991b1b",
  },
  logoImg: {
    height: 52,
    width: "auto",
    objectFit: "contain",
    display: "block",
  },
  logoSub: {
    color: "#6b7280",
    fontSize: 11,
    letterSpacing: 1,
    paddingLeft: 2,
  },
  nav: {
    padding: "16px 12px",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  navLink: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 12px",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 500,
    transition: "all 0.15s",
    textDecoration: "none",
  },
  navIcon: { fontSize: 16, width: 20, textAlign: "center" },
  sidebarFooter: {
    padding: "16px 12px 20px",
    borderTop: "1px solid #991b1b",
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  adminInfo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "8px 4px",
  },
  adminAvatar: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "#C9A465",
    color: "#111827",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 15,
    flexShrink: 0,
  },
  adminName: { color: "#ffffff", fontWeight: 600, fontSize: 13 },
  adminEmail: { color: "#6b7280", fontSize: 11, marginTop: 1 },
  logoutBtn: {
    background: "rgba(239,68,68,0.1)",
    border: "1px solid rgba(239,68,68,0.3)",
    color: "#ef4444",
    borderRadius: 8,
    padding: "8px 12px",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 500,
    transition: "all 0.15s",
  },
};
