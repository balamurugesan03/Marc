const express = require("express");
const router  = express.Router();
const bcrypt  = require("bcryptjs");
const Admin   = require("../models/Admin");
const auth    = require("../middleware/auth");

// All routes require admin auth
router.use(auth);

// ── GET /api/admins ─ list all employees
router.get("/", async (req, res) => {
  try {
    const admins = await Admin.find().select("-password").sort({ createdAt: -1 });
    res.json({ success: true, admins });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── POST /api/admins ─ create new employee account
router.post("/", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: "Name, email and password are required" });

    if (password.length < 6)
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });

    const exists = await Admin.findOne({ email });
    if (exists)
      return res.status(409).json({ success: false, message: "Email is already registered" });

    const admin = new Admin({ name, email, password, role: role || "editor" });
    await admin.save();

    res.status(201).json({
      success: true,
      admin: { _id: admin._id, name: admin.name, email: admin.email, role: admin.role, isActive: admin.isActive, createdAt: admin.createdAt },
      message: "Employee account created successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PUT /api/admins/:id ─ update name / email / role / isActive
router.put("/:id", async (req, res) => {
  try {
    const { name, email, role, isActive } = req.body;

    // Prevent modifying own account role/status from here (they can change name/email)
    const update = {};
    if (name)     update.name     = name;
    if (email)    update.email    = email.toLowerCase();
    if (role)     update.role     = role;
    if (isActive !== undefined) update.isActive = isActive;

    const admin = await Admin.findByIdAndUpdate(req.params.id, update, { new: true }).select("-password");
    if (!admin)
      return res.status(404).json({ success: false, message: "Employee not found" });

    res.json({ success: true, admin, message: "Employee updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PUT /api/admins/:id/reset-password ─ set new password
router.put("/:id/reset-password", async (req, res) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 6)
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });

    const admin = await Admin.findById(req.params.id);
    if (!admin)
      return res.status(404).json({ success: false, message: "Employee not found" });

    admin.password = password; // pre-save hook will hash it
    await admin.save();

    res.json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── DELETE /api/admins/:id ─ delete employee
router.delete("/:id", async (req, res) => {
  try {
    // Prevent self-delete
    if (req.admin.id === req.params.id)
      return res.status(400).json({ success: false, message: "You cannot delete your own account" });

    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin)
      return res.status(404).json({ success: false, message: "Employee not found" });

    res.json({ success: true, message: "Employee account deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
