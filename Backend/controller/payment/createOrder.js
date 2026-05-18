const Razorpay = require('razorpay');
const orderModel = require("../../models/orderModel");
const addToCartModel = require("../../models/addToCart");
const productModel = require("../../models/productModel");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const createRazorpayOrder = async (req, res) => {
    try {
        const userId = req.userId;
        const { addressId, deliveryType, address } = req.body;

        // Validate delivery type
        const validDeliveryTypes = ['standard', 'express'];
        const selectedDelivery = validDeliveryTypes.includes(deliveryType) ? deliveryType : 'standard';

        // Get all cart items
        const cartItems = await addToCartModel.find({ userId });

        if (!cartItems || cartItems.length === 0) {
            return res.json({
                message: "Cart is empty",
                error: true,
                success: false
            });
        }

        // Fetch product details
        const productIds = cartItems.map(item => item.ProductId);
        const products = await productModel.find({ _id: { $in: productIds } });
        const productMap = {};
        products.forEach(p => {
            productMap[p._id.toString()] = p;
        });

        // Calculate totals
        const orderProducts = [];
        let totalAmount = 0;
        let totalDiscount = 0;

        const chargesAmount = selectedDelivery === 'express' ? 60 : 10;

        for (const item of cartItems) {
            const product = productMap[item.ProductId];
            if (product) {
                const itemTotal = product.sellingPrice * item.quantity;
                const itemDiscount = (product.price - product.sellingPrice) * item.quantity;
                totalAmount += itemTotal;
                totalDiscount += itemDiscount;

                orderProducts.push({
                    productId: item.ProductId,
                    productName: product.ProductName || "",
                    quantity: item.quantity,
                    price: product.price,
                    sellingPrice: product.sellingPrice,
                    productImage: product.productImage?.[0] || ""
                });
            }
        }

        // Add handling charges to total
        totalAmount += chargesAmount;

        // Reuse the latest pending order to avoid duplicate rows from repeated clicks
        const pendingOrders = await orderModel
            .find({ userId, paymentStatus: 'pending', status: 'pending' })
            .sort({ createdAt: -1 });

        let order = pendingOrders[0] || new orderModel({ userId });

        order.products = orderProducts;
        order.totalAmount = totalAmount;
        order.totalDiscount = totalDiscount;
        order.paymentStatus = 'pending';
        order.status = 'pending';
        order.deliveryType = selectedDelivery;
        order.handlingCharges = chargesAmount;
        order.address = address;
        order.shippedDate = new Date();
        order.outForDeliveryDate = new Date();
        order.deliveredDate = new Date();

        await order.save();

        if (pendingOrders.length > 1) {
            await orderModel.deleteMany({
                userId,
                paymentStatus: 'pending',
                status: 'pending',
                _id: { $ne: order._id }
            });
        }

        // Create Razorpay order
        const razorpayOrder = await razorpay.orders.create({
            amount: Math.round(totalAmount * 100), // Convert to paise
            currency: "INR",
            receipt: order._id.toString(),
            notes: {
                userId,
                orderId: order._id.toString()
            }
        });

        // Save Razorpay order ID to DB
        order.razorpayOrderId = razorpayOrder.id;
        await order.save();

        console.log(`📦 Order created for delivery type: ${selectedDelivery} (Charge: ₹${chargesAmount})`);

        res.json({
            data: {
                razorpayOrderId: razorpayOrder.id,
                orderId: order._id,
                amount: totalAmount,
                key: process.env.RAZORPAY_KEY_ID
            },
            message: "Order created successfully",
            success: true,
            error: false
        });

    } catch (err) {
        console.error("Error creating order:", err);
        res.json({
            message: err.message || err,
            error: true,
            success: false
        });
    }
};

module.exports = createRazorpayOrder;