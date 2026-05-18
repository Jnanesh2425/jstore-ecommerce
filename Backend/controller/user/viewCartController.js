const addToCartModel = require("../../models/addToCart")
const productModel = require("../../models/productModel")
const ratingModel = require("../../models/ratingModel")

const viewCartController = async (req, res) => {
    try {
        const currentUser = req.userId

        const cartItems = await addToCartModel.find({ userId: currentUser }).lean()

        // Fetch product details for each cart item
        const productIds = cartItems.map(item => item.ProductId)
        const products = await productModel.find({ _id: { $in: productIds } }).lean()

        const productMap = {}
        products.forEach(p => {
            productMap[p._id.toString()] = p
        })

        // Fetch and calculate average ratings for each product
        const productRatings = {}
        for (const productId of productIds) {
            const ratings = await ratingModel.find({ productId: productId }).lean()
            if (ratings.length > 0) {
                const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
                productRatings[productId] = parseFloat(averageRating.toFixed(1))
            } else {
                productRatings[productId] = 0
            }
        }

        const cartWithProducts = cartItems.map(item => ({
            ...item,
            productDetails: {
                ...productMap[item.ProductId],
                productRating: productRatings[item.ProductId] || 0
            }
        }))

        res.json({
            data: cartWithProducts,
            message: "Cart items fetched successfully",
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

module.exports = viewCartController
