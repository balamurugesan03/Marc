const router      = require("express").Router();
const jwt         = require("jsonwebtoken");
const Customer    = require("../models/Customer");
const Order       = require("../models/Order");
const customerAuth = require("../middleware/customerAuth");
const adminAuth   = require("../middleware/auth");
const { sendMail } = require("../middleware/mailer");
const upload      = require("../middleware/upload");
const multer      = require("multer");
const path        = require("path");
const fs          = require("fs");

// PDF-specific multer (no image filter)
const invoiceDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(invoiceDir)) fs.mkdirSync(invoiceDir, { recursive: true });
const pdfUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, invoiceDir),
    filename: (req, file, cb) => {
      const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, "invoice-" + unique + ".pdf");
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const sign = (customer) =>
  jwt.sign(
    { customerId: customer._id, email: customer.email, name: customer.name },
    process.env.JWT_SECRET || "marc_secret",
    { expiresIn: "7d" }
  );

const safeCustomer = (c) => ({ id: c._id, name: c.name, email: c.email });

// ── POST /api/customers/register ─────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: "All fields are required" });
    if (password.length < 6)
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });

    const exists = await Customer.findOne({ email });
    if (exists)
      return res.status(409).json({ success: false, message: "Email is already registered" });

    const customer = new Customer({ name, email, password });
    await customer.save();
    res.status(201).json({ success: true, token: sign(customer), customer: safeCustomer(customer) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/customers/login ─────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password required" });

    const customer = await Customer.findOne({ email });
    if (!customer || !(await customer.comparePassword(password)))
      return res.status(401).json({ success: false, message: "Invalid email or password" });

    res.json({ success: true, token: sign(customer), customer: safeCustomer(customer) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/customers/me ─────────────────────────────────────────
router.get("/me", customerAuth, async (req, res) => {
  try {
    const customer = await Customer.findById(req.customer.customerId).select("-password");
    if (!customer)
      return res.status(404).json({ success: false, message: "Customer not found" });
    res.json({ success: true, customer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/customers/orders ─────────────────────────────────────
router.get("/orders", customerAuth, async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.customer.customerId }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/customers/upload-screenshot ─────────────────────────
// Accepts a payment screenshot image and stores it; returns the filename.
router.post(
  "/upload-screenshot",
  upload.single("screenshot"),
  (req, res) => {
    if (!req.file)
      return res.status(400).json({ success: false, message: "No file uploaded" });
    res.json({ success: true, filename: req.file.filename });
  }
);

// ── POST /api/customers/upload-invoice ────────────────────────────
// Accepts a PDF invoice and stores it; returns a public URL.
router.post(
  "/upload-invoice",
  pdfUpload.single("invoice"),
  (req, res) => {
    if (!req.file)
      return res.status(400).json({ success: false, message: "No file uploaded" });
    const url = `http://localhost:5000/uploads/${req.file.filename}`;
    res.json({ success: true, url });
  }
);

// ── POST /api/customers/orders ────────────────────────────────────
router.post("/orders", customerAuth, async (req, res) => {
  try {
    const { items, shipping, total, shippingCost, shippingMethod, paymentMethod, paymentScreenshot } = req.body;
    if (!items?.length || !total)
      return res.status(400).json({ success: false, message: "Items and total are required" });

    const order = new Order({
      customer: req.customer.customerId,
      items, shipping, total, shippingCost, shippingMethod, paymentMethod,
      ...(paymentScreenshot && { paymentScreenshot }),
    });
    await order.save();

    // Auto-send invoice email to customer
    try {
      const populated = await Order.findById(order._id).populate("customer", "name email");
      if (populated?.customer?.email) {
        await sendMail(
          populated.customer.email,
          `Order Confirmed – MARC Fashion #${order.orderNumber}`,
          generateInvoiceHTML(populated)
        );
      }
    } catch (mailErr) {
      console.warn("Invoice email failed (non-fatal):", mailErr.message);
    }

    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════
// ADMIN ROUTES — NOTE: specific paths MUST come before /:id
// ══════════════════════════════════════════════════════════════════

// ── GET /api/customers/admin/stats ─ dashboard stats (MUST be before /admin/:id)
router.get("/admin/stats", adminAuth, async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    const totalOrders    = await Order.countDocuments();
    const revenueAgg     = await Order.aggregate([
      { $match: { status: { $ne: "Cancelled" } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);
    const pendingOrders = await Order.countDocuments({ status: "Processing" });

    res.json({
      success: true,
      stats: {
        totalCustomers,
        totalOrders,
        revenue: revenueAgg[0]?.total || 0,
        pendingOrders,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/customers/admin/all ─ all customers with order stats
router.get("/admin/all", adminAuth, async (req, res) => {
  try {
    const { search, status } = req.query;
    const filter = {};
    if (search) filter.$or = [
      { email: { $regex: search, $options: "i" } },
      { name:  { $regex: search, $options: "i" } },
    ];
    if (status === "blocked") filter.isBlocked = true;
    if (status === "active")  filter.isBlocked = false;

    const customers = await Customer.find(filter).select("-password").sort({ createdAt: -1 });

    const withCounts = await Promise.all(
      customers.map(async (c) => {
        const orderCount = await Order.countDocuments({ customer: c._id });
        const spent = await Order.aggregate([
          { $match: { customer: c._id } },
          { $group: { _id: null, total: { $sum: "$total" } } },
        ]);
        return { ...c.toObject(), orderCount, totalSpent: spent[0]?.total || 0 };
      })
    );

    res.json({ success: true, customers: withCounts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── GET /api/customers/admin/orders ─ all orders with customer info
router.get("/admin/orders", adminAuth, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && status !== "all") filter.status = status;

    const orders = await Order.find(filter)
      .populate("customer", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PUT /api/customers/admin/orders/:id ─ update order status + tracking
router.put("/admin/orders/:id", adminAuth, async (req, res) => {
  try {
    const { status, trackingNumber } = req.body;
    const validStatuses = ["Processing", "Shipped", "Delivered", "Cancelled"];
    if (!validStatuses.includes(status))
      return res.status(400).json({ success: false, message: "Invalid status" });

    const update = { status };
    if (trackingNumber !== undefined) update.trackingNumber = trackingNumber;

    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate("customer", "name email");

    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    // Auto-send shipping notification email when status set to Shipped
    if (status === "Shipped" && order.customer?.email) {
      try {
        await sendMail(
          order.customer.email,
          `Your MARC Fashion Order Has Shipped! 🚚 #${order.orderNumber}`,
          generateShippingHTML(order)
        );
      } catch (mailErr) {
        console.warn("Shipping email failed (non-fatal):", mailErr.message);
      }
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/customers/admin/orders/:id/email ─ send invoice to customer
router.post("/admin/orders/:id/email", adminAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("customer", "name email");
    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });
    if (!order.customer?.email)
      return res.status(400).json({ success: false, message: "Customer email not found" });

    await sendMail(
      order.customer.email,
      `Your MARC Fashion Invoice – #${order.orderNumber}`,
      generateInvoiceHTML(order)
    );

    res.json({ success: true, message: `Invoice emailed to ${order.customer.email}` });
  } catch (err) {
    console.error("Email error:", err);
    res.status(500).json({ success: false, message: "Failed to send email: " + err.message });
  }
});

// ── GET /api/customers/admin/:id ─ single customer with orders (MUST be after specific routes)
router.get("/admin/:id", adminAuth, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).select("-password");
    if (!customer)
      return res.status(404).json({ success: false, message: "User not found" });

    const orders    = await Order.find({ customer: customer._id }).sort({ createdAt: -1 });
    const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);

    res.json({
      success: true,
      customer: { ...customer.toObject(), orderCount: orders.length, totalSpent },
      orders,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PUT /api/customers/admin/:id/toggle-block
router.put("/admin/:id/toggle-block", adminAuth, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer)
      return res.status(404).json({ success: false, message: "User not found" });

    customer.isBlocked = !customer.isBlocked;
    await customer.save();
    res.json({ success: true, isBlocked: customer.isBlocked, message: customer.isBlocked ? "User blocked" : "User unblocked" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── DELETE /api/customers/admin/:id
router.delete("/admin/:id", adminAuth, async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer)
      return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════
// INVOICE HTML GENERATOR
// ══════════════════════════════════════════════════════════════════
function generateInvoiceHTML(order) {
  const itemRows = order.items.map((item) => `
    <tr>
      <td style="padding:10px 14px;border-bottom:1px solid #eee;">${item.name}${item.size ? ` <span style="color:#999;font-size:12px;">(${item.size})</span>` : ""}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #eee;text-align:center;">${item.qty}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #eee;text-align:right;">₹${Number(item.price).toLocaleString("en-IN")}</td>
      <td style="padding:10px 14px;border-bottom:1px solid #eee;text-align:right;font-weight:600;">₹${(item.qty * item.price).toLocaleString("en-IN")}</td>
    </tr>
  `).join("");

  const subtotal   = order.items.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping   = order.shippingCost || 0;
  const grandTotal = subtotal + shipping;
  const date       = new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

      <!-- Header -->
      <tr>
        <td style="background:#0e0e0e;padding:28px 32px;text-align:center;">
          <h1 style="margin:0;color:#C9A465;font-size:26px;letter-spacing:4px;">MARC FASHION</h1>
          <p style="margin:4px 0 0;color:rgba(255,255,255,0.45);font-size:12px;letter-spacing:2px;text-transform:uppercase;">Order Invoice</p>
        </td>
      </tr>

      <!-- Order info -->
      <tr>
        <td style="padding:24px 32px;background:#fafafa;border-bottom:1px solid #eee;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <p style="margin:0 0 4px;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px;">Order Number</p>
                <p style="margin:0;font-size:18px;font-weight:700;color:#C9A465;font-family:Georgia,serif;">${order.orderNumber}</p>
              </td>
              <td style="text-align:right;">
                <p style="margin:0 0 4px;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px;">Date</p>
                <p style="margin:0;font-size:14px;font-weight:600;color:#333;">${date}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Greeting -->
      <tr>
        <td style="padding:28px 32px 8px;">
          <p style="margin:0;font-size:15px;color:#333;">Dear <strong>${order.customer.name}</strong>,</p>
          <p style="margin:8px 0 0;font-size:14px;color:#666;line-height:1.6;">Thank you for shopping with MARC Fashion! Your order has been confirmed and is being processed.</p>
        </td>
      </tr>

      <!-- Shipping address -->
      <tr>
        <td style="padding:16px 32px 24px;">
          <h3 style="margin:0 0 10px;font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#999;">Shipping Address</h3>
          <div style="background:#f9f6f1;border-left:3px solid #C9A465;padding:14px 16px;border-radius:4px;font-size:14px;color:#444;line-height:1.8;">
            <strong>${order.shipping.name}</strong><br>
            ${order.shipping.address}<br>
            ${order.shipping.city}, ${order.shipping.state} – ${order.shipping.pin}<br>
            📱 ${order.shipping.mobile}
          </div>
        </td>
      </tr>

      <!-- Items table -->
      <tr>
        <td style="padding:0 32px 24px;">
          <h3 style="margin:0 0 12px;font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#999;">Order Items</h3>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border:1px solid #eee;border-radius:8px;overflow:hidden;">
            <thead>
              <tr style="background:#0e0e0e;">
                <th style="padding:10px 14px;text-align:left;font-size:11px;color:#C9A465;text-transform:uppercase;letter-spacing:1px;">Product</th>
                <th style="padding:10px 14px;text-align:center;font-size:11px;color:#C9A465;text-transform:uppercase;letter-spacing:1px;">Qty</th>
                <th style="padding:10px 14px;text-align:right;font-size:11px;color:#C9A465;text-transform:uppercase;letter-spacing:1px;">Rate</th>
                <th style="padding:10px 14px;text-align:right;font-size:11px;color:#C9A465;text-transform:uppercase;letter-spacing:1px;">Amount</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
          </table>
        </td>
      </tr>

      <!-- Totals -->
      <tr>
        <td style="padding:0 32px 28px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#666;">Subtotal</td>
              <td style="padding:6px 0;font-size:13px;color:#333;text-align:right;">₹${subtotal.toLocaleString("en-IN")}</td>
            </tr>
            <tr>
              <td style="padding:6px 0;font-size:13px;color:#666;">Shipping (${order.shippingMethod || "Standard"})</td>
              <td style="padding:6px 0;font-size:13px;color:#333;text-align:right;">${shipping === 0 ? '<span style="color:#27ae60;font-weight:600;">FREE</span>' : `₹${shipping.toLocaleString("en-IN")}`}</td>
            </tr>
            <tr>
              <td colspan="2" style="border-top:2px solid #C9A465;padding-top:10px;"></td>
            </tr>
            <tr>
              <td style="font-size:16px;font-weight:700;color:#0e0e0e;font-family:Georgia,serif;">Grand Total</td>
              <td style="font-size:18px;font-weight:700;color:#C9A465;text-align:right;font-family:Georgia,serif;">₹${grandTotal.toLocaleString("en-IN")}</td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Payment & Shipping method -->
      <tr>
        <td style="padding:0 32px 28px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="background:#f9f6f1;border-radius:8px;padding:14px 16px;">
                <p style="margin:0 0 6px;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px;">Payment Method</p>
                <p style="margin:0;font-size:14px;font-weight:600;color:#333;">💳 ${order.paymentMethod || "—"}</p>
              </td>
              <td width="16"></td>
              <td style="background:#f9f6f1;border-radius:8px;padding:14px 16px;">
                <p style="margin:0 0 6px;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px;">Delivery Via</p>
                <p style="margin:0;font-size:14px;font-weight:600;color:#333;">🚚 ${order.shippingMethod || "Standard"}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#0e0e0e;padding:24px 32px;text-align:center;">
          <p style="margin:0 0 6px;color:#C9A465;font-size:14px;font-weight:600;">MARC Family Fashion</p>
          <p style="margin:0 0 4px;color:rgba(255,255,255,0.4);font-size:12px;">Vellayani Jn., Nemom (P.O), Trivandrum, Kerala</p>
          <p style="margin:0;color:rgba(255,255,255,0.3);font-size:11px;">📞 +91 9633 633 733 &nbsp;|&nbsp; ✉ marcthefamilyfashion@gmail.com</p>
          <p style="margin:16px 0 0;color:rgba(255,255,255,0.2);font-size:10px;">This is an auto-generated invoice. Please do not reply to this email.</p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

// ── Shipping notification email ──────────────────────────────────
function generateShippingHTML(order) {
  const trackingNo  = order.trackingNumber || "";
  const dtdcLink    = trackingNo
    ? `https://www.dtdc.in/tracking.asp?Ttype=0&TrkType=cnno&strCnno=${trackingNo}`
    : "";

  const trackSection = trackingNo ? `
      <tr>
        <td style="padding:0 32px 28px;">
          <div style="background:#eff6ff;border:1.5px solid #bfdbfe;border-radius:10px;padding:20px 24px;text-align:center;">
            <p style="margin:0 0 6px;font-size:12px;color:#1d4ed8;text-transform:uppercase;letter-spacing:1px;font-weight:600;">DTDC Tracking Number</p>
            <p style="margin:0 0 14px;font-size:24px;font-weight:700;color:#1e3a8a;letter-spacing:3px;font-family:monospace;">${trackingNo}</p>
            <a href="${dtdcLink}" target="_blank"
               style="display:inline-block;background:#1d4ed8;color:#ffffff;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none;letter-spacing:0.5px;">
              🔍 Track My Shipment on DTDC
            </a>
            <p style="margin:10px 0 0;font-size:11px;color:#6b7280;">Click the button above or visit dtdc.in to track your order</p>
          </div>
        </td>
      </tr>` : "";

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

      <tr>
        <td style="background:#0e0e0e;padding:28px 32px;text-align:center;">
          <h1 style="margin:0;color:#C9A465;font-size:26px;letter-spacing:4px;">MARC FASHION</h1>
          <p style="margin:6px 0 0;color:rgba(255,255,255,0.45);font-size:12px;letter-spacing:2px;text-transform:uppercase;">Your Order is On The Way!</p>
        </td>
      </tr>

      <tr>
        <td style="padding:28px 32px 8px;">
          <p style="margin:0;font-size:22px;text-align:center;">🚚</p>
          <h2 style="margin:12px 0 8px;font-size:20px;color:#111;text-align:center;font-family:Georgia,serif;">Your order has been shipped!</h2>
          <p style="margin:0;font-size:14px;color:#666;text-align:center;line-height:1.6;">
            Hi <strong>${order.customer.name}</strong>, great news! Your MARC Fashion order
            <strong style="color:#C9A465;">#${order.orderNumber}</strong> is on its way.
          </p>
        </td>
      </tr>

      ${trackSection}

      <tr>
        <td style="padding:0 32px 24px;">
          <h3 style="margin:0 0 10px;font-size:13px;text-transform:uppercase;letter-spacing:1px;color:#999;">Delivery Address</h3>
          <div style="background:#f9f6f1;border-left:3px solid #C9A465;padding:14px 16px;border-radius:4px;font-size:14px;color:#444;line-height:1.8;">
            <strong>${order.shipping.name}</strong><br>
            ${order.shipping.address}<br>
            ${order.shipping.city}, ${order.shipping.state} – ${order.shipping.pin}<br>
            📱 ${order.shipping.mobile}
          </div>
        </td>
      </tr>

      <tr>
        <td style="padding:0 32px 28px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="background:#f9f6f1;border-radius:8px;padding:14px 16px;text-align:center;">
                <p style="margin:0 0 4px;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px;">Shipping Via</p>
                <p style="margin:0;font-size:14px;font-weight:600;color:#333;">🚚 ${order.shippingMethod || "DTDC Courier"}</p>
              </td>
              <td width="16"></td>
              <td style="background:#f9f6f1;border-radius:8px;padding:14px 16px;text-align:center;">
                <p style="margin:0 0 4px;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:1px;">Order Total</p>
                <p style="margin:0;font-size:14px;font-weight:700;color:#C9A465;font-family:Georgia,serif;">₹${order.total.toLocaleString("en-IN")}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <tr>
        <td style="background:#0e0e0e;padding:24px 32px;text-align:center;">
          <p style="margin:0 0 6px;color:#C9A465;font-size:14px;font-weight:600;">MARC Family Fashion</p>
          <p style="margin:0 0 4px;color:rgba(255,255,255,0.4);font-size:12px;">Vellayani Jn., Nemom (P.O), Trivandrum, Kerala</p>
          <p style="margin:0;color:rgba(255,255,255,0.3);font-size:11px;">📞 +91 9633 633 733 &nbsp;|&nbsp; ✉ marcthefamilyfashion@gmail.com</p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

module.exports = router;
