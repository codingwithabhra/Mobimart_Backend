const mongoose = require("mongoose");

const phoneSchema = new mongoose.Schema({
    imageUrl : {
        type: String,
        required: true,
    },
    smallHeader : {
        type: String,
        required: true,
    },
    largeHeader : {
        type: String,
        required: true,
    },
    modelRating: Number,
    ratingCount : Number,
    reviewsCount : Number,
    newArrival : {
        type: Boolean,
        required: true
    },
    originalPrice : {
        type: Number,
        required: true,
    },
    discountedPrice : {
        type: Number,
        required: true,
    },
    color : [Array],
    ram : [Array],
    processor : {
        brand : {type: String, required: true},
        type : {type: String, required: true},
    },
    storage : [Array],
    display : {
        type: String,
        required: true,
    },
    frontCam : {
        type: String,
        required: true,
    },
    backCam : {
        type: String,
        required: true,
    },
    battery : {
        type: String,
        required: true,
    },
    weight : {
        type: String,
        required: true,
    },
    os : {
        type: String,
        required: true,
    },
    hybridSimSlot : {
        type: Boolean,
        required: true,
    },
    brand : {
        type: String,
        required: true,
    }
});

const phoneData = mongoose.model("phoneData", phoneSchema);

module.exports = phoneData ;