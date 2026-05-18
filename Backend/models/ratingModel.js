const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
  productId: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    default: ""
  },
  userName: {
    type: String,
    default: ""
  }
}, {
  timestamps: true
});

// One rating per user per product
ratingSchema.index({ productId: 1, userId: 1 }, { unique: true });

const db = mongoose.connection.useDb("ecom_db");
const ratingModel = db.model("Rating", ratingSchema);

module.exports = ratingModel;
