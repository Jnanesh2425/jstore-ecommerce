const mongoose = require("mongoose");

const addToCartSchema = new mongoose.Schema({
  ProductId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  }
}, {
  timestamps: true
});

// se ecom_db database explicitly
const db = mongoose.connection.useDb("ecom_db");

// Create model under ecom_db
const addToCartModel = db.model("addToCart", addToCartSchema);

module.exports = addToCartModel;
