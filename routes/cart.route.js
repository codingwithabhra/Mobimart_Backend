const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const Cartdata = require("../models/carts.models");

//creating new cart data
async function createCartData(newData){
    try {
        const createCartData = await Cartdata(newData); 
        const savedata = createCartData.save();
        return savedata;
    } catch (error) {
        throw error;
    }
}

// to send data to DB
router.post("/", authMiddleware, async(req, res) => {
    try {
        const newCartData = await createCartData(req.body);
        res.status(200).json({message: "Data added successfully", newCartData: newCartData});
    } catch (error) {
        res.status(500).json({error: "Failed to add data to database"})
    }
});

// TO GET ALL DATA FROM DB
async function getAllData(){
    try {
        const alldata = await Cartdata.find();
        return alldata;
    } catch (error) {
        throw error;
    }
};

router.get("/", authMiddleware, async(req, res) => {
    try {
        const getCartItems = await getAllData();
        if(getCartItems.length != 0){
            res.json(getCartItems);
        } else {
            res.status(404).json({error: "Data not found"});
        }
    } catch (error) {
        res.status(500).json({error: "Failed to get data"});
    }
});

// to remove items from cart
async function deleteItemsfromCart(cartId){
    try {
        const deleteItems = await Cartdata.findByIdAndDelete(cartId);
        return deleteItems;
    } catch (error) {
        throw error;
    }
};

router.delete("/:cartId", authMiddleware, async(req, res) => {
    try {
        const deleteItems = await deleteItemsfromCart(req.params.cartId);
        if(deleteItems){
            res.status(200).json({message: "Data deleted successfully"});
        }
    } catch (error) {
        res.status(500).json({error: "Failed to delete cart item"});
    }
});

module.exports = router;