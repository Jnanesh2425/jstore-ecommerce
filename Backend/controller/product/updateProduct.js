const uploadProductPermission = require("../../helpers/permission");
const productModel = require("../../models/productModel");

async function updateProductController(req, res) {
    try {
        // Check permission
        if (!uploadProductPermission(req.userId)) {
            throw new Error("Permission denied");
        }

        // Extract _id and rest of body
        const { _id, ...resBody } = req.body;

        // Update product
        const updatedProduct = await productModel.findByIdAndUpdate(
            _id,
            resBody,
            { new: true }   // return updated document
        );

        res.json({
            message: "Product updated successfully",
            data: updatedProduct,
            success: true,
            error: false
        });
    } catch (err) {
        res.status(400).json({
            message: err.message || err,
            error: true,
            success: false
        });
    }
}

module.exports = updateProductController;
