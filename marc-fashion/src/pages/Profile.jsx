import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyOrders } from "../api/customers";
import PageBanner from "../components/ui/PageBanner";
import styles from "./Profile.module.css";

const STATUS_COLOR = {
  Processing: "#f59e0b",
  Shipped:    "#3b82f6",
  Delivered:  "#22c55e",
  Cancelled:  "#ef4444",
};

export default function Profile() {
  const { user, token, logout, isLoggedIn, authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState("orders"); // "orders" | "track" | "account"

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !isLoggedIn) {
      navigate("/login", { state: { from: "/profile" }, replace: true });
    }
  }, [authLoading, isLoggedIn, navigate]);

  // Fetch orders
  useEffect(() => {
    if (!token) return;
    getMyOrders(token)
      .then((data) => { if (data.success) setOrders(data.orders); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (authLoading) return <div className={styles.loading}>Loading…</div>;
  if (!user) return null;

  return (
    <>
      <PageBanner title="My" highlight="Account" eyebrow={`Hi, ${user.name}`} />

      <div className={styles.wrapper}>
        {/* ── Sidebar ── */}
        <aside className={styles.sidebar}>
          <div className={styles.avatar}>
            <span className={styles.avatarInitial}>
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className={styles.userName}>{user.name}</div>
          <div className={styles.userEmail}>{user.email}</div>

          <nav className={styles.sideNav}>
            <button
              className={`${styles.navItem} ${tab === "orders" ? styles.navActive : ""}`}
              onClick={() => setTab("orders")}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M5 6h6M5 9h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              My Orders
            </button>
            <button
              className={`${styles.navItem} ${tab === "account" ? styles.navActive : ""}`}
              onClick={() => setTab("account")}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M2 14c0-3 2.686-5 6-5s6 2 6 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              Account Details
            </button>
            <button
              className={`${styles.navItem} ${tab === "track" ? styles.navActive : ""}`}
              onClick={() => setTab("track")}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 8h9M8 5l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="13" cy="8" r="1.5" fill="currentColor"/>
              </svg>
              Track Order
            </button>
            <button className={`${styles.navItem} ${styles.navLogout}`} onClick={handleLogout}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Logout
            </button>
          </nav>
        </aside>

        {/* ── Main content ── */}
        <main className={styles.main}>

          {/* Orders tab */}
          {tab === "orders" && (
            <div>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Order <span>History</span></h2>
                <span className={styles.orderCount}>{orders.length} order{orders.length !== 1 ? "s" : ""}</span>
              </div>

              {loading ? (
                <div className={styles.skeletons}>
                  {[...Array(3)].map((_, i) => <div key={i} className={styles.skeleton} />)}
                </div>
              ) : orders.length === 0 ? (
                <div className={styles.empty}>
                  <div className={styles.emptyIcon}>
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                      <rect x="8" y="8" width="24" height="24" rx="4" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M14 18h12M14 23h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <h3 className={styles.emptyTitle}>No orders yet</h3>
                  <p className={styles.emptyText}>
                    When you place an order while signed in, it will appear here.
                  </p>
                  <a href="/men" className={styles.emptyBtn}>Start Shopping</a>
                </div>
              ) : (
                <div className={styles.orderList}>
                  {orders.map((order) => (
                    <div key={order._id} className={styles.orderCard}>
                      <div className={styles.orderCardHead}>
                        <div>
                          <div className={styles.orderNum}>{order.orderNumber}</div>
                          <div className={styles.orderDate}>
                            {new Date(order.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric", month: "long", year: "numeric",
                            })}
                          </div>
                        </div>
                        <span
                          className={styles.statusBadge}
                          style={{ background: STATUS_COLOR[order.status] + "1a", color: STATUS_COLOR[order.status] }}
                        >
                          {order.status}
                        </span>
                      </div>

                      {/* Items */}
                      <div className={styles.orderItems}>
                        {order.items.map((item, i) => (
                          <div key={i} className={styles.orderItem}>
                            <div className={styles.itemImg}>
                              {item.image
                                ? <img src={`http://localhost:5000/uploads/${item.image}`} alt={item.name} />
                                : <span>👕</span>}
                            </div>
                            <div className={styles.itemInfo}>
                              <div className={styles.itemName}>{item.name}</div>
                              <div className={styles.itemMeta}>
                                {item.size && <span>Size: {item.size}</span>}
                                <span>Qty: {item.qty}</span>
                              </div>
                            </div>
                            <div className={styles.itemPrice}>
                              ₹{(item.price * item.qty).toLocaleString("en-IN")}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className={styles.orderCardFoot}>
                        <div className={styles.footRow}>
                          <span>Shipping</span>
                          <span>{order.shippingMethod} — {order.shippingCost === 0 ? "FREE" : `₹${order.shippingCost}`}</span>
                        </div>
                        <div className={styles.footRow}>
                          <span>Payment</span>
                          <span>{order.paymentMethod}</span>
                        </div>
                        <div className={`${styles.footRow} ${styles.footTotal}`}>
                          <span>Total</span>
                          <span>₹{order.total.toLocaleString("en-IN")}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Track Order tab */}
          {tab === "track" && (
            <div>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Track <span>Orders</span></h2>
              </div>

              {loading ? (
                <div className={styles.skeletons}>
                  {[...Array(2)].map((_, i) => <div key={i} className={styles.skeleton} />)}
                </div>
              ) : orders.filter(o => o.shippingMethod?.toLowerCase().includes("dtdc")).length === 0 ? (
                <div className={styles.empty}>
                  <div className={styles.emptyIcon}>
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                      <rect x="4" y="14" width="32" height="20" rx="3" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M28 14v-4a4 4 0 00-8 0v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      <circle cx="20" cy="24" r="2.5" fill="currentColor"/>
                    </svg>
                  </div>
                  <h3 className={styles.emptyTitle}>No DTDC shipments yet</h3>
                  <p className={styles.emptyText}>Orders shipped via DTDC Courier with a tracking number will appear here.</p>
                </div>
              ) : (
                <div className={styles.orderList}>
                  {orders
                    .filter(o => o.shippingMethod?.toLowerCase().includes("dtdc"))
                    .map((order) => {
                      const trackingNo = order.trackingNumber || "";
                      const dtdcUrl = trackingNo
                        ? `https://www.dtdc.in/tracking.asp?Ttype=0&TrkType=cnno&strCnno=${trackingNo}`
                        : "";
                      return (
                        <div key={order._id} className={styles.orderCard}>
                          <div className={styles.orderCardHead}>
                            <div>
                              <div className={styles.orderNum}>{order.orderNumber}</div>
                              <div className={styles.orderDate}>
                                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                  day: "numeric", month: "long", year: "numeric",
                                })}
                              </div>
                            </div>
                            <span
                              className={styles.statusBadge}
                              style={{ background: STATUS_COLOR[order.status] + "1a", color: STATUS_COLOR[order.status] }}
                            >
                              {order.status}
                            </span>
                          </div>

                          <div className={styles.orderCardFoot}>
                            <div className={styles.footRow}>
                              <span>Shipping via</span>
                              <span>{order.shippingMethod}</span>
                            </div>

                            {trackingNo ? (
                              <div style={{ marginTop: "1rem" }}>
                                <div style={{
                                  background: "#eff6ff", border: "1.5px solid #bfdbfe",
                                  borderRadius: "10px", padding: "1rem 1.25rem", textAlign: "center"
                                }}>
                                  <p style={{ margin: "0 0 4px", fontSize: "0.7rem", color: "#1d4ed8", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>
                                    DTDC Tracking Number
                                  </p>
                                  <p style={{ margin: "0 0 12px", fontSize: "1.2rem", fontWeight: 700, color: "#1e3a8a", letterSpacing: "3px", fontFamily: "monospace" }}>
                                    {trackingNo}
                                  </p>
                                  <a
                                    href={dtdcUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    style={{
                                      display: "inline-block", background: "#1d4ed8", color: "#fff",
                                      padding: "0.65rem 1.5rem", borderRadius: "8px", fontSize: "0.82rem",
                                      fontWeight: 700, textDecoration: "none", letterSpacing: "0.04em"
                                    }}
                                  >
                                    🔍 Track on DTDC
                                  </a>
                                </div>
                              </div>
                            ) : (
                              <div style={{ marginTop: "0.75rem", padding: "0.75rem 1rem", background: "#fefce8", borderRadius: "8px", fontSize: "0.82rem", color: "#854d0e" }}>
                                ⏳ Tracking number will be available once your order is shipped
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* Account tab */}
          {tab === "account" && (
            <div>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Account <span>Details</span></h2>
              </div>
              <div className={styles.accountCard}>
                <div className={styles.accountField}>
                  <div className={styles.accountLabel}>Full Name</div>
                  <div className={styles.accountValue}>{user.name}</div>
                </div>
                <div className={styles.accountField}>
                  <div className={styles.accountLabel}>Email Address</div>
                  <div className={styles.accountValue}>{user.email}</div>
                </div>
                <div className={styles.accountField}>
                  <div className={styles.accountLabel}>Member Since</div>
                  <div className={styles.accountValue}>
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
                      : "—"}
                  </div>
                </div>
                <div className={styles.accountField}>
                  <div className={styles.accountLabel}>Total Orders</div>
                  <div className={styles.accountValue}>{orders.length}</div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
