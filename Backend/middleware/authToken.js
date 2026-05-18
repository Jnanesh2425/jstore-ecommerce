// middleware/authToken.jsx
const jwt = require('jsonwebtoken');

async function authToken(req, res, next) { //Creates a middleware function called authToken.
    try {
        const token = req.cookies?.token; // Get token from cookie

        if (!token) {
            return res.status(401).json({
                message: 'User not logged in',
                error: true,
                success: false
            });
        }

        jwt.verify(token, process.env.TOKEN_SECRET_KEY, (err, decoded) => { //Checks if the token is valid
            if (err) {
                return res.status(403).json({
                    message: 'Invalid or expired token',
                    error: true,
                    success: false
                });
            }

            req.userId = decoded?._id; //  Save user ID to request object
            next(); // Proceed to controller/middleware
        });

    } catch (err) {
        res.status(500).json({
            message: err.message || "Internal server error",
            error: true,
            success: false
        });
    }
}

module.exports = authToken;
