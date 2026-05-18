const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    products: [
        {
            productId: {
                type: String,
                required: true
            },
            productName: String,
            sellingPrice: Number,
            productImage: String,
            addedAt: {
                type: Date,
                default: Date.now
            }
        }
    ]
}, {
    timestamps: true
});

const db = mongoose.connection.useDb("ecom_db");
const wishlistModel = db.model("Wishlist", wishlistSchema);

module.exports = wishlistModel;