import { useEffect, useRef, useState } from "react";
import api from "../api/axios";
import PrintableBill from "../components/PrintableBill";
import Pagination from "../components/Pagination";
import html2pdf from "html2pdf.js";

const PAGE_SIZE = 10;

const STATUS_COLORS = {
  Processing: { bg: "#fef3c7", color: "#92400e" },
  Shipped:    { bg: "#dbeafe", color: "#1e40af" },
  Delivered:  { bg: "#d1fae5", color: "#065f46" },
  Cancelled:  { bg: "#fee2e2", color: "#991b1b" },
};

const STATUSES = ["all", "Processing", "Shipped", "Delivered", "Cancelled"];

// ─── Print-specific styling and layout ───────────────────────────
const PrintStyles = `
  @media print {
    body * {
      visibility: hidden;
    }
    .printable-area, .printable-area * {
      visibility: visible;
    }
    .printable-area {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
    }
    .page-break {
      page-break-after: always;
      border-top: 1px dashed #ccc;
      margin-top: 20px;
    }
  }
`;

const PrintableArea = ({ order }) => {
  if (!order) return null;
  return (
    <div className="printable-area">
      <style>{PrintStyles}</style>
      {/* Render two copies */}
      <PrintableBill order={order} />
      <div className="page-break"></div>
      <PrintableBill order={order} />
    </div>
  );
};


