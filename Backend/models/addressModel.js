const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    addresses: [
        {
            id: String,
            name: String,
            phone: String,
            email: String,
            addressLine1: String,
            addressLine2: String,
            city: String,
            state: String,
            postalCode: String,
            country: String,
            isDefault: {
                type: Boolean,
                default: false
            },
            addressType: {
                type: String,
                enum: ['home', 'work', 'other'],
                default: 'home'
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ]
}, {
    timestamps: true
});

const db = mongoose.connection.useDb("ecom_db");
const addressModel = db.model("Address", addressSchema);

module.exports = addressModel;