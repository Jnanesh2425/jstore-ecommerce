const bcrypt = require('bcryptjs');
const userModel = require('../../models/userModel.js');
const jwt = require('jsonwebtoken');

// code is responsible for logging in a user by checking email and password
async function userSignInController(req, res) {
    try {
        const { email, password } = req.body;

        if (!email) {
            throw new Error('Please provide email'); // make sure email is provided
        }

        if (!password) {
            throw new Error('Please provide password'); // make sure password is provided
        }

        // check if user exists in DB
        const user = await userModel.findOne({ email });
        console.log('Found user:', user);

        if (!user) {
            throw new Error('User not found'); // if not found, return error
        }

        // compare password with hashed one from DB
        const checkPassword = await bcrypt.compare(password, user.password);
        console.log('checkPassword', checkPassword);

        if (!checkPassword) {
            throw new Error('Invalid credentials'); // if password is incorrect
        }

        // create token data
        const tokenData = {
            _id: user._id,
            email: user.email
        };

        // generate JWT token valid for 8 hours
        const token = jwt.sign(tokenData, process.env.TOKEN_SECRET_KEY, {
            expiresIn: 60 * 60 * 8 // 8 hours
        });

        const tokenOptions = {
            httpOnly: true,
            secure: true,
        };

        // only one response is sent with cookie and message
        res.cookie('token', token, tokenOptions)
            .status(200)
            .json({
                message: 'Login successful',
                success: true,
                error: false,
                data: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    profilePic: user.profilePic,
                    role: user.role,
                },
            });

    } catch (err) {
        // Handling any errors and sending error response
        res.status(500).json({            //sends the response in JSON format 
            message: err.message || err,
            error: true,
            success: false,
        });
    }
}

module.exports = userSignInController;
