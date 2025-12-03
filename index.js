const express = require("express");
const app = express();

app.use(express.json());

const cors = require("cors");
const corsOption = {
    origin: "*",
    credentials: true,
    optionSuccessStatus: 200,
};

app.use(cors(corsOption));

const { initialisedatabase } = require("./db/db.connect");
const PhoneData = require("./models/phone.models");

initialisedatabase();

async function createPhoneData(newData) {
    try {
        const phoneData = await PhoneData(newData);
        const saveData = phoneData.save();
        return saveData;
    } catch (error) {
        throw error;
    }
}

app.get("/", (req, res) => {
    res.send("Hello from express server")
});

//for sending new data to DB ----------------------------------
app.post("/products", async(req, res) => {
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
       const allPhoneData = await PhoneData.find();
       return allPhoneData; 
    } catch (error) {
        throw error;
    }
}

app.get("/products", async(req, res) => {
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
        const updatePhoneData = await PhoneData.findByIdAndUpdate(productId, dataToUpdate, {new:true});
        return updatePhoneData;
    } catch (error) {
        throw error;
    }
}

app.post("/products/:productId", async(req, res) => {
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
        const productById = await PhoneData.findById(productId);
        return productById;
    } catch (error) {
        throw error;
    }
}

app.get("/products/productdetails/:productId", async(req, res) => {
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
})


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});