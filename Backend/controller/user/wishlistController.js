const wishlistModel = require('../../models/wishlistModel.js');

// Add to wishlist
exports.addToWishlist = async (req, res) => {
    try {
        const { productId, productName, sellingPrice, productImage } = req.body;
        const userId = req.userId;

        let wishlist = await wishlistModel.findOne({ userId });

        if (!wishlist) {
            wishlist = await wishlistModel.create({
                userId,
                products: [{ productId, productName, sellingPrice, productImage }]
            });
        } else {
            const existingProduct = wishlist.products.find(p => p.productId === productId);
            if (!existingProduct) {
                wishlist.products.push({ productId, productName, sellingPrice, productImage });
                await wishlist.save();
            }
        }

        return res.json({
            message: "Product added to wishlist",
            success: true,
            data: wishlist
        });
    } catch (error) {
        return res.status(400).json({
            message: error.message || "Error adding to wishlist",
            success: false
        });
    }
};

// Get wishlist
exports.getWishlist = async (req, res) => {
    try {
        const userId = req.userId;
        const wishlist = await wishlistModel.findOne({ userId });

        return res.json({
            message: "Wishlist fetched",
            success: true,
            data: wishlist?.products || []
        });
    } catch (error) {
        return res.status(400).json({
            message: error.message || "Error fetching wishlist",
            success: false
        });
    }
};

// Remove from wishlist
exports.removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.userId;

        const result = await wishlistModel.updateOne(
            { userId },
            { $pull: { products: { productId } } }
        );

        return res.json({
            message: "Product removed from wishlist",
            success: true,
            data: result
        });
    } catch (error) {
        return res.status(400).json({
            message: error.message || "Error removing from wishlist",
            success: false
        });
    }
};

