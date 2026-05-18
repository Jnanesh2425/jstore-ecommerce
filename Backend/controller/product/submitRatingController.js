const ratingModel = require("../../models/ratingModel")
const userModel = require("../../models/userModel")

const submitRatingController = async (req, res) => {
    try {
        const userId = req.userId
        const { productId, rating, review } = req.body

        if (!productId || !rating) {
            return res.json({
                message: "Product ID and rating are required",
                error: true,
                success: false
            })
        }

        if (rating < 1 || rating > 5) {
            return res.json({
                message: "Rating must be between 1 and 5",
                error: true,
                success: false
            })
        }

        // Get user name
        const user = await userModel.findById(userId)
        const userName = user?.name || "Anonymous"

        // Upsert: update if exists, create if not
        const result = await ratingModel.findOneAndUpdate(
            { productId, userId },
            { rating, review: review || "", userName },
            { upsert: true, new: true }
        )

        res.json({
            data: result,
            message: "Rating submitted successfully",
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

module.exports = submitRatingController
