const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema({
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
    originalPrice: {
        type: Number,
        required: true,
        min: 0,
    },
    discountedPrice: {
        type: Number,
        required: true,
        min: 0,
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0,
    },
    imageUrl: {
        type: String,
        default: "",
    },
},
    { _id: true, }
);

const productSchema = new mongoose.Schema({
    smallHeader: {
        type: String,
        required: true,
        trim: true,
    },
    largeHeader: {
        type: String,
        required: true,
        trim: true,
    },
    brand: {
        type: String,
        required: true,
        trim: true,
    },
    modelRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },
    ratingCount: {
        type: Number,
        default: 0,
        min: 0,
    },
    reviewsCount: {
        type: Number,
        default: 0,
        min: 0,
    },
    newArrival: {
        type: Boolean,
        default: false,
    },
    variants: {
        type: [variantSchema],
        required: true,
    },
    processor: {
        brand: { type: String, required: true, trim: true, },
        type: { type: String, required: true, trim: true, },
    },
    display: {
        type: String,
        required: true,
        trim: true,
    },
    frontCam: {
        type: String,
        required: true,
        trim: true,
    },
    backCam: {
        type: String,
        required: true,
        trim: true,
    },
    battery: {
        type: String,
        required: true,
        trim: true,
    },
    weight: {
        type: String,
        required: true,
        trim: true,
    },
    os: {
        type: String,
        required: true,
        trim: true,
    },
    hybridSimSlot: {
        type: Boolean,
        required: true,
    },
});

const Product = mongoose.model("productData", productSchema);

module.exports = Product;