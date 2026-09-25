const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({

    name: {
        type: String,
        trim: true,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        default: null,
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true,
    },
    profilePicture: {
        type: String,
        default: "",
    },
    phone: {
        type: String,
        default: "",
    },
},
    {
        timestamps: true,
    });

const User = mongoose.model("User", UserSchema);

module.exports = User;