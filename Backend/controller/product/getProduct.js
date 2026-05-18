const productModel = require("../../models/productModel")
const ratingModel = require("../../models/ratingModel")

const getProductController = async(req,res) => {
    try{
        const allProduct = await productModel.find().sort({createdAt : -1}).lean()

        // Fetch ratings for all products
        const productIds = allProduct.map(p => p._id.toString())
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

        const productsWithRating = allProduct.map(p => ({
            ...p,
            avgRating: ratingMap[p._id.toString()]?.avgRating || 0,
            totalRatings: ratingMap[p._id.toString()]?.totalRatings || 0,
            reviewCount: ratingMap[p._id.toString()]?.reviewCount || 0
        }))

        res.json({
            message : "All Products",
            success : true,
            error : false,
            data : productsWithRating
        })
    }catch(err){
        res.status(400).json({
            message : err.message || err,
            error : true,
            success : false
        })
    }
}

module.exports = getProductController