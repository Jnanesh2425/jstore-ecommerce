const orderModel = require('../../models/orderModel');

const cancelOrder = async (req, res) => {
    try {
        const userId = req.userId;
        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({
                message: 'Order ID is required',
                error: true,
                success: false
            });
        }

        // Mark abandoned checkout as payment failed
        const result = await orderModel.findOneAndUpdate(
            {
                _id: orderId,
                userId,
                paymentStatus: 'pending'
            },
            {
                paymentStatus: 'failed',
                status: 'payment_failed'
            },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({
                message: 'Order not found or already completed',
                error: true,
                success: false
            });
        }

        return res.json({
            message: 'Order marked as payment failed',
            error: false,
            success: true,
            data: result
        });
    } catch (error) {
        return res.status(500).json({
            message: error?.message || 'Something went wrong',
            error: true,
            success: false
        });
    }
};

module.exports = cancelOrder;
