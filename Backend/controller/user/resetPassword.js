const passwordResetModel = require('../../models/passwordResetModel.js')
const userModel = require('../../models/userModel.js')
const bcrypt = require('bcryptjs')

async function resetPasswordController(req, res) {
  try {
    const { email, resetCode, password } = req.body

    if (!email || !resetCode || !password) {
      return res.status(400).json({
        message: 'Email, reset code, and password are required',
        error: true,
        success: false
      })
    }

    // Find reset record
    const resetRecord = await passwordResetModel.findOne({ email, resetCode })
    if (!resetRecord) {
      return res.status(400).json({
        message: 'Invalid or expired reset code',
        error: true,
        success: false
      })
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10)
    const hashPassword = await bcrypt.hash(password, salt)

    // Update user password
    const updateUser = await userModel.findOneAndUpdate(
      { email },
      { password: hashPassword },
      { new: true }
    )

    if (!updateUser) {
      return res.status(400).json({
        message: 'User not found',
        error: true,
        success: false
      })
    }

    // Delete reset code
    await passwordResetModel.deleteOne({ email, resetCode })

    return res.status(200).json({
      message: 'Password reset successfully',
      success: true
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return res.status(500).json({
      message: error.message || 'Server error',
      error: true,
      success: false
    })
  }
}

module.exports = resetPasswordController