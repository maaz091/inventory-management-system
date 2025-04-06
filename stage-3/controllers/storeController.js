const Store = require("../models/storeModel");
const redisClient = require("../config/redisClient");

// Helper function to invalidate store caches
async function invalidateStoreCaches(storeId) {
  try {
    // Invalidate specific store cache
    await redisClient.del(`store:${storeId}`);
    // Invalidate all stores cache
    await redisClient.del("stores:all");
    // Invalidate store's stock cache
    await redisClient.del(`stock:store:${storeId}`);
    console.log(`[Cache Invalidation] Store ID: ${storeId}`);
  } catch (error) {
    console.error("Error invalidating store caches:", error);
  }
}

async function getAllStores(req, res) {
  try {
    const cacheKey = "stores:all";

    // Try to get from cache first
    const cachedStores = await redisClient.get(cacheKey);
    if (cachedStores) {
      console.log("[Cache Hit] All Stores");
      return res.json(JSON.parse(cachedStores));
    }

    // If not in cache, get from database
    const stores = await Store.getAllStores();

    // Format the response
    const formattedStores = stores.map((store) => ({
      storeId: store.STORE_ID || store.store_id,
      name: store.NAME || store.name,
      location: store.LOCATION || store.location,
    }));

    // Cache the result for 60 seconds
    await redisClient.set(cacheKey, JSON.stringify(formattedStores), {
      EX: 60,
    });

    res.json(formattedStores);
  } catch (error) {
    console.error("Error fetching stores:", error);
    res.status(500).json({ message: "Error fetching stores", error });
  }
}

async function getStoreById(req, res) {
  try {
    const cacheKey = `store:${req.params.id}`;

    // Try to get from cache first
    const cachedStore = await redisClient.get(cacheKey);
    if (cachedStore) {
      console.log(`[Cache Hit] Store ID: ${req.params.id}`);
      return res.json(JSON.parse(cachedStore));
    }

    // If not in cache, get from database
    const store = await Store.getStoreById(req.params.id);
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    // Format the response
    const formattedStore = {
      storeId: store.STORE_ID || store.store_id,
      name: store.NAME || store.name,
      location: store.LOCATION || store.location,
    };

    // Cache the result for 60 seconds
    await redisClient.set(cacheKey, JSON.stringify(formattedStore), {
      EX: 60,
    });

    res.json(formattedStore);
  } catch (error) {
    console.error("Error fetching store:", error);
    res.status(500).json({ message: "Error fetching store", error });
  }
}

async function createStore(req, res) {
  try {
    const { name, location } = req.body;
    const storeId = await Store.createStore(name, location);

    // Invalidate caches after successful creation
    await invalidateStoreCaches(storeId);

    res.status(201).json({ message: "Store created successfully", storeId });
  } catch (error) {
    console.error("Error creating store:", error);
    res.status(500).json({ message: "Error creating store", error });
  }
}

async function deleteStore(req, res) {
  try {
    const storeId = req.params.id;
    await Store.deleteStore(storeId);

    // Invalidate caches after successful deletion
    await invalidateStoreCaches(storeId);

    res.json({ message: "Store deleted successfully" });
  } catch (error) {
    console.error("Error deleting store:", error);
    res.status(500).json({ message: "Error deleting store", error });
  }
}

module.exports = {
  getAllStores,
  getStoreById,
  createStore,
  deleteStore,
};
