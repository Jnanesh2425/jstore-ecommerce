const mongoose = require('mongoose');

// Define the schema
const userSchema = new mongoose.Schema({
    name: String,
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: String,
    profilePic: String,
    role: String,
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        default: ''
    },
    phone: String
}
, {
    timestamps: true,
    collection: 'users' // This line tells Mongoose to use the 'users' collection
});

// Register on default connection (for populate to find it)
let userModel = mongoose.models.user;
if (!userModel) {
    userModel = mongoose.model('user', userSchema);
}

// Also ensure it's available on ecom_db connection
const db = mongoose.connection.useDb("ecom_db");
if (!db.models.user) {
    db.model('user', userSchema);
}

module.exports = userModel;
