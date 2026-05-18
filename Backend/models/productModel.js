const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  ProductName: {
    type: String,
    required: true,
  },
  brandName: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  productImage: {
    type: [String], 
    default: []
  },
  description: {
    type: String,
    required: true, 
  },
  price: {
    type: Number,
    required: true,
  },
  sellingPrice: {
    type: Number,
    required: true,
  },
  hotDeal: {
    type: Boolean,
    default: false
  },
}, {
  timestamps: true
});

// se ecom_db database explicitly
const db = mongoose.connection.useDb("ecom_db");

// Create model under ecom_db
const productModel = db.model("Product", productSchema);

module.exports = productModel;
