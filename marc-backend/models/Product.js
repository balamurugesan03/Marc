const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ["men", "women", "boys", "girls", "footwear", "accessories", "innerwear", "undergarments", "toys", "wallet", "shawl", "hijab"],
      lowercase: true,
    },
    price: { type: Number, required: true, min: 0 },
    oldPrice: { type: Number, default: null },
    badge: { type: String, default: null }, // "New" | "Sale" | null
    rating: { type: Number, default: 4.0, min: 0, max: 5 },
    reviews: { type: Number, default: 0, min: 0 },
    colors: [{ type: String }],
    colorNames: [{ type: String }],
    sizes: [{ type: String }],
    emoji: { type: String, default: "👕" },
    isSale: { type: Boolean, default: false },
    material: { type: String, trim: true },
    fit: { type: String, trim: true },
    description: { type: String, trim: true },
    image: { type: String, default: null }, // uploaded image filename
    stock: { type: Number, default: 100, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Auto-set isSale based on badge
productSchema.pre("save", function (next) {
  if (this.badge === "Sale") this.isSale = true;
  else if (this.isModified("badge")) this.isSale = false;
  next();
});

module.exports = mongoose.model("Product", productSchema);
