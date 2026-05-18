const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: 'user',
    required: true,
  },
  products: [
    {
      productId: { type: String, required: true },
      productName: { type: String, default: "" },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true },
      sellingPrice: { type: Number, required: true },
      productImage: { type: String, default: "" },
    }
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  totalDiscount: {
    type: Number,
    default: 0,
  },
  razorpayOrderId: {
    type: String,
    default: null,
  },
  razorpayPaymentId: {
    type: String,
    default: null,
  },
  razorpaySignature: {
    type: String,
    default: null,
  },
  paymentStatus: {
    type: String,
    default: "pending",
    enum: ["pending", "completed", "failed"]
  },
    status: {
    type: String,
    default: "pending",
    enum: ["pending", "confirmed", "shipped", "out for delivery", "delivered", "completed", "cancelled", "payment_failed"]
  },
  
  // DELIVERY FIELDS
  deliveryType: {
    type: String,
    enum: ['standard', 'express'],
    default: 'standard',
    required: true
  },
  shippedDate: {
    type: Date,
    required: true
  },
  outForDeliveryDate: {
    type: Date,
    required: true
  },
  deliveredDate: {
    type: Date,
    required: true
  },
  handlingCharges: {
    type: Number,
    default: 10,
    required: true
  },
  
  // ADDRESS FIELD
  address: {
    name: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
    mobile: String
  }
}, {
  timestamps: true
});

// Register on default connection (for populate to find it)
let OrderModel = mongoose.models.Order;
if (!OrderModel) {
    OrderModel = mongoose.model("Order", orderSchema);
}

// Also ensure it's available on ecom_db connection
const db = mongoose.connection.useDb("ecom_db");
if (!db.models.Order) {
    db.model("Order", orderSchema);
}

module.exports = OrderModel;
