const addToCartModel =  require("../../models/addToCart")

const countAddToCartProduct = async (req, res) => {
    try {
        const userId = req.userId

        const result = await addToCartModel.aggregate([
            { $match: { userId: userId } },
            { $group: { _id: null, totalCount: { $sum: "$quantity" } } }
        ])

        const count = result.length > 0 ? result[0].totalCount : 0

        res.json({
            data:{
                count: count
            },
            message : "Count fetched successfully",
            error : false,
            success : true
        })
    } catch (error) {
        res.json({
            message: error.message || error,
            error: true,
            success: false
        })
    }
}

module.exports = countAddToCartProduct