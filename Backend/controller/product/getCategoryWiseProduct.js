const productModel = require("../../models/productModel")
const ratingModel = require("../../models/ratingModel")

const getCategoryWiseProduct = async (req, res) => {
    try {
        const { category } = req?.body || req?.query
        
        // Handle both single category (string) and multiple categories (array)
        let query = {};
        if (Array.isArray(category)) {
            // Multiple categories - use $in operator with case-insensitive matching
            const categoryRegex = category.map(cat => new RegExp(`^${cat}$`, 'i'));
            query = { category: { $in: categoryRegex } };
        } else {
            // Single category - case-insensitive matching
            query = { category: new RegExp(`^${category}$`, 'i') };
        }
        
        const products = await productModel.find(query).lean()

        // Fetch average ratings for all products
        const productIds = products.map(p => p._id.toString())
        const ratingsAgg = await ratingModel.aggregate([
            { $match: { productId: { $in: productIds } } },
            { $group: { 
                _id: "$productId", 
                avgRating: { $avg: "$rating" }, 
                totalRatings: { $sum: 1 },
                reviewCount: { $sum: { $cond: [{ $gt: [{ $strLenCP: "$review" }, 0] }, 1, 0] } }
            } }
        ])

        const ratingMap = {}
        ratingsAgg.forEach(r => {
            ratingMap[r._id] = { 
                avgRating: parseFloat(r.avgRating.toFixed(1)), 
                totalRatings: r.totalRatings,
                reviewCount: r.reviewCount
            }
        })

        const productsWithRating = products.map(p => ({
            ...p,
            avgRating: ratingMap[p._id.toString()]?.avgRating || 0,
            totalRatings: ratingMap[p._id.toString()]?.totalRatings || 0,
            reviewCount: ratingMap[p._id.toString()]?.reviewCount || 0
        }))

        res.json({
            data : productsWithRating,
            message : 'product',
            success : true,
            error : false
        })
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            error: true,
            success: false
        })
    }
}
module.exports = getCategoryWiseProduct