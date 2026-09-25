const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const WishlistData = require("../models/wishlists.models");

async function createwishlistdata(newData){
    try {
        const wishlistdata = await WishlistData(newData);
        const saveData = wishlistdata.save();
        return saveData;
    } catch (error) {
        throw error;
    }
};

// to send data to DB -----------
router.post("/", authMiddleware, async(req, res) => {
    try {
        const newWishListData = await createwishlistdata(req.body);
        res.status(200).json({message: "Data added seccessfully", newWishListData: newWishListData});
    } catch (error) {
        res.status(500).json({error: "Failed to add data to database"});
    }
});

// to get all the products from DB
async function getAllProducts(){
    try {
        const allProducts = await WishlistData.find();
        return allProducts;
    } catch (error) {
        throw error;
    }
}

router.get("/", authMiddleware, async(req, res) => {
    try {
        const allPhones = await getAllProducts();
        if(allPhones.length != 0){
            res.json(allPhones);
        } else {
            res.status(404).json({error: "Data not found"})
        }
    } catch (error) {
        res.status(500).json({error: "Failed to get data"});
    }
})

// to delete from DB
async function deleteProductIds(productId){
    try {
        const deleteProduct = await WishlistData.findByIdAndDelete(productId);
        return deleteProduct;
    } catch (error) {
        throw error;
    }
}

router.delete("/:wishlistId", authMiddleware, async(req, res)=> {
    try {
        const deleteData = await deleteProductIds(req.params.wishlistId);
        if(deleteData){
            res.status(200).json({message: "Data deleted successfully"});
        }
    } catch (error) {
        res.status(500).json({error: "Failed to delete product"})
    }
});

module.exports = router;