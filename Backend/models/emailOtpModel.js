const mongoose = require('mongoose');

const emailOtpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300  // OTP expires in 5 minutes
    }
}, {
    collection: 'emailOtps'
});

let emailOtpModel = mongoose.models.emailOtp;
if (!emailOtpModel) {
    emailOtpModel = mongoose.model('emailOtp', emailOtpSchema);
}

const db = mongoose.connection.useDb("ecom_db");
if (!db.models.emailOtp) {
    db.model('emailOtp', emailOtpSchema);
}

module.exports = emailOtpModel;