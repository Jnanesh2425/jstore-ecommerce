const userModel = require("../../models/userModel.js");

async function userDetailsController(req, res) {
    try {
        console.log('userid', req.userId);
        const user = await userModel.findById(req.userId).select("-password"); // Don't send password

        res.status(200).json({
            data: user,
            error: false,
            success: true,
            message: 'User details fetched'
        });
    } catch (err) {
        res.status(400).json({
            message: err.message || "Error getting user",
            error: true,
            success: false
        });
    }
}

module.exports = userDetailsController;
