const crypto = require('crypto');
const orderModel = require("../../models/orderModel");
const addToCartModel = require("../../models/addToCart");
const calculateDeliveryDates = require('../../controller/order/calculateDeliveryDates');
const { sendOrderConfirmationEmail } = require('../../helpers/sendEmail');

const verifyPayment = async (req, res) => {
    try {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;
        const userId = req.userId;

        // Verify signature
        const body = razorpayOrderId + "|" + razorpayPaymentId;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpaySignature) {
            return res.json({
                message: "Payment verification failed",
                error: true,
                success: false
            });
        }

        // Get the existing order to fetch delivery type
        const existingOrder = await orderModel.findById(orderId);
        if (!existingOrder) {
            return res.json({
                message: "Order not found",
                error: true,
                success: false
            });
        }

        // Calculate delivery dates based on delivery type from existing order
        const deliveryDates = calculateDeliveryDates(
            new Date(),
            existingOrder.deliveryType || 'standard'
        );

        // Update order with payment details & delivery dates
        const order = await orderModel.findByIdAndUpdate(
            orderId,
            {
                razorpayOrderId,
                razorpayPaymentId,
                razorpaySignature,
                paymentStatus: "completed",
                status: "confirmed",
                shippedDate: deliveryDates.shippedDate,
                outForDeliveryDate: deliveryDates.outForDeliveryDate,
                deliveredDate: deliveryDates.deliveredDate
            },
            { new: true }
        ).populate('userId');

        // Clear cart after successful payment
        await addToCartModel.deleteMany({ userId });

        // 🗑️ DELETE ALL OTHER PENDING ORDERS - Keep only the confirmed one
        await orderModel.deleteMany({
            userId,
            paymentStatus: 'pending',
            status: 'pending',
            _id: { $ne: orderId }  // Don't delete the order we just confirmed
        });
        console.log(`🗑️ Deleted old pending orders after payment confirmation`);

        // Send order confirmation email
        if (order && order.userId?.email) {
            await sendOrderConfirmationEmail(
                order.userId.email,
                order.userId.name,
                order
            );
            console.log(`📧 Order confirmation email sent to ${order.userId.email}`);
        }

        // Log delivery dates for debugging
        console.log(`✅ Order ${orderId} verified with ${existingOrder.deliveryType} delivery`);
        console.log(`   Total: ₹${existingOrder.totalAmount} (Charges: ₹${existingOrder.handlingCharges})`);
        console.log(`   Shipped: ${deliveryDates.shippedDate}`);
        console.log(`   Out for Delivery: ${deliveryDates.outForDeliveryDate}`);
        console.log(`   Delivered: ${deliveryDates.deliveredDate}`);

        res.json({
            data: order,
            message: "Payment verified successfully!",
            success: true,
            error: false
        });

    } catch (err) {
        console.error("Error verifying payment:", err);
        res.json({
            message: err.message || err,
            error: true,
            success: false
        });
    }
};

module.exports = verifyPayment;