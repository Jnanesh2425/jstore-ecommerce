const addToCartModel = require("../../models/addToCart")

const deleteCartItemController = async (req, res) => {
    try {
        const currentUser = req.userId
        const { productId } = req.body

        const result = await addToCartModel.deleteOne({
            ProductId: productId,
            userId: currentUser
        })

        if (result.deletedCount === 0) {
            return res.json({
                message: "Product not found in cart",
                success: false,
                error: true
            })
        }

        res.json({
            message: "Product removed from cart",
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

module.exports = deleteCartItemController
