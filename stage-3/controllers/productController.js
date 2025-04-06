const Product = require("../models/productModel");
const redisClient = require("../config/redisClient");

// Helper function to invalidate product caches
async function invalidateProductCaches(productId) {
  try {
    // Invalidate specific product cache
    await redisClient.del(`product:${productId}`);
    // Invalidate all products cache
    await redisClient.del("products:all");
    console.log(`[Cache Invalidation] Product ID: ${productId}`);
  } catch (error) {
    console.error("Error invalidating product caches:", error);
  }
}

async function getAllProducts(req, res) {
  try {
    const cacheKey = "products:all";

    // Try to get from cache first
    const cachedProducts = await redisClient.get(cacheKey);
    if (cachedProducts) {
      console.log("[Cache Hit] All Products");
      return res.json(JSON.parse(cachedProducts));
    }

    // If not in cache, get from database
    const products = await Product.getAllProducts();

    // Convert raw array format into structured JSON objects
    const formattedProducts = products.map((product) => ({
      productId: product.PRODUCT_ID || product.product_id,
      name: product.NAME || product.name,
      price: product.PRICE || product.price,
    }));

    // Cache the result for 60 seconds
    await redisClient.set(cacheKey, JSON.stringify(formattedProducts), {
      EX: 60,
    });

    console.log(`Fetched ${formattedProducts.length} products successfully`);
    res.json(formattedProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Error fetching products", error });
  }
}

async function getProductById(req, res) {
  try {
    const cacheKey = `product:${req.params.id}`;

    // Try to get from cache first
    const cachedProduct = await redisClient.get(cacheKey);
    if (cachedProduct) {
      console.log(`[Cache Hit] Product ID: ${req.params.id}`);
      return res.json(JSON.parse(cachedProduct));
    }

    // If not in cache, get from database
    const product = await Product.getProductById(req.params.id);

    if (!product) {
      console.warn(`Product ID ${req.params.id} not found`);
      return res.status(404).json({ message: "Product not found" });
    }

    // Format response properly
    const formattedProduct = {
      productId: product.PRODUCT_ID || product.product_id,
      name: product.NAME || product.name,
      price: product.PRICE || product.price,
    };

    // Cache the result for 60 seconds
    await redisClient.set(cacheKey, JSON.stringify(formattedProduct), {
      EX: 60,
    });

    console.log(`Fetched product:`, formattedProduct);
    res.json(formattedProduct);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Error fetching product", error });
  }
}

async function createProduct(req, res) {
  try {
    const { name, price } = req.body;
    const productId = await Product.createProduct(name, price);

    // Invalidate caches after successful creation
    await invalidateProductCaches(productId);

    res
      .status(201)
      .json({ message: "Product created successfully", productId });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Error creating product", error });
  }
}

async function updateProduct(req, res) {
  try {
    const { name, price } = req.body;
    const productId = req.params.id;
    await Product.updateProduct(productId, name, price);

    // Invalidate caches after successful update
    await invalidateProductCaches(productId);

    res.json({ message: "Product updated successfully" });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Error updating product", error });
  }
}

async function deleteProduct(req, res) {
  try {
    const productId = req.params.id;
    await Product.deleteProduct(productId);

    // Invalidate caches after successful deletion
    await invalidateProductCaches(productId);

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Error deleting product", error });
  }
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
