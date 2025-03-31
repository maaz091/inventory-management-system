const Product = require("../models/productModel");

async function getAllProducts(req, res) {
    try {
        const products = await Product.getAllProducts();

        // Convert raw array format into structured JSON objects
        const formattedProducts = products.map(product => ({
            productId: product[0],  
            name: product[1],       
            price: product[2],      
            quantity: product[3]    
        }));

        console.log(`Fetched ${formattedProducts.length} products successfully`);
        res.json(formattedProducts);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Error fetching products", error });
    }
}

async function getProductById(req, res) {
    try {
        const product = await Product.getProductById(req.params.id);

        if (!product) {
            console.warn(`Product ID ${req.params.id} not found`);
            return res.status(404).json({ message: "Product not found" });
        }

        // Format response properly
        const formattedProduct = {
            productId: product[0],
            name: product[1],
            price: product[2],
        };

        console.log(`Fetched product:`, formattedProduct);
        res.json(formattedProduct);
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ message: "Error fetching product", error });
    }
}


async function createProduct  (req, res)  {
    try {
        const { name, price } = req.body;
        await Product.createProduct(name, price);
        console.log("Product created successfully");

        res.status(201).json({ message: "Product created successfully" });
    } catch (error) {
        console.error("Error creating product:", error);

        res.status(500).json({ message: "Error creating product", error });
    }
}

async function updateProduct   (req, res)  {
    try {
        const { name, price } = req.body;
        await Product.updateProduct(req.params.id, name, price);
        console.log(`Product ID ${req.params.id} updated successfully`);

        res.json({ message: "Product updated successfully" });
    } catch (error) {
        console.error(`Error updating product ID ${req.params.id}:`, error);

        res.status(500).json({ message: "Error updating product", error });
    }
}

async function deleteProduct  (req, res)  {
    try {
        await Product.deleteProduct(req.params.id);
        console.log(`Product ID ${req.params.id} deleted successfully`);

        res.json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error(`Error deleting product ID ${req.params.id}:`, error);

        res.status(500).json({ message: "Error deleting product", error });
    }
}

module.exports =  {
    getAllProducts,
        getProductById,
        createProduct, updateProduct,
        deleteProduct



};