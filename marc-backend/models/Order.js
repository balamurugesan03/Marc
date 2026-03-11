const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  productId: String,
  name:      String,
  price:     Number,
  oldPrice:  Number,
  qty:       Number,
  image:     String,
  size:      String,
  color:     String,
});

const orderSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    orderNumber:   { type: String },
    items:         [itemSchema],
    shipping: {
      name:    String,
      address: String,
      city:    String,
      state:   String,
      pin:     String,
      mobile:  String,
    },
    total:          { type: Number, required: true },
    discount:       { type: Number, default: 0 },
    couponCode:     { type: String, default: "" },
    shippingCost:   { type: Number, default: 0 },
    shippingMethod: { type: String },
    paymentMethod:  { type: String },
    status: {
      type:    String,
      default: "Processing",
      enum:    ["Processing", "Shipped", "Delivered", "Cancelled"],
    },
    trackingNumber:    { type: String, default: "" },
    paymentScreenshot: { type: String, default: "" },
  },
  { timestamps: true }
);

orderSchema.pre("save", function (next) {
  if (!this.orderNumber) {
    this.orderNumber = "MARC" + Date.now().toString().slice(-8);
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);
