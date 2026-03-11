import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { placeOrder, uploadScreenshot } from "../api/customers";
import { jsPDF } from "jspdf";
import nameImg from "../assets/name.png";
import styles from "./Checkout.module.css";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
];

const BASE_SHIPPING = [
  { id: "india_post", label: "India Post",    note: "5–7 business days" },
  { id: "dtdc",       label: "DTDC Courier",  note: "3–5 business days" },
];

const PAYMENT_METHODS = [
  { id: "upi", label: "UPI / GPay / PhonePe", icon: "📲" },
];

const PRODUCT = {
  name: "CASUAL WEAR COTTON FABRIC PRINT WORK SLITED CHURIDHAR SET",
  size: "L",
  price: 1280,
  qty: 1,
  emoji: "👗",
};

export default function Checkout() {
  const navigate = useNavigate();
  const { user, token, isLoggedIn } = useAuth();
  const { cartItems, cartTotal, cartCount } = useCart();

  const [form, setForm] = useState({
    email: "",
    fullName: "",
    houseName: "",
    street: "",
    place: "",
    postOffice: "",
    pinCode: "",
    city: "",
    district: "",
    state: "Kerala",
    country: "India",
    mobile1: "",
    mobile2: "",
    landmark: "",
    saveInfo: false,
    notes: "",
  });

  const [shippingRates, setShippingRates] = useState({ indiaPost: 0, dtdc: 49 });
  const [shipping, setShipping] = useState("india_post");
  const [payment, setPayment] = useState("upi");
  const [errors, setErrors] = useState({});
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placing, setPlacing] = useState(false);

  // UPI payment state
  const [upiApp, setUpiApp] = useState(null);           // "gpay" | "phonepe" | null
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState("");
  const [screenshotFilename, setScreenshotFilename] = useState("");
  const [screenshotUploading, setScreenshotUploading] = useState(false);
  const [screenshotError, setScreenshotError] = useState("");

  // Fetch dynamic shipping rates from backend
  useEffect(() => {
    fetch("http://localhost:5000/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setShippingRates(data.settings.shippingRates);
      })
      .catch(() => {}); // keep defaults on failure
  }, []);

  // Pre-fill email when logged in
  useEffect(() => {
    if (isLoggedIn && user?.email) {
      setForm((p) => ({ ...p, email: user.email, fullName: p.fullName || user.name }));
    }
  }, [isLoggedIn, user]);

  const SHIPPING_METHODS = [
    { id: "india_post", label: "India Post",   price: shippingRates.indiaPost, note: "5–7 business days" },
    { id: "dtdc",       label: "DTDC Courier", price: shippingRates.dtdc,      note: "3–5 business days" },
  ];

  const selectedShipping = SHIPPING_METHODS.find((m) => m.id === shipping);

  // Use real cart if items exist, else fall back to demo product
  const hasCart   = cartItems && cartItems.length > 0;
  const subtotal  = hasCart ? cartTotal : PRODUCT.price * PRODUCT.qty;
  const shippingCost = selectedShipping?.price ?? 0;
  const total     = subtotal + shippingCost;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const required = [
      "email", "fullName", "houseName", "street", "place",
      "postOffice", "pinCode", "city", "district", "mobile1",
    ];
    const newErrors = {};
    required.forEach((field) => {
      if (!form[field].trim()) newErrors[field] = "This field is required";
    });
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      newErrors.email = "Enter a valid email address";
    if (form.pinCode && !/^\d{6}$/.test(form.pinCode))
      newErrors.pinCode = "PIN Code must be 6 digits";
    if (form.mobile1 && !/^\d{10}$/.test(form.mobile1))
      newErrors.mobile1 = "Enter a valid 10-digit mobile number";
    if (form.mobile2 && !/^\d{10}$/.test(form.mobile2))
      newErrors.mobile2 = "Enter a valid 10-digit mobile number";
    return newErrors;
  };

  const handleScreenshot = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setScreenshotFile(file);
    setScreenshotPreview(URL.createObjectURL(file));
    setScreenshotError("");
    setScreenshotUploading(true);
    try {
      const result = await uploadScreenshot(file);
      if (result.success) setScreenshotFilename(result.filename);
      else setScreenshotError("Upload failed. Please try again.");
    } catch {
      setScreenshotError("Upload failed. Please check your connection.");
    } finally {
      setScreenshotUploading(false);
    }
  };

  const generateInvoicePDF = (orderItems, orderTotal, orderShippingCost, orderShipping) => {
    const doc   = new jsPDF();
    const gold  = [201, 164, 101];
    const black = [14, 14, 14];
    const gray  = [110, 110, 110];
    const lgray = [220, 220, 220];

    // ── Header background ──────────────────────────────
    doc.setFillColor(...gold);
    doc.rect(0, 0, 210, 42, "F");

    // Logo image (name.png)
    try {
      doc.addImage(nameImg, "PNG", 12, 6, 60, 18);
    } catch {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.setTextColor(...black);
      doc.text("MARC FASHION", 14, 20);
    }

    // Store info (right side of header)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...black);
    doc.text("Vellayani Junction, Nemom P.O, Pin 695020",   196, 10, { align: "right" });
    doc.text("Thiruvananthapuram, Kerala, India",            196, 16, { align: "right" });
    doc.text("+91 7907 858 891",                             196, 22, { align: "right" });
    doc.text("GST No: 32EBUPA0737B1Z4",                     196, 28, { align: "right" });
    doc.text("marcthefamilyfashion@gmail.com",               196, 34, { align: "right" });

    // INVOICE label
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(...black);
    doc.text("INVOICE", 196, 38, { align: "right" });

    // ── Date & Invoice number ──────────────────────────
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.8);
    doc.line(14, 48, 196, 48);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...gray);
    const dateStr = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });
    doc.text(`Date: ${dateStr}`, 14, 55);
    doc.text(`Payment: ${PAYMENT_METHODS.find((p) => p.id === payment)?.label}`, 196, 55, { align: "right" });

    // ── Bill To ────────────────────────────────────────
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...black);
    doc.text("BILL TO", 14, 65);

    doc.setDrawColor(...gold);
    doc.setLineWidth(0.4);
    doc.line(14, 67, 60, 67);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...black);
    doc.text(form.fullName, 14, 73);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...gray);
    doc.text(`${form.houseName}, ${form.street}`, 14, 79);
    doc.text(`${form.place}, ${form.postOffice}`, 14, 85);
    doc.text(`${form.city}, ${form.district}, ${form.state} - ${form.pinCode}`, 14, 91);
    doc.text(`Mobile: +91 ${form.mobile1}${form.mobile2 ? "  /  +91 " + form.mobile2 : ""}`, 14, 97);
    doc.text(`Email: ${form.email}`, 14, 103);

    // Shipping info right side
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...black);
    doc.text("SHIPPING VIA", 196, 65, { align: "right" });
    doc.setDrawColor(...gold);
    doc.line(150, 67, 196, 67);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...gray);
    doc.text(orderShipping || "Standard", 196, 73, { align: "right" });

    // ── Items Table ────────────────────────────────────
    const tY = 114;
    doc.setFillColor(...gold);
    doc.rect(14, tY - 7, 182, 10, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(...black);
    doc.text("ITEM",          16,  tY);
    doc.text("QTY",          112,  tY);
    doc.text("MRP",          130,  tY);
    doc.text("PRICE",        153,  tY);
    doc.text("TOTAL",        182,  tY);

    doc.setLineWidth(0.2);
    doc.setDrawColor(...lgray);

    let y = tY + 10;
    orderItems.forEach((item, idx) => {
      // Alternate row background
      if (idx % 2 === 0) {
        doc.setFillColor(250, 248, 244);
        doc.rect(14, y - 5, 182, 10, "F");
      }

      const name = item.name.length > 58 ? item.name.slice(0, 55) + "..." : item.name;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...black);
      doc.text(name, 16, y);

      doc.setTextColor(...gray);
      doc.text(String(item.qty), 114, y);

      // MRP — strikethrough if exists
      if (item.oldPrice) {
        doc.setTextColor(160, 160, 160);
        doc.text(`Rs.${item.oldPrice.toLocaleString("en-IN")}`, 130, y);
        // strikethrough line
        const mrpW = doc.getTextWidth(`Rs.${item.oldPrice.toLocaleString("en-IN")}`);
        doc.setDrawColor(160, 160, 160);
        doc.setLineWidth(0.3);
        doc.line(130, y - 1, 130 + mrpW, y - 1);
      } else {
        doc.setTextColor(...gray);
        doc.text("—", 133, y);
      }

      doc.setTextColor(...black);
      doc.setFont("helvetica", "bold");
      doc.text(`Rs.${item.price.toLocaleString("en-IN")}`, 153, y);

      doc.setFont("helvetica", "normal");
      doc.text(`Rs.${(item.price * item.qty).toLocaleString("en-IN")}`, 182, y);

      doc.setDrawColor(...lgray);
      doc.setLineWidth(0.2);
      doc.line(14, y + 4, 196, y + 4);
      y += 12;
    });

    // ── Totals ─────────────────────────────────────────
    y += 4;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...gray);
    doc.text("Subtotal:", 148, y);
    doc.text(`Rs.${(orderTotal - orderShippingCost).toLocaleString("en-IN")}`, 196, y, { align: "right" });

    y += 8;
    doc.text(`Shipping (${orderShipping}):`, 148, y);
    doc.text(orderShippingCost === 0 ? "FREE" : `Rs.${orderShippingCost}`, 196, y, { align: "right" });

    y += 8;
    doc.text("GST:", 148, y);
    doc.text("Included", 196, y, { align: "right" });

    // Total box
    y += 6;
    doc.setFillColor(...gold);
    doc.rect(130, y, 66, 13, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...black);
    doc.text("TOTAL:", 135, y + 9);
    doc.text(`Rs.${orderTotal.toLocaleString("en-IN")}`, 194, y + 9, { align: "right" });

    // ── Footer ─────────────────────────────────────────
    doc.setFillColor(...gold);
    doc.rect(0, 275, 210, 22, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...black);
    doc.text("Thank you for shopping with MARC Family Fashion!", 105, 283, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.text("Vellayani Jn., Nemom P.O, Pin 695020, Thiruvananthapuram  |  +91 7907 858 891  |  GST: 32EBUPA0737B1Z4", 105, 290, { align: "center" });

    doc.save(`MARC-Invoice-${form.fullName.replace(/\s+/g, "-")}.pdf`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstError = document.querySelector(`.${styles.errorMsg}`);
      firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    // Save order to backend if logged in
    if (isLoggedIn && token) {
      setPlacing(true);
      const items = hasCart
        ? cartItems.map((i) => ({
            productId: i._id || i.id,
            name:      i.name,
            price:     i.price,
            oldPrice:  i.oldPrice || null,
            qty:       i.qty,
            image:     i.image || null,
            size:      i.selectedSize || null,
            color:     i.selectedColor || null,
          }))
        : [{ productId: "demo", name: PRODUCT.name, price: PRODUCT.price, qty: PRODUCT.qty, size: PRODUCT.size }];

      await placeOrder(token, {
        items,
        shipping: {
          name:    form.fullName,
          address: `${form.houseName}, ${form.street}, ${form.place}, ${form.postOffice}`,
          city:    form.city,
          state:   form.state,
          pin:     form.pinCode,
          mobile:  form.mobile1,
        },
        total,
        shippingCost,
        shippingMethod:    selectedShipping?.label,
        paymentMethod:     PAYMENT_METHODS.find((p) => p.id === payment)?.label,
        paymentScreenshot: screenshotFilename || undefined,
      }).catch(() => {}); // silent fail — still show success UI
      setPlacing(false);
    }

    setOrderPlaced(true);

    // Generate & download invoice PDF
    const invoiceItems = hasCart
      ? cartItems.map((i) => ({ name: i.name, price: i.price, qty: i.qty, oldPrice: i.oldPrice || null }))
      : [{ name: PRODUCT.name, price: PRODUCT.price, qty: PRODUCT.qty, oldPrice: null }];
    generateInvoicePDF(invoiceItems, total, shippingCost, selectedShipping?.label);

    // Send WhatsApp notification to store owner
    const itemList = hasCart
      ? cartItems.map((i) => `  • ${i.name} (Qty: ${i.qty}) — ₹${(i.price * i.qty).toLocaleString("en-IN")}`).join("\n")
      : `  • ${PRODUCT.name} (Qty: ${PRODUCT.qty}) — ₹${(PRODUCT.price * PRODUCT.qty).toLocaleString("en-IN")}`;

    const waMsg =
      `🛍️ *NEW ORDER - MARC FASHION*\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `👤 *Customer:* ${form.fullName}\n` +
      `📧 *Email:* ${form.email}\n` +
      `📱 *Mobile:* +91 ${form.mobile1}${form.mobile2 ? ` / +91 ${form.mobile2}` : ""}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🛒 *Items Ordered:*\n${itemList}\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `📦 *Shipping Address:*\n` +
      `  ${form.houseName}, ${form.street},\n` +
      `  ${form.place}, ${form.postOffice},\n` +
      `  ${form.city}, ${form.district},\n` +
      `  ${form.state} - ${form.pinCode}\n` +
      (form.landmark ? `  Landmark: ${form.landmark}\n` : "") +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `🚚 *Shipping:* ${selectedShipping?.label}${shippingCost > 0 ? ` (₹${shippingCost})` : " (FREE)"}\n` +
      `💳 *Payment:* ${PAYMENT_METHODS.find((p) => p.id === payment)?.label}\n` +
      `💰 *Total: ₹${total.toLocaleString("en-IN")}.00*\n` +
      (screenshotFilename
        ? `🖼️ *Payment Screenshot:* http://localhost:5000/uploads/${screenshotFilename}\n`
        : "") +
      (form.notes ? `📝 *Notes:* ${form.notes}\n` : "") +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `✅ Please confirm & process this order.`;

    window.open(
      `https://wa.me/917907858891?text=${encodeURIComponent(waMsg)}`,
      "_blank"
    );
  };

  if (orderPlaced) {
    return (
      <div className={styles.successOverlay}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>✅</div>
          <h2 className={styles.successTitle}>Order Placed Successfully!</h2>
          <p className={styles.successMsg}>
            Thank you, <strong>{form.fullName}</strong>! Your order has been confirmed.
            <br />A confirmation will be sent to <strong>{form.email}</strong>.
          </p>
          <div className={styles.successDetails}>
            <div className={styles.successRow}>
              <span>Order Total</span>
              <span className={styles.successAmount}>₹{total.toLocaleString("en-IN")}.00</span>
            </div>
            <div className={styles.successRow}>
              <span>Shipping via</span>
              <span>{selectedShipping?.label}</span>
            </div>
            <div className={styles.successRow}>
              <span>Payment</span>
              <span>{PAYMENT_METHODS.find((p) => p.id === payment)?.label}</span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
            <button className={styles.successBtn} onClick={() => navigate("/")}>
              Continue Shopping
            </button>
            {isLoggedIn && (
              <button className={styles.successBtn} style={{ background: "var(--dark)" }} onClick={() => navigate("/profile")}>
                View My Orders
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div className={styles.headerTitle}>
          <span className={styles.brandName}>MARC FASHION</span>
          <span className={styles.headerSub}>Secure Checkout</span>
        </div>
        <div className={styles.secureTag}>🔒 SSL Secured</div>
      </div>

      {/* ── Progress Steps ── */}
      <div className={styles.steps}>
        <div className={`${styles.step} ${styles.stepActive}`}>
          <span className={styles.stepNum}>1</span>
          <span className={styles.stepLabel}>Address</span>
        </div>
        <div className={styles.stepLine} />
        <div className={`${styles.step} ${styles.stepActive}`}>
          <span className={styles.stepNum}>2</span>
          <span className={styles.stepLabel}>Shipping</span>
        </div>
        <div className={styles.stepLine} />
        <div className={`${styles.step} ${styles.stepActive}`}>
          <span className={styles.stepNum}>3</span>
          <span className={styles.stepLabel}>Payment</span>
        </div>
      </div>

      <form className={styles.layout} onSubmit={handleSubmit} noValidate>
        {/* ══════════════════ LEFT COLUMN ══════════════════ */}
        <div className={styles.leftCol}>

          {/* ── Section 1: Shipping Address ── */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardIcon}>📦</span>
              <h2 className={styles.cardTitle}>Shipping Address &amp; Billing Details</h2>
            </div>

            {/* Email */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                Email Address <span className={styles.req}>*</span>
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
              />
              {errors.email && <span className={styles.errorMsg}>{errors.email}</span>}
            </div>

            {/* Full Name */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                Full Name <span className={styles.req}>*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="As on ID / Aadhaar"
                className={`${styles.input} ${errors.fullName ? styles.inputError : ""}`}
              />
              {errors.fullName && <span className={styles.errorMsg}>{errors.fullName}</span>}
            </div>

            {/* House Name / Number */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                House Name / House Number <span className={styles.req}>*</span>
              </label>
              <input
                type="text"
                name="houseName"
                value={form.houseName}
                onChange={handleChange}
                placeholder="e.g. Sunrise Villa / 12B"
                className={`${styles.input} ${errors.houseName ? styles.inputError : ""}`}
              />
              {errors.houseName && <span className={styles.errorMsg}>{errors.houseName}</span>}
            </div>

            {/* Street */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                Street / Line / Road <span className={styles.req}>*</span>
              </label>
              <input
                type="text"
                name="street"
                value={form.street}
                onChange={handleChange}
                placeholder="e.g. MG Road, Near Bus Stand"
                className={`${styles.input} ${errors.street ? styles.inputError : ""}`}
              />
              {errors.street && <span className={styles.errorMsg}>{errors.street}</span>}
            </div>

            {/* Place + Post Office */}
            <div className={styles.row2}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  Place <span className={styles.req}>*</span>
                </label>
                <input
                  type="text"
                  name="place"
                  value={form.place}
                  onChange={handleChange}
                  placeholder="e.g. Thrissur"
                  className={`${styles.input} ${errors.place ? styles.inputError : ""}`}
                />
                {errors.place && <span className={styles.errorMsg}>{errors.place}</span>}
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  Post Office <span className={styles.req}>*</span>
                </label>
                <input
                  type="text"
                  name="postOffice"
                  value={form.postOffice}
                  onChange={handleChange}
                  placeholder="e.g. Ollur P.O."
                  className={`${styles.input} ${errors.postOffice ? styles.inputError : ""}`}
                />
                {errors.postOffice && <span className={styles.errorMsg}>{errors.postOffice}</span>}
              </div>
            </div>

            {/* PIN Code + City */}
            <div className={styles.row2}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  PIN Code / Postcode <span className={styles.req}>*</span>
                </label>
                <input
                  type="text"
                  name="pinCode"
                  value={form.pinCode}
                  onChange={handleChange}
                  placeholder="6-digit PIN"
                  maxLength={6}
                  className={`${styles.input} ${errors.pinCode ? styles.inputError : ""}`}
                />
                {errors.pinCode && <span className={styles.errorMsg}>{errors.pinCode}</span>}
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  City <span className={styles.req}>*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="e.g. Thrissur"
                  className={`${styles.input} ${errors.city ? styles.inputError : ""}`}
                />
                {errors.city && <span className={styles.errorMsg}>{errors.city}</span>}
              </div>
            </div>

            {/* District */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                District <span className={styles.req}>*</span>
              </label>
              <input
                type="text"
                name="district"
                value={form.district}
                onChange={handleChange}
                placeholder="e.g. Thrissur"
                className={`${styles.input} ${errors.district ? styles.inputError : ""}`}
              />
              {errors.district && <span className={styles.errorMsg}>{errors.district}</span>}
            </div>

            {/* State + Country */}
            <div className={styles.row2}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>State</label>
                <select
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  className={styles.select}
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Country</label>
                <select
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  className={styles.select}
                >
                  <option value="India">India</option>
                </select>
              </div>
            </div>

            {/* Mobile Numbers */}
            <div className={styles.row2}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  Mobile No 1 <span className={styles.req}>*</span>
                </label>
                <div className={`${styles.phoneWrap} ${errors.mobile1 ? styles.inputError : ""}`}>
                  <span className={styles.phonePrefix}>+91</span>
                  <input
                    type="tel"
                    name="mobile1"
                    value={form.mobile1}
                    onChange={handleChange}
                    placeholder="10-digit number"
                    maxLength={10}
                    className={styles.phoneInput}
                  />
                </div>
                {errors.mobile1 && <span className={styles.errorMsg}>{errors.mobile1}</span>}
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>
                  Mobile No 2 <span className={styles.optional}>(optional)</span>
                </label>
                <div className={`${styles.phoneWrap} ${errors.mobile2 ? styles.inputError : ""}`}>
                  <span className={styles.phonePrefix}>+91</span>
                  <input
                    type="tel"
                    name="mobile2"
                    value={form.mobile2}
                    onChange={handleChange}
                    placeholder="10-digit number"
                    maxLength={10}
                    className={styles.phoneInput}
                  />
                </div>
                {errors.mobile2 && <span className={styles.errorMsg}>{errors.mobile2}</span>}
              </div>
            </div>

            {/* Landmark */}
            <div className={styles.fieldGroup}>
              <label className={styles.label}>
                Landmark <span className={styles.optional}>(optional)</span>
              </label>
              <input
                type="text"
                name="landmark"
                value={form.landmark}
                onChange={handleChange}
                placeholder="e.g. Near SBI ATM, Opposite Temple"
                className={styles.input}
              />
            </div>

            {/* Save Info Checkbox */}
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="saveInfo"
                checked={form.saveInfo}
                onChange={handleChange}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>
                Create account and save this information for next time
              </span>
            </label>

            {/* Customer Notes */}
            <div className={styles.fieldGroup} style={{ marginTop: "1.25rem" }}>
              <label className={styles.label}>
                Customer Notes <span className={styles.optional}>(optional)</span>
              </label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Any special instructions or notes for your order..."
                rows={3}
                className={styles.textarea}
              />
            </div>
          </div>

          {/* ── Section 2: Shipping Method ── */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardIcon}>🚚</span>
              <h2 className={styles.cardTitle}>Shipping Method</h2>
            </div>
            <div className={styles.shippingList}>
              {SHIPPING_METHODS.map((method) => (
                <label
                  key={method.id}
                  className={`${styles.shippingOption} ${
                    shipping === method.id ? styles.shippingSelected : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="shipping"
                    value={method.id}
                    checked={shipping === method.id}
                    onChange={() => setShipping(method.id)}
                    className={styles.radioInput}
                  />
                  <div className={styles.shippingInfo}>
                    <span className={styles.shippingLabel}>{method.label}</span>
                    <span className={styles.shippingNote}>{method.note}</span>
                  </div>
                  <span className={styles.shippingPrice}>
                    {method.price === 0
                      ? <span className={styles.freeTag}>FREE</span>
                      : `₹${method.price}.00`}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* ── Section 3: Payment Method ── */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.cardIcon}>💳</span>
              <h2 className={styles.cardTitle}>Payment Method</h2>
            </div>
            <div className={styles.paymentList}>
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method.id}
                  className={`${styles.paymentOption} ${
                    payment === method.id ? styles.paymentSelected : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method.id}
                    checked={payment === method.id}
                    onChange={() => setPayment(method.id)}
                    className={styles.radioInput}
                  />
                  <span className={styles.paymentIcon}>{method.icon}</span>
                  <span className={styles.paymentLabel}>{method.label}</span>
                  {payment === method.id && (
                    <span className={styles.selectedBadge}>Selected</span>
                  )}
                </label>
              ))}
            </div>

            {payment === "upi" && (
              <div className={styles.upiSection}>
                {/* Step 1 — choose app */}
                <p className={styles.upiStep}>Step 1 — Choose your payment app</p>
                <div className={styles.upiAppBtns}>
                  <button
                    type="button"
                    className={`${styles.upiAppBtn} ${upiApp === "gpay" ? styles.upiAppActive : ""}`}
                    onClick={() => setUpiApp("gpay")}
                  >
                    <span className={styles.upiAppIcon}>G</span>
                    <span>GPay</span>
                  </button>
                  <button
                    type="button"
                    className={`${styles.upiAppBtn} ${upiApp === "phonepe" ? styles.upiAppActive : ""}`}
                    onClick={() => setUpiApp("phonepe")}
                  >
                    <span className={styles.upiAppIcon} style={{ background: "#5f259f" }}>Pe</span>
                    <span>PhonePe</span>
                  </button>
                </div>

                {/* Step 2 — QR + UPI ID */}
                {upiApp && (
                  <div className={styles.qrSection}>
                    <p className={styles.upiStep}>Step 2 — Scan QR &amp; Pay</p>
                    <div className={styles.qrBox}>
                      <img
                        src="/qr.jpeg"
                        alt="UPI QR Code"
                        className={styles.qrImg}
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                      <div className={styles.qrPlaceholder} style={{ display: "none" }}>
                        <span style={{ fontSize: "2.5rem" }}>📷</span>
                        <span style={{ fontSize: "0.8rem", color: "#888", marginTop: 8 }}>
                          QR image load aagavilai
                        </span>
                      </div>
                    </div>
                    <p className={styles.upiIdDisplay}>
                      UPI ID: <strong>9633633733@ybl</strong>
                      {/* 👆 Replace with your actual UPI ID */}
                    </p>
                    <p className={styles.upiIdSub}>
                      Open {upiApp === "gpay" ? "Google Pay" : "PhonePe"}, scan the QR or enter the UPI ID above, and pay ₹{total.toLocaleString("en-IN")}.00
                    </p>

                    {/* Step 3 — Upload screenshot */}
                    <p className={styles.upiStep}>Step 3 — Upload Payment Screenshot</p>
                    <label className={styles.screenshotUpload}>
                      {screenshotPreview ? (
                        <img src={screenshotPreview} alt="Payment proof" className={styles.screenshotPreview} />
                      ) : (
                        <div className={styles.uploadPlaceholder}>
                          <span style={{ fontSize: "2rem" }}>📤</span>
                          <span>Click to upload payment screenshot</span>
                          <span className={styles.uploadHint}>PNG, JPG up to 5 MB</span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleScreenshot}
                        style={{ display: "none" }}
                      />
                    </label>

                    {screenshotUploading && (
                      <p className={styles.screenshotStatus} style={{ color: "#C9A465" }}>
                        ⏳ Uploading…
                      </p>
                    )}
                    {screenshotError && (
                      <p className={styles.screenshotStatus} style={{ color: "#e74c3c" }}>
                        ❌ {screenshotError}
                      </p>
                    )}
                    {screenshotFile && !screenshotUploading && !screenshotError && (
                      <p className={styles.screenshotStatus} style={{ color: "#27ae60" }}>
                        ✅ Screenshot uploaded — you can now place your order
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* ── Mobile Order Summary (shown below form on small screens) ── */}
          <div className={styles.mobileSummary}>
            <MobileOrderSummary
              subtotal={subtotal}
              shippingCost={shippingCost}
              total={total}
              shippingLabel={selectedShipping?.label}
            />
          </div>

          {/* ── Place Order Button (mobile) ── */}
          {(() => {
            const needsScreenshot = payment === "upi" && !screenshotFile;
            return (
              <button
                type="submit"
                className={`${styles.placeOrderBtn} ${styles.mobilePlaceBtn}`}
                disabled={placing || needsScreenshot || screenshotUploading}
                style={needsScreenshot ? { opacity: 0.5, cursor: "not-allowed" } : {}}
              >
                {placing
                  ? "Placing Order…"
                  : needsScreenshot
                  ? "📷 Upload Screenshot to Continue"
                  : `🔒 Place Order · ₹${total.toLocaleString("en-IN")}.00`}
              </button>
            );
          })()}
        </div>

        {/* ══════════════════ RIGHT COLUMN ══════════════════ */}
        <div className={styles.rightCol}>
          <div className={styles.stickyRight}>

            {/* ── Order Summary Card ── */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.cardIcon}>🛍️</span>
                <h2 className={styles.cardTitle}>Order Summary</h2>
                <span className={styles.itemCount}>1 item</span>
              </div>

              {/* Product Row */}
              <div className={styles.productRow}>
                <div className={styles.productEmoji}>{PRODUCT.emoji}</div>
                <div className={styles.productInfo}>
                  <p className={styles.productName}>
                    {PRODUCT.name}
                    <span className={styles.sizeTag}> ({PRODUCT.size})</span>
                  </p>
                  <p className={styles.productMeta}>Qty: {PRODUCT.qty}</p>
                </div>
                <div className={styles.productPrice}>
                  ₹{(PRODUCT.price * PRODUCT.qty).toLocaleString("en-IN")}.00
                </div>
              </div>

              {/* Coupon */}
              <div className={styles.couponRow}>
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  className={styles.couponInput}
                />
                <button type="button" className={styles.couponBtn}>Apply</button>
              </div>

              {/* Price Breakdown */}
              <div className={styles.priceBreakdown}>
                <div className={styles.priceRow}>
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}.00</span>
                </div>
                <div className={styles.priceRow}>
                  <span>Shipping ({selectedShipping?.label})</span>
                  <span>
                    {shippingCost === 0
                      ? <span className={styles.freeTag}>FREE</span>
                      : `₹${shippingCost}.00`}
                  </span>
                </div>
                <div className={styles.priceRow}>
                  <span>Tax (GST included)</span>
                  <span className={styles.taxNote}>Included</span>
                </div>
              </div>

              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>Total</span>
                <span className={styles.totalAmount}>
                  ₹{total.toLocaleString("en-IN")}.00
                </span>
              </div>

              {/* Place Order Button (desktop) */}
              {(() => {
                const needsScreenshot = payment === "upi" && !screenshotFile;
                return (
                  <button
                    type="submit"
                    className={styles.placeOrderBtn}
                    disabled={placing || needsScreenshot || screenshotUploading}
                    style={needsScreenshot ? { opacity: 0.5, cursor: "not-allowed" } : {}}
                  >
                    {placing
                      ? "Placing Order…"
                      : needsScreenshot
                      ? "📷 Upload Screenshot First"
                      : "🔒 Place Order"}
                  </button>
                );
              })()}

              <p className={styles.secureNote}>
                🔐 Your personal &amp; payment data is 100% secure
              </p>
            </div>

            {/* ── Trust Badges ── */}
            <div className={styles.trustCard}>
              <div className={styles.trustItem}>
                <span className={styles.trustIcon}>🔒</span>
                <div>
                  <strong>Secure Payment</strong>
                  <p>256-bit SSL encryption</p>
                </div>
              </div>
              <div className={styles.trustItem}>
                <span className={styles.trustIcon}>↩️</span>
                <div>
                  <strong>Easy Returns</strong>
                  <p>7-day hassle-free returns</p>
                </div>
              </div>
              <div className={styles.trustItem}>
                <span className={styles.trustIcon}>✅</span>
                <div>
                  <strong>100% Authentic</strong>
                  <p>Genuine Marc Fashion products</p>
                </div>
              </div>
              <div className={styles.trustItem}>
                <span className={styles.trustIcon}>🚚</span>
                <div>
                  <strong>Free Shipping</strong>
                  <p>via India Post on this order</p>
                </div>
              </div>
            </div>

            {/* ── Payment Logos ── */}
            <div className={styles.paymentLogos}>
              <span className={styles.logoTag}>UPI</span>
              <span className={styles.logoTag}>Visa</span>
              <span className={styles.logoTag}>Mastercard</span>
              <span className={styles.logoTag}>RuPay</span>
              <span className={styles.logoTag}>Net Banking</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

function MobileOrderSummary({ subtotal, shippingCost, total, shippingLabel }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.cardIcon}>🛍️</span>
        <h2 className={styles.cardTitle}>Order Summary</h2>
      </div>
      <div className={styles.priceBreakdown}>
        <div className={styles.priceRow}>
          <span>Subtotal</span>
          <span>₹{subtotal.toLocaleString("en-IN")}.00</span>
        </div>
        <div className={styles.priceRow}>
          <span>Shipping ({shippingLabel})</span>
          <span>
            {shippingCost === 0
              ? <span className={styles.freeTag}>FREE</span>
              : `₹${shippingCost}.00`}
          </span>
        </div>
      </div>
      <div className={styles.totalRow}>
        <span className={styles.totalLabel}>Total</span>
        <span className={styles.totalAmount}>₹{total.toLocaleString("en-IN")}.00</span>
      </div>
    </div>
  );
}
