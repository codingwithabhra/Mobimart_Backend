const mongoose = require("mongoose");

const orderhistorySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    products: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
            },

            productName: {
                type: String,
                required: true,
            },

            quantity: {
                type: Number,
                required: true,
                min: 1,
            },

            price: {
                type: Number,
                required: true,
            },

            variant: {
                color: String,
                ram: String,
                storage: String,
            },
        },
    ],
    totalAmount: {
        type: Number,
        required: true,
    },
    selectedAddress: {
        name: String,
        phone: String,
        addressLine: String,
        city: String,
        state: String,
        pincode: String,
    },
    orderStatus: {
        type: String,
        enum: [
            "placed",
            "confirmed",
            "shipped",
            "delivered",
            "cancelled",
        ],
        default: "placed",
    },
},
    { timestamps: true }
);

const orderhistoryData = mongoose.model("orderhistoryData", orderhistorySchema);

module.exports = orderhistoryData;