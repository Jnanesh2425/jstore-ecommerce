const emailOtpModel = require('../../models/emailOtpModel');

async function verifyEmailOtpController(req, res) {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                message: 'Email and OTP are required',
                error: true,
                success: false
            });
        }

        // Find OTP record
        const otpRecord = await emailOtpModel.findOne({ 
            email: email.toLowerCase(),
            otp: otp.trim()
        });

        if (!otpRecord) {
            return res.status(400).json({
                message: 'Invalid or expired OTP',
                error: true,
                success: false
            });
        }

        // Delete OTP after successful verification
        await emailOtpModel.deleteOne({ _id: otpRecord._id });

        return res.status(200).json({
            message: 'Email verified successfully',
            error: false,
            success: true
        });
    } catch (error) {
        console.error('Error in verifyEmailOtpController:', error);
        return res.status(500).json({
            message: error.message || 'Error verifying OTP',
            error: true,
            success: false
        });
    }
}

module.exports = verifyEmailOtpController;