export default function Orders() {
  const [allOrders, setAllOrders] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [status,    setStatus]    = useState("all");
  const [updating,  setUpdating]  = useState(null);
  const [orderToPrint, setOrderToPrint] = useState(null);
  const [orderForWhatsApp, setOrderForWhatsApp] = useState(null);
  const whatsappBillRef = useRef(null);
  const [emailing,    setEmailing]    = useState(null);
  const [emailMsg,    setEmailMsg]    = useState("");
  const [trackModal,  setTrackModal]  = useState(null); // { orderId, currentStatus }
  const [trackingInput, setTrackingInput] = useState("");
  const [viewOrder,   setViewOrder]   = useState(null); // order object for detail modal
  const [page,        setPage]        = useState(1);

  // ─── Data Fetching ───────────────────────────────────────────────
  const fetchOrders = (s = status) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (s !== "all") params.set("status", s);
    api.get(`/customers/admin/orders?${params}`)
      .then((res) => setAllOrders(res.data.orders))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  // ─── Event Handlers ─────────────────────────────────────────────
  const handleStatus = (e) => {
    setStatus(e.target.value);
    setSearch("");
    setPage(1);
    fetchOrders(e.target.value);
  };

  const handlePrint = (order) => {
    setOrderToPrint(order);
  };

  const handleWhatsApp = (order) => {
    const mobile = order.shipping?.mobile?.replace(/\D/g, "");
    if (!mobile) {
      alert("No mobile number found for this order.");
      return;
    }
    setOrderForWhatsApp(order);
  };

  // ─── WhatsApp PDF Generation & Upload ────────────────────────────
  useEffect(() => {
    if (!orderForWhatsApp || !whatsappBillRef.current) return;

    const order = orderForWhatsApp;
    const mobile = order.shipping?.mobile?.replace(/\D/g, "");
    const phone = mobile.startsWith("91") && mobile.length === 12 ? mobile : `91${mobile}`;

    const options = {
      margin: 10,
      filename: `MARC-Invoice-${order.orderNumber}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    };

    html2pdf()
      .set(options)
      .from(whatsappBillRef.current)
      .output("blob")
      .then(async (blob) => {
        let invoiceUrl = "";
        try {
          const fd = new FormData();
          fd.append("invoice", blob, `MARC-Invoice-${order.orderNumber}.pdf`);
          const res = await api.post("/customers/upload-invoice", fd, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          if (res.data.success) invoiceUrl = res.data.url;
        } catch {
          // URL unavailable — message still sent without link
        }

        const message =
          `*MARC FASHION – Invoice #${order.orderNumber}*\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `Dear ${order.shipping?.name},\n\n` +
          `Thank you for your order! Here are your details:\n\n` +
          `🛍️ *Items:* ${order.items?.length} item(s)\n` +
          `💰 *Grand Total:* ₹${order.total.toLocaleString("en-IN")}\n` +
          `🚚 *Shipping:* ${order.shippingMethod || "Standard"}\n` +
          `💳 *Payment:* ${order.paymentMethod || "UPI"}\n` +
          (invoiceUrl ? `\n📄 *Download Invoice:*\n${invoiceUrl}\n` : "") +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `Thank you for shopping with MARC Family Fashion! 🛍️\n` +
          `Vellayani Jn., Nemom (P.O), Trivandrum, Kerala\n` +
          `+91 9633 633 733`;

        window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
        setOrderForWhatsApp(null);
      });
  }, [orderForWhatsApp]);

  const handleEmail = async (orderId) => {
    setEmailing(orderId);
    setEmailMsg("");
    try {
      const res = await api.post(`/customers/admin/orders/${orderId}/email`);
      setEmailMsg("✅ " + res.data.message);
    } catch (err) {
      setEmailMsg("❌ " + (err.response?.data?.message || "Failed to send email"));
    } finally {
      setEmailing(null);
      setTimeout(() => setEmailMsg(""), 4000);
    }
  };

  // ─── Printing Logic ─────────────────────────────────────────────
  useEffect(() => {
    if (orderToPrint) {
      const handleAfterPrint = () => {
        setOrderToPrint(null);
        window.removeEventListener("afterprint", handleAfterPrint);
      };
      
      window.addEventListener("afterprint", handleAfterPrint);
      window.print();
    }
  }, [orderToPrint]);

  // ─── Derived State & Updates ────────────────────────────────────
  const orders = search.trim()
    ? allOrders.filter((o) => {
        const q = search.toLowerCase();
        return (
          o.customer?.name?.toLowerCase().includes(q) ||
          o.customer?.email?.toLowerCase().includes(q) ||
          o.orderNumber?.toLowerCase().includes(q)
        );
      })
    : allOrders;

  const totalPages      = Math.ceil(orders.length / PAGE_SIZE);
  const paginatedOrders = orders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const updateStatus = async (orderId, newStatus) => {
    // Show tracking modal for ALL shipments when status is Shipped
    if (newStatus === "Shipped") {
      const order = allOrders.find((o) => o._id === orderId);
      setTrackingInput(order?.trackingNumber || "");
      setTrackModal({ orderId, newStatus });
      return;
    }
    await doUpdateStatus(orderId, newStatus, "");
  };

  const doUpdateStatus = async (orderId, newStatus, trackingNumber) => {
    setUpdating(orderId);
    try {
      const res = await api.put(`/customers/admin/orders/${orderId}`, {
        status: newStatus,
        trackingNumber,
      });
      setAllOrders((prev) => prev.map((o) => (o._id === orderId ? res.data.order : o)));
      if (newStatus === "Shipped") {
        setEmailMsg(`✅ Status updated & shipping email sent to customer`);
        setTimeout(() => setEmailMsg(""), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
      setTrackModal(null);
      setTrackingInput("");
    }
  };

  const totalRevenue = allOrders
    .filter((o) => o.status !== "Cancelled")
    .reduce((s, o) => s + o.total, 0);

  // ─── Render ─────────────────────────────────────────────────────
  return (
    <div style={s.page}>
      <PrintableArea order={orderToPrint} />

      {/* Hidden invoice for WhatsApp PDF generation */}
      <div style={{ position: "absolute", left: "-9999px", top: 0, width: "800px" }}>
        <div ref={whatsappBillRef}>
          {orderForWhatsApp && <PrintableBill order={orderForWhatsApp} />}
        </div>
      </div>

      {/* Tracking Number Modal */}
      {trackModal && (
        <div style={s.modalOverlay}>
          <div style={s.modalBox}>
            <h3 style={s.modalTitle}>📦 Enter Tracking Number</h3>
            <p style={s.modalDesc}>
              Tracking number will be saved and emailed to the customer. Leave empty if not available.
            </p>
            <input
              type="text"
              value={trackingInput}
              onChange={(e) => setTrackingInput(e.target.value.toUpperCase())}
              placeholder="e.g. EA123456789IN (optional)"
              style={s.modalInput}
              autoFocus
            />
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button
                style={s.modalConfirm}
                disabled={updating === trackModal.orderId}
                onClick={() => doUpdateStatus(trackModal.orderId, trackModal.newStatus, trackingInput.trim())}
              >
                {updating === trackModal.orderId ? "Updating…" : "✅ Update & Send Email"}
              </button>
              <button
                style={s.modalCancel}
                onClick={() => { setTrackModal(null); setTrackingInput(""); }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* ─── View Details Modal ─────────────────────────────────── */}
      {viewOrder && (
        <div style={s.modalOverlay} onClick={() => setViewOrder(null)}>
          <div style={{ ...s.modalBox, maxWidth: 640, maxHeight: "90vh", overflowY: "auto" }}
               onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h3 style={{ ...s.modalTitle, marginBottom: 2 }}>Order Details</h3>
                <span style={{ fontFamily: "monospace", fontSize: 15, fontWeight: 700, color: "#C9A465" }}>
                  #{viewOrder.orderNumber}
                </span>
              </div>
              <button onClick={() => setViewOrder(null)}
                      style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#6b7280" }}>
                ✕
              </button>
            </div>

            {/* Customer & Date */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
              <div style={s.detailBox}>
                <div style={s.detailLabel}>Customer</div>
                <div style={s.detailVal}>{viewOrder.customer?.name || "Guest"}</div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>{viewOrder.customer?.email || "—"}</div>
              </div>
              <div style={s.detailBox}>
                <div style={s.detailLabel}>Order Date</div>
                <div style={s.detailVal}>
                  {new Date(viewOrder.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                </div>
                <span style={{ ...s.statusBadge, ...(STATUS_COLORS[viewOrder.status] || {}), marginTop: 4, display: "inline-block" }}>
                  {viewOrder.status}
                </span>
              </div>
            </div>

            {/* Shipping Address */}
            <div style={{ marginBottom: 18 }}>
              <div style={s.detailLabel}>Shipping Address</div>
              <div style={{ ...s.detailBox, marginTop: 6 }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>{viewOrder.shipping?.name}</div>
                <div style={{ fontSize: 13, color: "#555", lineHeight: 1.6 }}>
                  {viewOrder.shipping?.address}<br />
                  {viewOrder.shipping?.city}, {viewOrder.shipping?.state} – {viewOrder.shipping?.pin}<br />
                  📱 {viewOrder.shipping?.mobile}
                </div>
              </div>
            </div>

            {/* Items */}
            <div style={{ marginBottom: 18 }}>
              <div style={s.detailLabel}>Items Ordered</div>
              <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 8 }}>
                <thead>
                  <tr style={{ background: "#f9fafb" }}>
                    <th style={{ ...s.th, padding: "8px 10px" }}>Product</th>
                    <th style={{ ...s.th, padding: "8px 10px", textAlign: "center" }}>Qty</th>
                    <th style={{ ...s.th, padding: "8px 10px", textAlign: "right" }}>Price</th>
                    <th style={{ ...s.th, padding: "8px 10px", textAlign: "right" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {viewOrder.items?.map((item, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <td style={{ padding: "8px 10px", fontSize: 13 }}>
                        {item.name}
                        {item.size && <span style={{ color: "#9ca3af", fontSize: 11 }}> ({item.size})</span>}
                      </td>
                      <td style={{ padding: "8px 10px", textAlign: "center", fontSize: 13 }}>{item.qty}</td>
                      <td style={{ padding: "8px 10px", textAlign: "right", fontSize: 13 }}>₹{Number(item.price).toLocaleString("en-IN")}</td>
                      <td style={{ padding: "8px 10px", textAlign: "right", fontSize: 13, fontWeight: 700 }}>
                        ₹{(item.qty * item.price).toLocaleString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div style={{ ...s.detailBox, marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#555", marginBottom: 6 }}>
                <span>Subtotal</span>
                <span>₹{(viewOrder.total - (viewOrder.shippingCost || 0)).toLocaleString("en-IN")}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#555", marginBottom: 10 }}>
                <span>Shipping ({viewOrder.shippingMethod || "—"})</span>
                <span>{viewOrder.shippingCost > 0 ? `₹${viewOrder.shippingCost}` : "FREE"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 700 }}>
                <span>Grand Total</span>
                <span style={{ color: "#C9A465" }}>₹{viewOrder.total.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Payment Info + Screenshot */}
            <div style={{ ...s.detailBox, marginBottom: 18 }}>
              <div style={s.detailLabel}>Payment</div>
              <div style={{ fontSize: 14, fontWeight: 600, margin: "6px 0 10px" }}>
                💳 {viewOrder.paymentMethod || "—"}
              </div>
              {viewOrder.paymentScreenshot ? (
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Payment Screenshot
                  </div>
                  <a
                    href={`http://localhost:5000/uploads/${viewOrder.paymentScreenshot}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      src={`http://localhost:5000/uploads/${viewOrder.paymentScreenshot}`}
                      alt="Payment proof"
                      style={{ width: "100%", maxHeight: 300, objectFit: "contain", borderRadius: 8, border: "1px solid #e5e7eb", background: "#f9fafb", cursor: "pointer" }}
                    />
                  </a>
                  <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>Click image to open full size</div>
                </div>
              ) : (
                <div style={{ fontSize: 13, color: "#9ca3af", fontStyle: "italic" }}>No payment screenshot uploaded</div>
              )}
            </div>

            {/* Tracking */}
            {viewOrder.trackingNumber && (
              <div style={s.detailBox}>
                <div style={s.detailLabel}>Tracking</div>
                <div style={{ fontFamily: "monospace", fontSize: 16, fontWeight: 700, color: "#1d4ed8", marginTop: 6 }}>
                  {viewOrder.trackingNumber}
                </div>
              </div>
            )}

            <button onClick={() => setViewOrder(null)} style={{ ...s.modalCancel, width: "100%", marginTop: 20, padding: "12px" }}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Orders</h1>
          <p style={s.desc}>
            {search ? `${orders.length} of ${allOrders.length} orders` : `${allOrders.length} orders`}
          </p>
        </div>
      </div>

      {/* Email toast */}
      {emailMsg && (
        <div style={{
          padding: "12px 18px", borderRadius: 8, marginBottom: 16, fontSize: 14, fontWeight: 500,
          background: emailMsg.startsWith("✅") ? "#d1fae5" : "#fee2e2",
          color:      emailMsg.startsWith("✅") ? "#065f46" : "#991b1b",
          border:     `1px solid ${emailMsg.startsWith("✅") ? "#6ee7b7" : "#fca5a5"}`,
        }}>
          {emailMsg}
        </div>
      )}

      {/* Summary cards */}
      <div style={s.statRow}>
        <div style={{ ...s.statCard, borderTop: "4px solid #C9A465" }}>
          <div style={s.statIcon}>🧾</div>
          <div style={s.statVal}>{allOrders.length}</div>
          <div style={s.statLbl}>Total Orders</div>
        </div>
        <div style={{ ...s.statCard, borderTop: "4px solid #f59e0b" }}>
          <div style={s.statIcon}>⏳</div>
          <div style={s.statVal}>{allOrders.filter((o) => o.status === "Processing").length}</div>
          <div style={s.statLbl}>Processing</div>
        </div>
        <div style={{ ...s.statCard, borderTop: "4px solid #3b82f6" }}>
          <div style={s.statIcon}>🚚</div>
          <div style={s.statVal}>{allOrders.filter((o) => o.status === "Shipped").length}</div>
          <div style={s.statLbl}>Shipped</div>
        </div>
        <div style={{ ...s.statCard, borderTop: "4px solid #10b981" }}>
          <div style={s.statIcon}>✅</div>
          <div style={s.statVal}>{allOrders.filter((o) => o.status === "Delivered").length}</div>
          <div style={s.statLbl}>Delivered</div>
        </div>
        <div style={{ ...s.statCard, borderTop: "4px solid #6366f1" }}>
          <div style={s.statIcon}>💰</div>
          <div style={s.statVal}>₹{totalRevenue.toLocaleString("en-IN")}</div>
          <div style={s.statLbl}>Revenue (non-cancelled)</div>
        </div>
      </div>

      {/* Toolbar */}
      <div style={s.toolbar}>
        <input
          type="text"
          placeholder="🔍  Search by customer name, email or order #…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={s.searchInput}
        />
        <select value={status} onChange={handleStatus} style={s.select}>
          {STATUSES.map((st) => (
            <option key={st} value={st}>
              {st === "all" ? "All Statuses" : st}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div style={s.tableCard}>
        {loading ? (
          <div style={s.empty}>Loading orders…</div>
        ) : orders.length === 0 ? (
          <div style={s.empty}>No orders found.</div>
        ) : (
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Order #</th>
                <th style={s.th}>Customer</th>
                <th style={s.th}>Date</th>
                <th style={s.th}>Items</th>
                <th style={s.th}>Total</th>
                <th style={s.th}>Payment</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Update</th>
                <th style={s.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((o) => (
                <tr key={o._id} style={s.tr}>
                  <td style={{ ...s.td, fontFamily: "monospace", fontWeight: 600, color: "#C9A465" }}>
                    {o.orderNumber || o._id.slice(-8).toUpperCase()}
                  </td>
                  <td style={s.td}>
                    <div style={s.customerCell}>
                      <div style={s.avatar}>
                        {(o.customer?.name || "?").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: "#111827", fontSize: 13 }}>
                          {o.customer?.name || "Guest"}
                        </div>
                        <div style={{ color: "#9ca3af", fontSize: 11 }}>
                          {o.customer?.email || "—"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ ...s.td, color: "#6b7280" }}>
                    {new Date(o.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </td>
                  <td style={s.td}>
                    <span style={s.itemsBadge}>{o.items?.length || 0} item{o.items?.length !== 1 ? "s" : ""}</span>
                  </td>
                  <td style={{ ...s.td, fontWeight: 700, color: "#111827" }}>
                    ₹{o.total.toLocaleString("en-IN")}
                  </td>
                  <td style={{ ...s.td, color: "#6b7280", fontSize: 12 }}>
                    {o.paymentMethod || "—"}
                  </td>
                  <td style={s.td}>
                    <span style={{ ...s.statusBadge, ...(STATUS_COLORS[o.status] || {}) }}>
                      {o.status}
                    </span>
                    {o.trackingNumber && (
                      <div style={{ fontSize: 11, color: "#1d4ed8", marginTop: 4, fontFamily: "monospace", fontWeight: 600 }}>
                        🔖 {o.trackingNumber}
                      </div>
                    )}
                  </td>
                  <td style={s.td}>
                    <select
                      value={o.status}
                      disabled={updating === o._id}
                      onChange={(e) => updateStatus(o._id, e.target.value)}
                      style={{
                        ...s.statusSelect,
                        opacity: updating === o._id ? 0.5 : 1,
                      }}
                    >
                      {["Processing", "Shipped", "Delivered", "Cancelled"].map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </td>
                  <td style={s.td}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <button
                        onClick={() => setViewOrder(o)}
                        style={{ ...s.printBtn, background: "#f0fdf4", borderColor: "#6ee7b7", color: "#065f46" }}
                      >
                        🔍 View Details
                      </button>
                      <button onClick={() => handlePrint(o)} style={s.printBtn}>
                        🖨️ Print
                      </button>
                      <button
                        onClick={() => handleEmail(o._id)}
                        disabled={emailing === o._id}
                        style={{
                          ...s.printBtn,
                          background: emailing === o._id ? "#f3f4f6" : "#eff6ff",
                          borderColor: "#bfdbfe",
                          color: "#1d4ed8",
                          opacity: emailing === o._id ? 0.6 : 1,
                        }}
                      >
                        {emailing === o._id ? "Sending…" : "📧 Email"}
                      </button>
                      <button
                        onClick={() => handleWhatsApp(o)}
                        style={{
                          ...s.printBtn,
                          background: "#f0fdf4",
                          borderColor: "#86efac",
                          color: "#166534",
                        }}
                      >
                        💬 WhatsApp
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
          total={orders.length}
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

  statRow: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 16, marginBottom: 24 },
  statCard: { background: "#fff", borderRadius: 12, padding: "20px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" },
  statIcon: { fontSize: 22, marginBottom: 10 },
  statVal:  { fontSize: 22, fontWeight: 700, color: "#111827", marginBottom: 4 },
  statLbl:  { fontSize: 12, fontWeight: 600, color: "#6b7280" },

  toolbar:     { display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" },
  searchInput: {
    flex: "1 1 280px", maxWidth: 380,
    border: "1.5px solid #e5e7eb", borderRadius: 8,
    padding: "9px 14px", fontSize: 14, outline: "none",
  },
  select: {
    border: "1.5px solid #e5e7eb", borderRadius: 8,
    padding: "9px 14px", fontSize: 14, outline: "none",
    background: "#fff", cursor: "pointer",
  },

  tableCard: { background: "#fff", borderRadius: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.08)", overflow: "auto" },
  empty:     { padding: "60px 20px", textAlign: "center", color: "#9ca3af", fontSize: 14 },

  table: { width: "100%", borderCollapse: "collapse", minWidth: 900 },
  th: {
    padding: "10px 16px", textAlign: "left",
    fontSize: 11, fontWeight: 600, color: "#6b7280",
    textTransform: "uppercase", letterSpacing: 0.5,
    background: "#f9fafb", borderBottom: "1px solid #f3f4f6",
    whiteSpace: "nowrap",
  },
  tr: { borderBottom: "1px solid #f9fafb" },
  td: { padding: "12px 16px", fontSize: 13, color: "#374151", verticalAlign: "middle" },

  customerCell: { display: "flex", alignItems: "center", gap: 10 },
  avatar: {
    width: 32, height: 32, borderRadius: "50%",
    background: "#C9A465", color: "#111827",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontWeight: 700, fontSize: 13, flexShrink: 0,
  },

  itemsBadge: {
    display: "inline-block",
    padding: "3px 10px", borderRadius: 20,
    background: "#f3f4f6", color: "#374151",
    fontSize: 12, fontWeight: 600,
  },
  statusBadge: {
    display: "inline-block",
    padding: "4px 10px", borderRadius: 20,
    fontSize: 12, fontWeight: 600,
  },
  statusSelect: {
    border: "1px solid #e5e7eb", borderRadius: 6,
    padding: "5px 8px", fontSize: 12,
    background: "#fff", cursor: "pointer", outline: "none",
  },
  printBtn: {
    padding: "6px 12px",
    fontSize: 12,
    fontWeight: 600,
    background: "transparent",
    border: "1px solid #d1d5db",
    borderRadius: 6,
    cursor: "pointer",
  },

  detailBox: {
    background: "#f9fafb", borderRadius: 10, padding: "14px 16px",
    border: "1px solid #f3f4f6",
  },
  detailLabel: {
    fontSize: 11, fontWeight: 700, color: "#9ca3af",
    textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4,
  },
  detailVal: { fontSize: 15, fontWeight: 600, color: "#111827" },

  modalOverlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999,
  },
  modalBox: {
    background: "#fff", borderRadius: 14, padding: "28px 32px",
    width: "100%", maxWidth: 440, boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
  },
  modalTitle: { fontSize: 17, fontWeight: 700, color: "#111827", marginBottom: 8 },
  modalDesc:  { fontSize: 13, color: "#6b7280", marginBottom: 16, lineHeight: 1.5 },
  modalInput: {
    width: "100%", border: "1.5px solid #C9A465", borderRadius: 8,
    padding: "10px 14px", fontSize: 16, fontFamily: "monospace",
    fontWeight: 600, outline: "none", letterSpacing: 2, boxSizing: "border-box",
  },
  modalConfirm: {
    flex: 1, background: "#C9A465", color: "#111", border: "none",
    borderRadius: 8, padding: "10px 16px", fontSize: 13, fontWeight: 700,
    cursor: "pointer",
  },
  modalCancel: {
    background: "#f3f4f6", color: "#374151", border: "none",
    borderRadius: 8, padding: "10px 16px", fontSize: 13, fontWeight: 600,
    cursor: "pointer",
  },
};
