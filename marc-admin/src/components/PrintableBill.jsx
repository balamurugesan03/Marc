import React from "react";
import marcLogo from "../assets/loginimage.jpeg";

export default function PrintableBill({ order }) {
  if (!order) return null;

  const itemsSubtotal = order.items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const discount    = order.discount || 0;
  const shipping    = order.shippingCost || 0;
  const grandTotal  = order.total;
  const dateStr     = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "2-digit", month: "long", year: "numeric",
  });

  return (
    <div style={s.bill}>

      {/* ── HEADER ── */}
      <header style={s.header}>
        {/* Left: Logo + Store Info */}
        <div style={s.storeBlock}>
          <img src={marcLogo} alt="MARC" style={s.logo} />
          <div style={s.storeDetails}>
            <div style={s.storeName}>MARC</div>
            <div style={s.storeAddr}>Vellayani Junction, Nemom P.O</div>
            <div style={s.storeAddr}>Pin: 695020, Thiruvananthapuram</div>
            <div style={s.storeAddr}>Kerala, India</div>
            <div style={s.storeAddr}>📞 +91 7907 858 891</div>
            <div style={s.gstTag}>GST No: <strong>32EBUPA0737B1Z4</strong></div>
          </div>
        </div>

        {/* Right: Invoice meta */}
        <div style={s.invoiceBlock}>
          <div style={s.invoiceTitle}>INVOICE</div>
          <table style={s.metaTable}>
            <tbody>
              <tr>
                <td style={s.metaLabel}>Invoice No</td>
                <td style={s.metaVal}>#{order.orderNumber}</td>
              </tr>
              <tr>
                <td style={s.metaLabel}>Date</td>
                <td style={s.metaVal}>{dateStr}</td>
              </tr>
              <tr>
                <td style={s.metaLabel}>Payment</td>
                <td style={s.metaVal}>{order.paymentMethod || "—"}</td>
              </tr>
              <tr>
                <td style={s.metaLabel}>Shipping</td>
                <td style={s.metaVal}>{order.shippingMethod || "Standard"}</td>
              </tr>
              {order.trackingNumber && (
                <tr>
                  <td style={s.metaLabel}>Tracking</td>
                  <td style={{ ...s.metaVal, color: "#1d4ed8" }}>{order.trackingNumber}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </header>

      <div style={s.divider} />

      {/* ── BILL TO ── */}
      <section style={s.billingSection}>
        <div style={s.billTo}>
          <div style={s.sectionLabel}>BILL TO</div>
          <div style={s.customerName}>{order.shipping?.name}</div>
          <div style={s.detailText}>{order.shipping?.address}</div>
          <div style={s.detailText}>
            {order.shipping?.city}, {order.shipping?.state} – {order.shipping?.pin}
          </div>
          <div style={s.detailText}>📱 {order.shipping?.mobile}</div>
        </div>

        <div style={s.orderMeta}>
          <div style={s.sectionLabel}>ORDER STATUS</div>
          <div style={{ ...s.statusPill, ...statusColor(order.status) }}>
            {order.status}
          </div>
          {order.items?.length > 0 && (
            <div style={{ marginTop: 10, fontSize: 12, color: "#666" }}>
              {order.items.length} item{order.items.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </section>

      {/* ── ITEMS TABLE ── */}
      <section style={{ marginTop: 24 }}>
        <table style={s.itemsTable}>
          <thead>
            <tr style={s.theadRow}>
              <th style={{ ...s.th, width: "35%", textAlign: "left" }}>Product</th>
              <th style={{ ...s.th, textAlign: "left" }}>Size</th>
              <th style={{ ...s.th, textAlign: "center" }}>Qty</th>
              <th style={{ ...s.th, textAlign: "right" }}>MRP</th>
              <th style={{ ...s.th, textAlign: "right" }}>Price</th>
              <th style={{ ...s.th, textAlign: "right" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, i) => {
              const hasDiscount = item.oldPrice && item.oldPrice > item.price;
              return (
                <tr key={i} style={i % 2 === 0 ? s.rowEven : s.rowOdd}>
                  <td style={{ ...s.td, fontWeight: 600, color: "#111" }}>
                    {item.name}
                    {item.color && (
                      <span style={s.colorDot}>
                        <span style={{ ...s.colorSwatch, background: item.color }} />
                      </span>
                    )}
                  </td>
                  <td style={s.td}>{item.size || "—"}</td>
                  <td style={{ ...s.td, textAlign: "center" }}>{item.qty}</td>
                  <td style={{ ...s.td, textAlign: "right" }}>
                    {hasDiscount ? (
                      <span style={s.mrpStrike}>
                        ₹{Number(item.oldPrice).toLocaleString("en-IN")}
                      </span>
                    ) : (
                      <span style={{ color: "#555" }}>
                        ₹{Number(item.price).toLocaleString("en-IN")}
                      </span>
                    )}
                  </td>
                  <td style={{ ...s.td, textAlign: "right", fontWeight: 700, color: "#C9A465" }}>
                    ₹{Number(item.price).toLocaleString("en-IN")}
                  </td>
                  <td style={{ ...s.td, textAlign: "right", fontWeight: 700, color: "#111" }}>
                    ₹{(item.qty * item.price).toLocaleString("en-IN")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* ── TOTALS ── */}
      <div style={s.totalsWrap}>
        <table style={s.totalsTable}>
          <tbody>
            <tr>
              <td style={s.totalsLabel}>Subtotal</td>
              <td style={s.totalsVal}>₹{itemsSubtotal.toLocaleString("en-IN")}</td>
            </tr>

            {discount > 0 && (
              <tr>
                <td style={{ ...s.totalsLabel, color: "#16a34a" }}>
                  Discount{order.couponCode ? ` (${order.couponCode})` : ""}
                </td>
                <td style={{ ...s.totalsVal, color: "#16a34a" }}>
                  − ₹{discount.toLocaleString("en-IN")}
                </td>
              </tr>
            )}

            <tr>
              <td style={s.totalsLabel}>Shipping ({order.shippingMethod || "Standard"})</td>
              <td style={s.totalsVal}>
                {shipping > 0 ? `₹${shipping.toLocaleString("en-IN")}` : "FREE"}
              </td>
            </tr>

            <tr>
              <td style={s.totalsLabel}>GST</td>
              <td style={s.totalsVal}>Included</td>
            </tr>

            <tr>
              <td colSpan={2} style={{ padding: "4px 0" }}>
                <div style={s.totalDivider} />
              </td>
            </tr>

            <tr>
              <td style={s.grandLabel}>GRAND TOTAL</td>
              <td style={s.grandVal}>₹{grandTotal.toLocaleString("en-IN")}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── FOOTER ── */}
      <div style={s.footerDivider} />
      <footer style={s.footer}>
        <div>
          <div style={s.footerThank}>Thank you for shopping with <strong>MARC</strong>!</div>
          <div style={s.footerSub}>
            Vellayani Jn., Nemom P.O, Pin 695020, Thiruvananthapuram
          </div>
          <div style={s.footerSub}>
            📞 +91 7907 858 891 &nbsp;|&nbsp; GST: 32EBUPA0737B1Z4
          </div>
        </div>
        <div style={s.footerNote}>Computer-generated invoice — no signature required.</div>
      </footer>
    </div>
  );
}

const statusColor = (status) => {
  if (status === "Delivered")  return { background: "#d1fae5", color: "#065f46" };
  if (status === "Shipped")    return { background: "#dbeafe", color: "#1e40af" };
  if (status === "Cancelled")  return { background: "#fee2e2", color: "#991b1b" };
  return { background: "#fef3c7", color: "#92400e" }; // Processing
};

const s = {
  bill: {
    fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
    width: "100%",
    maxWidth: "800px",
    margin: "0 auto",
    padding: "32px 36px",
    background: "#fff",
    color: "#1a1a1a",
    boxSizing: "border-box",
  },

  // Header
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 20,
  },
  storeBlock: {
    display: "flex",
    alignItems: "flex-start",
    gap: 14,
  },
  logo: {
    height: 64,
    width: 64,
    objectFit: "cover",
    borderRadius: 8,
    border: "2px solid #C9A465",
  },
  storeDetails: {
    display: "flex",
    flexDirection: "column",
    gap: 1,
  },
  storeName: {
    fontSize: 18,
    fontWeight: 800,
    color: "#0e0e0e",
    letterSpacing: "0.1em",
    marginBottom: 3,
  },
  storeAddr: {
    fontSize: 11,
    color: "#555",
    lineHeight: 1.7,
  },
  gstTag: {
    marginTop: 5,
    fontSize: 10.5,
    color: "#777",
    letterSpacing: "0.03em",
  },

  // Invoice block
  invoiceBlock: {
    textAlign: "right",
  },
  invoiceTitle: {
    fontSize: 32,
    fontWeight: 900,
    color: "#0e0e0e",
    letterSpacing: "0.15em",
    marginBottom: 12,
  },
  metaTable: {
    borderCollapse: "collapse",
    marginLeft: "auto",
  },
  metaLabel: {
    fontSize: 10,
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    paddingRight: 14,
    paddingBottom: 5,
    fontWeight: 600,
    textAlign: "right",
  },
  metaVal: {
    fontSize: 11.5,
    fontWeight: 700,
    color: "#111",
    paddingBottom: 5,
    textAlign: "right",
  },

  // Divider
  divider: {
    height: 3,
    background: "linear-gradient(90deg, #C9A465 0%, #e8d5a3 50%, #C9A465 100%)",
    borderRadius: 2,
    margin: "20px 0",
  },

  // Billing section
  billingSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 20,
  },
  billTo: {
    flex: 1,
  },
  orderMeta: {
    textAlign: "right",
  },
  sectionLabel: {
    fontSize: 9.5,
    fontWeight: 700,
    color: "#aaa",
    textTransform: "uppercase",
    letterSpacing: "0.12em",
    marginBottom: 8,
  },
  customerName: {
    fontSize: 14,
    fontWeight: 700,
    color: "#111",
    marginBottom: 4,
  },
  detailText: {
    fontSize: 12,
    color: "#555",
    lineHeight: 1.7,
  },
  statusPill: {
    display: "inline-block",
    padding: "5px 14px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 700,
    marginTop: 4,
  },

  // Items table
  itemsTable: {
    width: "100%",
    borderCollapse: "collapse",
    borderRadius: 8,
    overflow: "hidden",
  },
  theadRow: {
    background: "#0e0e0e",
  },
  th: {
    padding: "10px 12px",
    color: "#C9A465",
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    whiteSpace: "nowrap",
  },
  rowEven: { background: "#fff" },
  rowOdd:  { background: "#fafaf8" },
  td: {
    padding: "10px 12px",
    borderBottom: "1px solid #f0f0f0",
    fontSize: 12.5,
    color: "#333",
    verticalAlign: "middle",
  },
  mrpStrike: {
    textDecoration: "line-through",
    color: "#bbb",
    fontSize: 11.5,
  },
  colorDot: {
    marginLeft: 6,
    verticalAlign: "middle",
  },
  colorSwatch: {
    display: "inline-block",
    width: 10,
    height: 10,
    borderRadius: "50%",
    border: "1px solid #ccc",
  },

  // Totals
  totalsWrap: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: 24,
  },
  totalsTable: {
    borderCollapse: "collapse",
    width: 300,
  },
  totalsLabel: {
    fontSize: 12.5,
    color: "#555",
    padding: "5px 16px 5px 0",
  },
  totalsVal: {
    fontSize: 12.5,
    fontWeight: 600,
    color: "#111",
    padding: "5px 0",
    textAlign: "right",
  },
  totalDivider: {
    borderTop: "2px solid #0e0e0e",
    margin: "4px 0",
  },
  grandLabel: {
    fontSize: 14,
    fontWeight: 800,
    color: "#0e0e0e",
    padding: "10px 16px 0 0",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },
  grandVal: {
    fontSize: 20,
    fontWeight: 800,
    color: "#C9A465",
    padding: "10px 0 0",
    textAlign: "right",
  },

  // Footer
  footerDivider: {
    borderTop: "2px solid #f0f0f0",
    margin: "28px 0 16px",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  footerThank: {
    fontSize: 13,
    color: "#333",
    fontWeight: 500,
    marginBottom: 4,
  },
  footerSub: {
    fontSize: 10.5,
    color: "#888",
    lineHeight: 1.8,
  },
  footerNote: {
    fontSize: 10,
    color: "#ccc",
    fontStyle: "italic",
  },
};
