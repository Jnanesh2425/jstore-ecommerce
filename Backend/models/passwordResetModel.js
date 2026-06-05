const mongoose = require('mongoose')

const passwordResetSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  resetCode: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300 // Expires after 5 minutes
  }
})

const passwordResetModel = mongoose.model('passwordReset', passwordResetSchema)

module.exports = passwordResetModel