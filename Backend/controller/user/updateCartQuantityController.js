const addToCartModel = require("../../models/addToCart")

const updateCartQuantityController = async (req, res) => {
    try {
        const currentUser = req.userId
        const { productId, quantity } = req.body

        if (quantity <= 0) {
            // Remove from cart if quantity is 0 or less
            await addToCartModel.deleteOne({
                ProductId: productId,
                userId: currentUser
            })
            return res.json({
                message: "Product removed from cart",
                success: true,
                error: false
            })
        }

        const updatedProduct = await addToCartModel.findOneAndUpdate(
            { ProductId: productId, userId: currentUser },
            { quantity: quantity },
            { new: true }
        )

        if (!updatedProduct) {
            return res.json({
                message: "Product not found in cart",
                success: false,
                error: true
            })
        }

        res.json({
            data: updatedProduct,
            message: "Cart updated",
            success: true,
            error: false
        })
    } catch (err) {
        res.json({
            message: err.message || err,
            error: true,
            success: false
        })
    }
}

module.exports = updateCartQuantityController
