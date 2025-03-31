const Store = require("../models/storeModel");

async function getAllStores  (req, res)  {
    try {
        const stores = await Store.getAllStores();
        res.json(stores);
    } catch (error) {
        res.status(500).json({ message: "Error fetching stores", error });
    }
}

async function getStoreById   (req, res)  {
    try {
        const store = await Store.getStoreById(req.params.id);
        if (!store) return res.status(404).json({ message: "Store not found" });
        res.json(store);
    } catch (error) {
        res.status(500).json({ message: "Error fetching store", error });
    }
}

async function createStore  (req, res)  {
    try {
        const { name, location } = req.body;
        await Store.createStore(name, location);
        res.status(201).json({ message: "Store created successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error creating store", error });
    }
}

async function deleteStore   (req, res)  {
    try {
        await Store.deleteStore(req.params.id);
        res.json({ message: "Store deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting store", error });
    }
}

module.exports={deleteStore,createStore,getStoreById,getAllStores}