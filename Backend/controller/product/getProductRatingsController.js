const ratingModel = require("../../models/ratingModel")

const getProductRatingsController = async (req, res) => {
    try {
        const { productId } = req.body

        if (!productId) {
            return res.json({
                message: "Product ID is required",
                error: true,
                success: false
            })
        }

        const ratings = await ratingModel.find({ productId }).sort({ createdAt: -1 }).lean()

        // Calculate average
        let averageRating = 0
        if (ratings.length > 0) {
            const sum = ratings.reduce((acc, r) => acc + r.rating, 0)
            averageRating = parseFloat((sum / ratings.length).toFixed(1))
        }

        // Rating distribution
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        ratings.forEach(r => {
            distribution[r.rating] = (distribution[r.rating] || 0) + 1
        })

        res.json({
            data: {
                ratings,
                averageRating,
                totalRatings: ratings.length,
                distribution
            },
            message: "Ratings fetched successfully",
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

module.exports = getProductRatingsController
