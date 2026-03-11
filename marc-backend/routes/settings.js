const router    = require("express").Router();
const Settings  = require("../models/Settings");
const adminAuth = require("../middleware/auth");

// Helper — always returns the single settings document (creates if missing)
const getSettings = async () => {
  let s = await Settings.findOne();
  if (!s) s = await Settings.create({});
  return s;
};

// ── GET /api/settings  (public — used by checkout page)
router.get("/", async (req, res) => {
  try {
    const settings = await getSettings();
    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ── PUT /api/settings  (admin only)
router.put("/", adminAuth, async (req, res) => {
  try {
    const { indiaPost, dtdc } = req.body;
    const settings = await getSettings();

    if (indiaPost !== undefined) settings.shippingRates.indiaPost = Number(indiaPost);
    if (dtdc      !== undefined) settings.shippingRates.dtdc      = Number(dtdc);

    settings.markModified("shippingRates");
    await settings.save();

    res.json({ success: true, settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
