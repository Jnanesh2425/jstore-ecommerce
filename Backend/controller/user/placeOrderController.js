const orderModel = require("../../models/orderModel")
const addToCartModel = require("../../models/addToCart")
const productModel = require("../../models/productModel")

const placeOrderController = async (req, res) => {
    try {
        const userId = req.userId

        // Get all cart items for this user
        const cartItems = await addToCartModel.find({ userId })

        if (!cartItems || cartItems.length === 0) {
            return res.json({
                message: "Cart is empty",
                error: true,
                success: false
            })
        }

        // Fetch product details for each cart item
        const productIds = cartItems.map(item => item.ProductId)
        const products = await productModel.find({ _id: { $in: productIds } })
        const productMap = {}
        products.forEach(p => {
            productMap[p._id.toString()] = p
        })

        // Build order products array
        const orderProducts = []
        let totalAmount = 0
        let totalDiscount = 0

        for (const item of cartItems) {
            const product = productMap[item.ProductId]
            if (product) {
                const itemTotal = product.sellingPrice * item.quantity
                const itemDiscount = (product.price - product.sellingPrice) * item.quantity
                totalAmount += itemTotal
                totalDiscount += itemDiscount

                orderProducts.push({
                    productId: item.ProductId,
                    productName: product.ProductName || "",
                    quantity: item.quantity,
                    price: product.price,
                    sellingPrice: product.sellingPrice,
                    productImage: product.productImage?.[0] || ""
                })
            }
        }

        // Create order
        const order = new orderModel({
            userId,
            products: orderProducts,
            totalAmount,
            totalDiscount,
            status: "completed"
        })

        await order.save()

        // Clear user's cart
        await addToCartModel.deleteMany({ userId })

        res.json({
            data: order,
            message: "Order placed successfully!",
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

module.exports = placeOrderController
