const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const Cartdata = require("../models/carts.models");

// Add product to user's cart
async function addProductToCart(userId, productId, variant) {
    try {
        const { color, ram, storage } = variant;

        // Find user's cart
        let cart = await Cartdata.findOne({
            user: userId,
        });

        // Check if same product + same variant already exists
        if (cart) {
            const alreadyExists = cart.items.some(
                (item) =>
                    item.product.toString() === productId &&
                    item.variant.color === color &&
                    item.variant.ram === ram &&
                    item.variant.storage === storage
            );

            if (alreadyExists) {
                return {
                    alreadyExists: true,
                    cart: null,
                };
            }
        }

        // If cart doesn't exist, create a new cart
        if (!cart) {
            cart = new Cartdata({
                user: userId,
                items: [
                    {
                        product: productId,
                        variant: {
                            color,
                            ram,
                            storage,
                        },
                        quantity: 1,
                    },
                ],
            });
        }

        // If cart already exists, add the new item
        else {
            cart.items.push({
                product: productId,
                variant: {
                    color,
                    ram,
                    storage,
                },
                quantity: 1,
            });
        }

        // Save cart
        const savedCart = await cart.save();

        return {
            alreadyExists: false,
            cart: savedCart,
        };

    } catch (error) {
        throw error;
    }
}

// to send data to DB
router.post("/", authMiddleware, async (req, res) => {
    try {
        const { productId, variant } = req.body;

        // Validate product
        if (!productId || !variant) {
            return res.status(400).json({
                error: "Product and variant are required",
            });
        }

        // Validate variant
        const { color, ram, storage } = variant;

        if (!color || !ram || !storage) {
            return res.status(400).json({
                error: "Color, RAM and storage are required",
            });
        }

        // Get logged-in user
        const userId = req.user._id;

        // Add product to cart
        const result = await addProductToCart(
            userId,
            productId,
            variant
        );

        // Duplicate product
        if (result.alreadyExists) {
            return res.status(409).json({
                error: "This product variant is already in your cart",
            });
        }

        // Success
        res.status(201).json({
            message: "Product added to cart successfully",
            cart: result.cart,
        });

    } catch (error) {
        console.error("Add to cart error:", error);

        res.status(500).json({
            error: "Failed to add product to cart",
        });
    }
});

// TO GET LOGGED-IN USER'S CART
async function getCartData(userId) {
    try {
        const cart = await Cartdata.findOne({
            user: userId,
        }).populate("items.product");

        return cart;
    } catch (error) {
        throw error;
    }
}

router.get("/", authMiddleware, async (req, res) => {
    try {

        const userId = req.user._id;

        const cart = await getCartData(userId);

        if (!cart) {
            return res.status(200).json({
                items: [],
            });
        }

        res.status(200).json(cart);

    } catch (error) {
        console.error("Get cart error:", error);

        res.status(500).json({
            error: "Failed to get cart",
        });
    }
});

// to remove items from cart
async function removeCartItem(userId, itemId) {
    try {
        const cart = await Cartdata.findOne({
            user: userId,
        });

        if (!cart) {
            return null;
        }

        cart.items = cart.items.filter(
            (item) => item._id.toString() !== itemId
        );

        await cart.save();

        return cart;
    } catch (error) {
        throw error;
    }
}

router.delete("/item/:itemId", authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id;
        const { itemId } = req.params;

        const updatedCart = await removeCartItem(userId, itemId);

        if (!updatedCart) {
            return res.status(404).json({
                error: "Cart not found",
            });
        }

        res.status(200).json({
            message: "Item removed successfully",
            cart: updatedCart,
        });

    } catch (error) {
        console.error("Remove cart item error:", error);

        res.status(500).json({
            error: "Failed to remove cart item",
        });
    }
});

module.exports = router;