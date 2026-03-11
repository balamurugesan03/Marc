const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    shippingRates: {
      indiaPost: { type: Number, default: 0  },
      dtdc:      { type: Number, default: 49 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Settings", settingsSchema);
