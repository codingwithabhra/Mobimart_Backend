const express = require("express");
const app = express();
app.use(express.json());

const cors = require('cors');
const corsOption = {
    origin: ["http://localhost:5173", "https://lead-flow-kappa-lime.vercel.app"],
    credentials: true,
    optionSuccessStatus: 200,
};
app.use(cors(corsOption));

// ---------------------------------------- START SERVER ----------------------------------------

const startSever = async () => {
    try {
        const { initialiseDatabase } = require("./db/db.connect");
        await initialiseDatabase();

        // ---------------------------------------- ADDRESS ROUTES ----------------------------------------

        const addressRoutes = require("./routes/address.route");
        app.use("/address", addressRoutes);

        // ---------------------------------------- USER ROUTES ----------------------------------------

        const userRoutes = require("./routes/user.route");
        app.use("/auth", userRoutes);

        // ---------------------------------------- CART ROUTES ---------------------------------

        const cartRoutes = require("./routes/cart.route");
        app.use("/cart", cartRoutes);

        // ---------------------------------------- ORDER HISTORY ROUTES ---------------------------------

        const orderhistoryRoutes = require("./routes/orderhistory.route");
        app.use("/orderhistory", orderhistoryRoutes);

        // ---------------------------------------- PRODUCT ROUTES ---------------------------------

        const productRoutes = require("./routes/product.route");
        app.use("/product", productRoutes);

        // ---------------------------------------- WISHLIST ROUTES ---------------------------------

        const wishlistRoutes = require("./routes/wishlist.route");
        app.use("/wishlist", wishlistRoutes);

        // ---------------------------------------- TEST ROUTE ----------------------------------------

        app.get("/", (req, res) => {
            res.send("LeadFlow-Backend is Running 🚀");
        });

        // ---------------------------------------- SERVER ----------------------------------------

        const PORT = 3000;

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });

    } catch (error) {
        console.error("Failed to start server:", error);
    }
}

startSever();