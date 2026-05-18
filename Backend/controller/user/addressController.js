const addressModel = require('../../models/addressModel.js');
const { v4: uuidv4 } = require('uuid');

// Add address
exports.addAddress = async (req, res) => {
    try {
        const userId = req.userId;
        const { name, phone, email, addressLine1, addressLine2, city, state, postalCode, country, addressType } = req.body;

        let userAddress = await addressModel.findOne({ userId });

        const newAddress = {
            id: uuidv4(),
            name,
            phone,
            email,
            addressLine1,
            addressLine2,
            city,
            state,
            postalCode,
            country,
            addressType: addressType || 'home',
            isDefault: !userAddress || userAddress.addresses.length === 0
        };

        if (!userAddress) {
            userAddress = await addressModel.create({
                userId,
                addresses: [newAddress]
            });
        } else {
            userAddress.addresses.push(newAddress);
            await userAddress.save();
        }

        return res.json({
            message: "Address added successfully",
            success: true,
            data: userAddress
        });
    } catch (error) {
        return res.status(400).json({
            message: error.message || "Error adding address",
            success: false
        });
    }
};

// Get all addresses
exports.getAddresses = async (req, res) => {
    try {
        const userId = req.userId;
        const userAddress = await addressModel.findOne({ userId });

        return res.json({
            message: "Addresses fetched",
            success: true,
            data: userAddress?.addresses || []
        });
    } catch (error) {
        return res.status(400).json({
            message: error.message || "Error fetching addresses",
            success: false
        });
    }
};

// Update address
exports.updateAddress = async (req, res) => {
    try {
        const userId = req.userId;
        const { addressId, ...updateData } = req.body;

        const result = await addressModel.findOneAndUpdate(
            { userId, "addresses.id": addressId },
            { $set: { "addresses.$": { ...updateData, id: addressId } } },
            { new: true }
        );

        return res.json({
            message: "Address updated",
            success: true,
            data: result
        });
    } catch (error) {
        return res.status(400).json({
            message: error.message || "Error updating address",
            success: false
        });
    }
};

// Delete address
exports.deleteAddress = async (req, res) => {
    try {
        const userId = req.userId;
        const { addressId } = req.body;

        const result = await addressModel.findOneAndUpdate(
            { userId },
            { $pull: { addresses: { id: addressId } } },
            { new: true }
        );

        return res.json({
            message: "Address deleted",
            success: true,
            data: result
        });
    } catch (error) {
        return res.status(400).json({
            message: error.message || "Error deleting address",
            success: false
        });
    }
};

// Set default address
exports.setDefaultAddress = async (req, res) => {
    try {
        const userId = req.userId;
        const { addressId } = req.body;

        await addressModel.findOneAndUpdate(
            { userId },
            { $set: { "addresses.$[].isDefault": false } },
            { arrayFilters: [] }
        );

        const result = await addressModel.findOneAndUpdate(
            { userId, "addresses.id": addressId },
            { $set: { "addresses.$.isDefault": true } },
            { new: true }
        );

        return res.json({
            message: "Default address set",
            success: true,
            data: result
        });
    } catch (error) {
        return res.status(400).json({
            message: error.message || "Error setting default address",
            success: false
        });
    }
};