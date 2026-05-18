const orderModel = require("../../models/orderModel")

const checkPurchaseController = async (req, res) => {
    try {
        const userId = req.userId
        const { productId } = req.body

        if (!productId) {
            return res.json({
                message: "Product ID is required",
                error: true,
                success: false
            })
        }

        // Check if user has any completed order containing this product
        const order = await orderModel.findOne({
            userId,
            "products.productId": productId,
            status: { $in: ["completed", "delivered"] }
        })

        res.json({
            data: { purchased: !!order },
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

module.exports = checkPurchaseController
