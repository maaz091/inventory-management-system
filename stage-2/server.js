const express = require("express");
const rateLimiter = require("./middleware/rateLimiter");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const storeRoutes = require("./routes/storeRoutes");
const stockRoutes = require("./routes/stockRoutes");
const db = require("./config/db");

const app = express();
app.use(rateLimiter);
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/stores", storeRoutes);
app.use("/stock", stockRoutes);

const PORT = process.env.PORT || 3000;
db.initializeDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize the database:', err);
  });
