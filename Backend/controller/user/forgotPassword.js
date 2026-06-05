const passwordResetModel = require('../../models/passwordResetModel.js')
const userModel = require('../../models/userModel.js')
const { sendPasswordResetEmail } = require('../../helpers/sendEmail.js')

async function forgotPasswordController(req, res) {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        message: 'Email is required',
        error: true,
        success: false
      })
    }

    // Check if user exists
    const user = await userModel.findOne({ email })
    if (!user) {
      return res.status(400).json({
        message: 'User not found with this email',
        error: true,
        success: false
      })
    }

    // Delete old reset codes for this email
    await passwordResetModel.deleteMany({ email })

    // Generate 6-digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString()

    // Save reset code
    const resetRecord = new passwordResetModel({
      email,
      resetCode
    })
    await resetRecord.save()

    // Send email
    await sendPasswordResetEmail(email, resetCode)

    return res.status(200).json({
      message: 'Password reset code sent to your email',
      success: true
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return res.status(500).json({
      message: error.message || 'Server error',
      error: true,
      success: false
    })
  }
}

module.exports = forgotPasswordController