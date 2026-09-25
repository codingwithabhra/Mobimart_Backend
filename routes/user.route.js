const express = require("express");
const router = express.Router();

const User = require("../models/user.models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const authMiddleware = require("../middleware/authMiddleware");


// ============================================================
// 1. POST /auth/signup
// EMAIL + PASSWORD SIGNUP
// ============================================================

router.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // ---------------- VALIDATION ----------------

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required",
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // ---------------- CHECK EXISTING USER ----------------

        const existingUser = await User.findOne({
            email: normalizedEmail,
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Email already registered",
            });
        }

        // ---------------- HASH PASSWORD ----------------

        const hashedPassword = await bcrypt.hash(password, 10);

        // ---------------- CREATE USER ----------------

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            profilePicture: "",
        });

        // ---------------- GENERATE JWT ----------------

        const token = jwt.sign(
            {
                _id: user._id,
                email: user.email,
                name: user.name,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );

        // ---------------- SAFE USER ----------------

        const safeUser = {
            _id: user._id,
            name: user.name,
            email: user.email,
            profilePicture: user.profilePicture,
        };

        return res.status(201).json({
            message: "User registered successfully",
            token,
            user: safeUser,
        });

    } catch (error) {
        console.error("Signup error:", error);

        return res.status(500).json({
            message: "Registration failed",
        });
    }
});


// ============================================================
// 2. POST /auth/login
// EMAIL + PASSWORD LOGIN
// ============================================================

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // ---------------- VALIDATION ----------------

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // ---------------- FIND USER ----------------

        const user = await User.findOne({
            email: normalizedEmail,
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        // ---------------- GOOGLE ACCOUNT CHECK ----------------

        if (!user.password) {
            return res.status(400).json({
                message:
                    "This account was registered with Google. Please login with Google.",
            });
        }

        // ---------------- CHECK PASSWORD ----------------

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        // ---------------- GENERATE JWT ----------------

        const token = jwt.sign(
            {
                _id: user._id,
                email: user.email,
                name: user.name,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );

        // ---------------- SAFE USER ----------------

        const safeUser = {
            _id: user._id,
            name: user.name,
            email: user.email,
            profilePicture: user.profilePicture,
        };

        return res.status(200).json({
            message: "Login successful",
            token,
            user: safeUser,
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Login failed",
        });
    }
});


// ============================================================
// 3. POST /auth/google
// GOOGLE LOGIN / SIGNUP
// ============================================================

router.post("/google", async (req, res) => {
    try {
        const { id_token } = req.body;

        // ---------------- VALIDATION ----------------

        if (!id_token) {
            return res.status(400).json({
                message: "Google ID token is required",
            });
        }

        // ---------------- VERIFY GOOGLE TOKEN ----------------

        const ticket = await client.verifyIdToken({
            idToken: id_token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        const {
            sub,
            email,
            name,
            picture,
            email_verified,
        } = payload;

        // ---------------- VERIFY GOOGLE EMAIL ----------------

        if (!email_verified) {
            return res.status(400).json({
                message: "Google email is not verified",
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // ---------------- FIND EXISTING GOOGLE USER ----------------

        let user = await User.findOne({
            googleId: sub,
        });

        // ---------------- CHECK EXISTING EMAIL ACCOUNT ----------------

        if (!user) {
            user = await User.findOne({
                email: normalizedEmail,
            });
        }

        // ========================================================
        // EXISTING USER
        // ========================================================

        if (user) {

            // Link Google account if not already linked
            if (!user.googleId) {
                user.googleId = sub;
            }

            // Add Google profile picture if user doesn't have one
            if (picture && !user.profilePicture) {
                user.profilePicture = picture;
            }

            await user.save();

        }

        // ========================================================
        // NEW GOOGLE USER
        // ========================================================

        else {

            user = await User.create({
                googleId: sub,
                email: normalizedEmail,
                name: name || "MobiMart User",
                profilePicture: picture || "",
                password: null,
            });
        }

        // ---------------- GENERATE JWT ----------------

        const token = jwt.sign(
            {
                _id: user._id,
                email: user.email,
                name: user.name,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }
        );

        // ---------------- SAFE USER ----------------

        const safeUser = {
            _id: user._id,
            name: user.name,
            email: user.email,
            profilePicture: user.profilePicture,
        };

        return res.status(200).json({
            message: "Google authentication successful",
            token,
            user: safeUser,
        });

    } catch (error) {
        console.error("Google authentication error:", error);

        return res.status(500).json({
            message: "Google authentication failed",
        });
    }
});


// ============================================================
// 4. GET /auth/profile
// GET CURRENTLY LOGGED-IN USER
// ============================================================

router.get("/profile", authMiddleware, async (req, res) => {
    try {

        const user = await User.findById(req.user._id).select(
            "-password -googleId"
        );

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        return res.status(200).json({
            message: "Profile fetched successfully",
            user,
        });

    } catch (error) {
        console.error("Profile error:", error);

        return res.status(500).json({
            message: "Failed to fetch profile",
        });
    }
});


module.exports = router;