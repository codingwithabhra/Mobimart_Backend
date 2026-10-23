const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const Orderhistorydata = require("../models/orderhistory.models");

// ======================================================
// CREATE ORDER
// ======================================================

async function createOrderData(userId, orderData) {
    try {
        const newOrder = new Orderhistorydata({
            ...orderData,

            // User comes from authenticated JWT
            user: userId,
        });

        const savedOrder = await newOrder.save();

        return savedOrder;

    } catch (error) {
        throw error;
    }
}

router.post("/", authMiddleware, async (req, res) => {
    try {
        const {
            products,
            totalAmount,
            selectedAddress,
        } = req.body;

        // Validate products
        if (!products || !Array.isArray(products) || products.length === 0) {
            return res.status(400).json({
                error: "Products are required",
            });
        }

        // Validate total amount
        if (
            totalAmount === undefined ||
            totalAmount === null ||
            totalAmount < 0
        ) {
            return res.status(400).json({
                error: "Valid total amount is required",
            });
        }

        // Validate address
        if (!selectedAddress) {
            return res.status(400).json({
                error: "Delivery address is required",
            });
        }

        // Get logged-in user
        const userId = req.user._id;

        // Create order
        const order = await createOrderData(
            userId,
            {
                products,
                totalAmount,
                selectedAddress,
            }
        );

        // Success
        res.status(201).json({
            message: "Order placed successfully",
            order,
        });

    } catch (error) {
        console.error("Create order error:", error);

        res.status(500).json({
            error: "Failed to create order",
        });
    }
});


// ======================================================
// GET CURRENT USER'S ORDERS
// ======================================================

async function getOrderData(userId) {
    try {
        const orders = await Orderhistorydata
            .find({
                user: userId,
            })
            .sort({
                createdAt: -1,
            });

        return orders;

    } catch (error) {
        throw error;
    }
}

router.get("/", authMiddleware, async (req, res) => {
    try {

        // Get logged-in user
        const userId = req.user._id;

        // Get user's orders
        const orders = await getOrderData(userId);

        // Return empty array if no orders
        res.status(200).json(orders);

    } catch (error) {
        console.error("Get orders error:", error);

        res.status(500).json({
            error: "Failed to fetch orders",
        });
    }
});


module.exports = router;