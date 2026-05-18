const orderModel = require("../../models/orderModel")

const getOrders = async (req, res) => {
    try {
        const userId = req.userId

        // Get all orders for this user, sorted by newest first, and populate user details
        const orders = await orderModel.find({ userId }).populate('userId', 'name email phone mobile').sort({ createdAt: -1 })

        if (!orders) {
            return res.json({
                data: [],
                message: "No orders found",
                error: false,
                success: true
            })
        }

        res.json({
            data: orders,
            message: "Orders fetched successfully",
            error: false,
            success: true
        })

    } catch (err) {
        console.error("Error fetching orders:", err)
        res.json({
            message: err.message || err,
            error: true,
            success: false
        })
    }
}

module.exports = getOrders
