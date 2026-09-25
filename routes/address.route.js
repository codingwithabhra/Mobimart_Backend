const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const Addressdata = require("../models/addresss.models");

//creating new address data
async function createAddressData(newData){
    try {
        const createAddressData = await Addressdata(newData); 
        const savedata = await createAddressData.save();
        return savedata;
    } catch (error) {
        throw error;
    }
};

// to send data to DB
router.post("/", authMiddleware, async(req, res) => {
    try {
        const newaddressData = await createAddressData(req.body);
        res.status(200).json({message: "Data added successfully", newaddressData: newaddressData});
    } catch (error) {
        res.status(500).json({error: "Failed to add data to database"})
    }
});

// to get all address from DB
async function getAllAddress(){
    try {
        const allAddress = await Addressdata.find();
        return allAddress;
    } catch (error) {
        throw error;
    }
}

router.get("/", authMiddleware, async(req, res) => {
    try {
        const allAddress = await getAllAddress();
        if(allAddress.length != 0){
            res.json(allAddress);
        } else {
            res.status(404).json({error: "Data not found"})
        }
    } catch (error) {
        res.status(500).json({error: "Failed to get data"});
    }
});

// to delete from DB
async function deleteAddress(addressId){
    try {
        const deleteAddress = await Addressdata.findByIdAndDelete(addressId);
        return deleteAddress;
    } catch (error) {
        throw error;
    }
}

router.delete("/:addressId", authMiddleware, async(req, res)=> {
    try {
        const deleteData = await deleteAddress(req.params.addressId);
        if(deleteData){
            res.status(200).json({message: "Data deleted successfully"});
        }
    } catch (error) {
        res.status(500).json({error: "Failed to delete address"})
    }
});

//to update DB 
async function updateAddress(addressId, dataToUpdate){
    try {
        const updateAddressData = await Addressdata.findByIdAndUpdate(addressId, dataToUpdate, {new:true});
        return updateAddressData;
    } catch (error) {
        throw error;
    }
}

router.post("/:addressId", authMiddleware, async(req, res) => {
    try {
        const updateData = await updateAddress(req.params.addressId, req.body);
        if(updateData){
            res.status(200).json({message: "Data updated successfully", updateData:updateData})
        } else {
            res.status(404).json({error: "Address not found"})
        }
    } catch (error) {
        res.status(500).json({error: "Failed to update"})
    }
});

module.exports = router;