const productModel = require("../../models/productModel")
const ratingModel = require("../../models/ratingModel")

const getProductDetail = async(req,res) =>{
    try{
        const { productId } = req.body

        const product = await productModel.findById(productId).lean()

        // Get average rating
        const ratingsAgg = await ratingModel.aggregate([
            { $match: { productId: productId } },
            { $group: { _id: null, avgRating: { $avg: "$rating" }, totalRatings: { $sum: 1 } } }
        ])

        const avgRating = ratingsAgg.length > 0 ? parseFloat(ratingsAgg[0].avgRating.toFixed(1)) : 0
        const totalRatings = ratingsAgg.length > 0 ? ratingsAgg[0].totalRatings : 0

        res.json({
            data : { ...product, avgRating, totalRatings },
            message : 'ok',
            success : true,
            error : false
        })

    }catch(err){
        res.json({
            message : err?.message || err,
            error : true,
            success : false
        })
    }
}

module.exports = getProductDetail