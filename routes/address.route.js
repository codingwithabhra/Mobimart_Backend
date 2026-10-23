const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const Addressdata = require("../models/addresss.models");


// =====================================================
// CREATE NEW ADDRESS
// =====================================================

async function createAddressData(userId, addressData) {
    try {
        const newAddress = new Addressdata({
            ...addressData,
            user: userId,
        });

        const savedAddress = await newAddress.save();

        return savedAddress;
    } catch (error) {
        throw error;
    }
}

router.post("/", authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id;

        const newAddress = await createAddressData(
            userId,
            req.body
        );

        res.status(201).json({
            message: "Address added successfully",
            address: newAddress,
        });
    } catch (error) {
        console.error("Create address error:", error);

        res.status(500).json({
            error: "Failed to add address",
        });
    }
});


// =====================================================
// GET ALL ADDRESSES OF LOGGED-IN USER
// =====================================================

async function getAllAddress(userId) {
    try {
        const allAddress = await Addressdata.find({
            user: userId,
        }).sort({ createdAt: -1 });

        return allAddress;
    } catch (error) {
        throw error;
    }
}

router.get("/", authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id;

        const allAddress = await getAllAddress(userId);

        res.status(200).json(allAddress);
    } catch (error) {
        console.error("Get addresses error:", error);

        res.status(500).json({
            error: "Failed to get addresses",
        });
    }
});


// =====================================================
// DELETE ADDRESS
// =====================================================

async function deleteAddress(addressId, userId) {
    try {
        const deletedAddress = await Addressdata.findOneAndDelete({
            _id: addressId,
            user: userId,
        });

        return deletedAddress;
    } catch (error) {
        throw error;
    }
}

router.delete("/:addressId", authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id;
        const addressId = req.params.addressId;

        const deletedAddress = await deleteAddress(
            addressId,
            userId
        );

        if (!deletedAddress) {
            return res.status(404).json({
                error: "Address not found",
            });
        }

        res.status(200).json({
            message: "Address deleted successfully",
            address: deletedAddress,
        });
    } catch (error) {
        console.error("Delete address error:", error);

        res.status(500).json({
            error: "Failed to delete address",
        });
    }
});


// =====================================================
// UPDATE ADDRESS
// =====================================================

async function updateAddress(addressId, userId, dataToUpdate) {
    try {
        const updatedAddress = await Addressdata.findOneAndUpdate(
            {
                _id: addressId,
                user: userId,
            },
            {
                $set: dataToUpdate,
            },
            {
                new: true,
                runValidators: true,
            }
        );

        return updatedAddress;
    } catch (error) {
        throw error;
    }
}

router.post("/:addressId", authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id;
        const addressId = req.params.addressId;

        const updatedAddress = await updateAddress(
            addressId,
            userId,
            req.body
        );

        if (!updatedAddress) {
            return res.status(404).json({
                error: "Address not found",
            });
        }

        res.status(200).json({
            message: "Address updated successfully",
            address: updatedAddress,
        });
    } catch (error) {
        console.error("Update address error:", error);

        res.status(500).json({
            error: "Failed to update address",
        });
    }
});


module.exports = router;