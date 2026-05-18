const productModel = require("../../models/productModel")
const ratingModel = require("../../models/ratingModel")

const searchProduct = async (req, res) => {
    try {
        const query = req.query.q
        const regex = new RegExp(query, 'ig')

        // Search with priority: ProductName > category > brandName > description
        const product = await productModel.find({
            $or: [
                { ProductName: regex },
                { category: regex },
                { brandName: regex },
                { description: regex }
            ]
        }).lean()

        // Sort by match quality - prioritize ProductName matches
        const prioritizedProducts = product.sort((a, b) => {
            const aNameMatch = regex.test(a.ProductName) ? 2 : regex.test(a.category) ? 1.5 : regex.test(a.brandName) ? 1 : 0
            const bNameMatch = regex.test(b.ProductName) ? 2 : regex.test(b.category) ? 1.5 : regex.test(b.brandName) ? 1 : 0
            return bNameMatch - aNameMatch
        })

        const productIds = prioritizedProducts.map(p => p._id.toString())
        const ratings = await ratingModel.find({ productId: { $in: productIds } }).lean()

        const ratingsGrouped = ratings.reduce((acc, r) => {
            if (!acc[r.productId]) {
                acc[r.productId] = { sum: 0, count: 0, reviewCount: 0 }
            }
            acc[r.productId].sum += r.rating
            acc[r.productId].count += 1
            if (r.review && r.review.trim()) {
                acc[r.productId].reviewCount += 1
            }
            return acc
        }, {})

        const productWithRatings = prioritizedProducts.map(p => {
            const r = ratingsGrouped[p._id.toString()]
            const totalRatings = r ? r.count : 0
            const reviewCount = r ? r.reviewCount : 0
            const avgRating = r ? parseFloat((r.sum / r.count).toFixed(1)) : 0
            return { ...p, totalRatings, reviewCount, avgRating }
        })

        res.json({
            data: productWithRatings,
            message: "Search results",
            error: false,
            success: true
        })
    } catch (err) {
        res.json({
            message: err.message || err,
            error: true,
            success: false
        })
    }
}

module.exports = searchProduct