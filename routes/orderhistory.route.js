const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const Orderhistorydata = require("../models/orderhistory.models");

async function createOrderData(newData) {
    try {
        const newOrderData = await Orderhistorydata(newData);
        const saveData = newOrderData.save();
        return saveData;
    } catch (error) {
        throw error;
    }
};

//for sending new data to DB ----------------------------------
router.post("/", authMiddleware, async (req, res) => {
    try {
        const orderdata = await createOrderData(req.body);
        res.status(200).json({ message: "Data added successfully", orderdata: orderdata });
    } catch (error) {
        res.status(500).json({ error: "Failed to add data to Database" })
    }
});

//to get all the data from DB -----------------------------------
async function getAllOrders() {
    try {
        const getOrderData = await Orderhistorydata.find();
        return getOrderData;
    } catch (error) {
        throw error;
    }
};

router.get("/", authMiddleware, async (req, res) => {
    try {
        const getData = await getAllOrders();
        if (getData.length != 0) {
            res.json(getData);
        } else {
            res.status(404).json({ error: "Data not found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch data" });
    }
});

module.exports = router;