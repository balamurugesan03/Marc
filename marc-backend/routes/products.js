const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const fs = require("fs");
const path = require("path");

// ── PUBLIC ROUTES ──────────────────────────────────────────

// GET /api/products  — all products (optionally filter by category / sale)
router.get("/", async (req, res) => {
  try {
    const { category, isSale, search } = req.query;
    const filter = { isActive: true };

    if (category) filter.category = category;
    if (isSale === "true") filter.isSale = true;
    if (search) filter.name = { $regex: search, $options: "i" };

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/products/featured  — first 4 active products
router.get("/featured", async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).sort({ createdAt: -1 }).limit(4);
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/products/:id
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── ADMIN ROUTES ───────────────────────────────────────────

// POST /api/products  — create product
router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    const data = { ...req.body };

    // Parse JSON arrays sent as strings from FormData
    if (typeof data.colors === "string") data.colors = JSON.parse(data.colors);
    if (typeof data.colorNames === "string") data.colorNames = JSON.parse(data.colorNames);
    if (typeof data.sizes === "string") data.sizes = JSON.parse(data.sizes);

    if (req.file) data.image = req.file.filename;

    // Convert types
    data.price = Number(data.price);
    if (data.oldPrice) data.oldPrice = Number(data.oldPrice);
    if (data.rating) data.rating = Number(data.rating);
    if (data.reviews) data.reviews = Number(data.reviews);
    if (data.stock) data.stock = Number(data.stock);
    if (!data.badge) data.badge = null;
    data.isSale = data.badge === "Sale";
    data.isActive = data.isActive === "true" || data.isActive === true;

    const product = new Product(data);
    await product.save();
    res.status(201).json({ success: true, product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/products/:id  — update product
router.put("/:id", auth, upload.single("image"), async (req, res) => {
  try {
    const data = { ...req.body };

    if (typeof data.colors === "string") data.colors = JSON.parse(data.colors);
    if (typeof data.colorNames === "string") data.colorNames = JSON.parse(data.colorNames);
    if (typeof data.sizes === "string") data.sizes = JSON.parse(data.sizes);

    if (req.file) {
      // Delete old image if exists
      const existing = await Product.findById(req.params.id);
      if (existing?.image) {
        const oldPath = path.join(__dirname, "../uploads", existing.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      data.image = req.file.filename;
    }

    data.price = Number(data.price);
    if (data.oldPrice) data.oldPrice = Number(data.oldPrice) || null;
    if (data.rating) data.rating = Number(data.rating);
    if (data.reviews) data.reviews = Number(data.reviews);
    if (data.stock) data.stock = Number(data.stock);
    if (!data.badge) data.badge = null;
    data.isSale = data.badge === "Sale";
    data.isActive = data.isActive === "true" || data.isActive === true;

    const product = await Product.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/products/:id
router.delete("/:id", auth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    // Delete uploaded image
    if (product.image) {
      const imgPath = path.join(__dirname, "../uploads", product.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    res.json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── ADMIN ALL PRODUCTS (including inactive) ───────────────
// GET /api/products/admin/all
router.get("/admin/all", auth, async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (search) filter.name = { $regex: search, $options: "i" };

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
