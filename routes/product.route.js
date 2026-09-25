const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const ProductData = require("../models/product.models");

async function createPhoneData(newData) {
    try {
        const productData = await ProductData(newData);
        const saveData = productData.save();
        return saveData;
    } catch (error) {
        throw error;
    }
}

//for sending new data to DB ----------------------------------
router.post("/", authMiddleware, async(req, res) => {
    try {
        const phonedata = await createPhoneData(req.body);
        res.status(200).json({message: "Data added successfully", phonedata: phonedata});
    } catch (error) {
        res.status(500).json({error: "Failed to add data to Database"})
    }
})

//to get all the data from DB -----------------------------------
async function getAllPhones(){
    try {
       const allPhoneData = await ProductData.find();
       return allPhoneData; 
    } catch (error) {
        throw error;
    }
}

router.get("/", authMiddleware, async(req, res) => {
    try {
        const showAllData = await getAllPhones();
        if(showAllData.length != 0){
            res.json(showAllData);
        } else {
            res.status(404).json({error: "Data not found"});
        }  
    } catch (error) {
        res.status(500).json({error: "Failed to fetch data"});
    }
});

//to update DB ------------------------------------------------------
async function updatePhoneData(productId, dataToUpdate){
    try {
        const updatePhoneData = await ProductData.findByIdAndUpdate(productId, dataToUpdate, {new:true});
        return updatePhoneData;
    } catch (error) {
        throw error;
    }
}

router.post("/:productId", authMiddleware, async(req, res) => {
    try {
        const updateData = await updatePhoneData(req.params.phoneId, req.body);
        if(updateData){
            res.status(200).json({message: "Data updated successfully", updateData:updateData})
        } else {
            res.status(404).json({error: "Phone not found"})
        }
    } catch (error) {
        res.status(500).json({error: "Failed to update"})
    }
})

//to get product by productId from the DB ---------------------------------
async function getByProductId(productId){
    try {
        const productById = await ProductData.findById(productId);
        return productById;
    } catch (error) {
        throw error;
    }
}

router.get("/productdetails/:productId", authMiddleware, async(req, res) => {
    try {
        const getProductById = await getByProductId(req.params.productId);
        if(getProductById){
            res.json(getProductById);
        } else {
            res.status(404).json({error: "Product not found"});
        }
    } catch (error) {
        res.status(500).json({error: "Failed to get the data"});
    }
});

module.exports = router;