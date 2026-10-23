const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const WishlistData = require("../models/wishlists.models");


// ======================================================
// ADD PRODUCT VARIANT TO WISHLIST
// ======================================================

async function addProductToWishlist(userId, productId, variant) {
    try {
        const { color, ram, storage } = variant;

        // Find user's wishlist
        let wishlist = await WishlistData.findOne({
            user: userId,
        });

        // Check if same product + same variant already exists
        if (wishlist) {
            const alreadyExists = wishlist.items.some(
                (item) =>
                    item.product.toString() === productId &&
                    item.variant.color === color &&
                    item.variant.ram === ram &&
                    item.variant.storage === storage
            );

            if (alreadyExists) {
                return {
                    alreadyExists: true,
                    wishlist: null,
                };
            }
        }

        // If wishlist doesn't exist, create a new wishlist
        if (!wishlist) {
            wishlist = new WishlistData({
                user: userId,
                items: [
                    {
                        product: productId,
                        variant: {
                            color,
                            ram,
                            storage,
                        },
                    },
                ],
            });
        }

        // If wishlist already exists, add new item
        else {
            wishlist.items.push({
                product: productId,
                variant: {
                    color,
                    ram,
                    storage,
                },
            });
        }

        // Save wishlist
        const savedWishlist = await wishlist.save();

        return {
            alreadyExists: false,
            wishlist: savedWishlist,
        };

    } catch (error) {
        throw error;
    }
}


// ======================================================
// POST - ADD PRODUCT TO WISHLIST
// ======================================================

router.post("/", authMiddleware, async (req, res) => {
    try {
        const { productId, variant } = req.body;

        // Validate product and variant
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

        // Add product to wishlist
        const result = await addProductToWishlist(
            userId,
            productId,
            variant
        );

        // Duplicate product variant
        if (result.alreadyExists) {
            return res.status(409).json({
                error: "This product variant is already in your wishlist",
            });
        }

        // Success
        res.status(201).json({
            message: "Product added to wishlist successfully",
            wishlist: result.wishlist,
        });

    } catch (error) {
        console.error("Add to wishlist error:", error);

        res.status(500).json({
            error: "Failed to add product to wishlist",
        });
    }
});


// ======================================================
// GET LOGGED-IN USER'S WISHLIST
// ======================================================

async function getWishlistData(userId) {
    try {
        const wishlist = await WishlistData.findOne({
            user: userId,
        }).populate("items.product");

        return wishlist;

    } catch (error) {
        throw error;
    }
}


router.get("/", authMiddleware, async (req, res) => {
    try {
        // Get logged-in user
        const userId = req.user._id;

        const wishlist = await getWishlistData(userId);

        // If wishlist doesn't exist
        if (!wishlist) {
            return res.status(200).json({
                items: [],
            });
        }

        res.status(200).json(wishlist);

    } catch (error) {
        console.error("Get wishlist error:", error);

        res.status(500).json({
            error: "Failed to get wishlist",
        });
    }
});


// ======================================================
// REMOVE/DELETE ITEM FROM WISHLIST
// ======================================================

async function removeWishlistItem(userId, itemId) {
    try {
        // Find user's wishlist
        const wishlist = await WishlistData.findOne({
            user: userId,
        });

        if (!wishlist) {
            return null;
        }

        // Remove item using item's _id
        wishlist.items = wishlist.items.filter(
            (item) => item._id.toString() !== itemId
        );

        // Save updated wishlist
        await wishlist.save();

        return wishlist;

    } catch (error) {
        throw error;
    }
}

router.delete("/item/:itemId", authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id;
        const { itemId } = req.params;

        const updatedWishlist = await removeWishlistItem(
            userId,
            itemId
        );

        // Wishlist doesn't exist
        if (!updatedWishlist) {
            return res.status(404).json({
                error: "Wishlist not found",
            });
        }

        res.status(200).json({
            message: "Wishlist item removed successfully",
            wishlist: updatedWishlist,
        });

    } catch (error) {
        console.error("Remove wishlist item error:", error);

        res.status(500).json({
            error: "Failed to remove wishlist item",
        });
    }
});


module.exports = router;