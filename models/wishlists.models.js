const mongoose = require("mongoose");

const wishlistItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product", // must match your Product model name
            required: true,
        },

        variant: {
            color: {
                type: String,
                required: true,
                trim: true,
            },

            ram: {
                type: String,
                required: true,
                trim: true,
            },

            storage: {
                type: String,
                required: true,
                trim: true,
            },
        },
    },
    {
        _id: true,
    }
);

const wishlistSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },

        items: [wishlistItemSchema],
    },
    {
        timestamps: true,
    }
);

const Wishlist = mongoose.model("Wishlist", wishlistSchema);

module.exports = Wishlist;