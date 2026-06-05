const Razorpay = require('razorpay');
const orderModel = require('../../models/orderModel');
const productModel = require('../../models/productModel');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const createDirectOrder = async (req, res) => {
    try {
        const userId = req.userId;
        const { productId, quantity = 1, deliveryType = 'standard', address } = req.body;

        if (!productId) {
            return res.json({
                success: false,
                error: true,
                message: 'Product is required'
            });
        }

        const product = await productModel.findById(productId);
        if (!product) {
            return res.json({
                success: false,
                error: true,
                message: 'Product not found'
            });
        }

        const chargesAmount = deliveryType === 'express' ? 60 : 10;
        const totalSellingPrice = product.sellingPrice * quantity;
        const totalDiscount = (product.price - product.sellingPrice) * quantity;
        const totalAmount = totalSellingPrice + chargesAmount;

        // 🗑️ DELETE ALL OLD PENDING ORDERS first - avoid any duplicates
        const deletedCount = await orderModel.deleteMany({
            userId,
            paymentStatus: 'pending',
            status: 'pending'
        });
        
        if (deletedCount.deletedCount > 0) {
            console.log(`🗑️ Cleaned up ${deletedCount.deletedCount} old pending orders before creating new one`);
        }

        // Create fresh pending order (no reusing old ones)
        const order = new orderModel({ userId });

        order.products = [
            {
                productId: product._id.toString(),
                productName: product.productName || '',
                quantity,
                price: product.price,
                sellingPrice: product.sellingPrice,
                productImage: product.productImage?.[0] || ''
            }
        ];
        order.totalAmount = totalAmount;
        order.totalDiscount = totalDiscount;
        order.paymentStatus = 'pending';
        order.status = 'pending';
        order.deliveryType = deliveryType;
        order.handlingCharges = chargesAmount;
        order.address = address || null;
        order.shippedDate = new Date();
        order.outForDeliveryDate = new Date();
        order.deliveredDate = new Date();

        await order.save();

        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(totalAmount * 100),
            currency: 'INR',
            receipt: order._id.toString(),
            notes: {
                userId,
                orderId: order._id.toString(),
                productId: product._id.toString()
            }
        });

        order.razorpayOrderId = razorpayOrder.id;
        await order.save();

        return res.json({
            success: true,
            error: false,
            message: 'Direct order created successfully',
            data: {
                orderId: order._id,
                razorpayOrderId: razorpayOrder.id,
                amount: totalAmount,
                key: process.env.RAZORPAY_KEY_ID
            }
        });
    } catch (error) {
        console.error('Error creating direct order:', error);
        return res.json({
            success: false,
            error: true,
            message: error.message || 'Failed to create direct order'
        });
    }
};

module.exports = createDirectOrder;