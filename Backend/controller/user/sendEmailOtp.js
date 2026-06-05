const emailOtpModel = require('../../models/emailOtpModel');
const userModel = require('../../models/userModel');
const { generateOTP, sendOTPEmail } = require('../../helpers/otpHelper');

async function sendEmailOtpController(req, res) {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: 'Email is required',
                error: true,
                success: false
            });
        }

        // Check if email already exists
        const existingUser = await userModel.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                message: 'Email already registered',
                error: true,
                success: false
            });
        }

        // Delete previous OTP if exists
        await emailOtpModel.deleteOne({ email: email.toLowerCase() });

        // Generate new OTP
        const otp = generateOTP();

        // Save OTP to database
        const otpRecord = new emailOtpModel({
            email: email.toLowerCase(),
            otp: otp
        });
        await otpRecord.save();

        // Send OTP via email
        await sendOTPEmail(email, otp);

        return res.status(200).json({
            message: 'OTP sent successfully to your email',
            error: false,
            success: true
        });
    } catch (error) {
        console.error('Error in sendEmailOtpController:', error);
        return res.status(500).json({
            message: error.message || 'Error sending OTP',
            error: true,
            success: false
        });
    }
}

module.exports = sendEmailOtpController;