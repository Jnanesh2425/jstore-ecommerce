const addToCartModel = require("../../models/addToCart")

const addToCartController = async (req, res) => {
    try {
        const { productId } = req?.body
        const currentUser = req.userId

        const isProductAlreadyInCart = await addToCartModel.findOne({ 
            ProductId: productId,
            userId: currentUser 
        })

        if (isProductAlreadyInCart) {
            // If product already exists, increment quantity
            const updatedProduct = await addToCartModel.findOneAndUpdate(
                { ProductId: productId, userId: currentUser },
                { $inc: { quantity: 1 } },
                { new: true }
            )
            return res.json({
                data: updatedProduct,
                message: "Product quantity updated in cart",
                success: true,
                error: false
            })
        }

        const payload = {
            ProductId: productId,
            userId: currentUser,
            quantity: 1
        }
        const newAddToCart = new addToCartModel(payload)
        const saveProduct = await newAddToCart.save()
        return res.json({
            data: saveProduct,
            message: "Product Added to Cart",
            success: true,
            error: false
        })
    } catch (err) {
        res.json({
            message: err.message,
            error: true,
            success: false
        })
    }
}

module.exports = addToCartController