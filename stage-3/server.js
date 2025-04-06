require("dotenv").config();
const express = require("express");
const { initializeDB } = require("./config/db");
const rateLimiter = require("./middleware/rateLimiter");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const storeRoutes = require("./routes/storeRoutes");
const stockRoutes = require("./routes/stockRoutes");

// Validate required environment variables
const requiredEnvVars = [
  "DB_USER",
  "DB_PASSWORD",
  "DB_CONNECTION_STRING",
  "REDIS_HOST",
  "REDIS_PORT",
  "JWT_SECRET",
];

const missingEnvVars = requiredEnvVars.filter(
  (varName) => !process.env[varName]
);

if (missingEnvVars.length > 0) {
  console.error("Missing required environment variables:", missingEnvVars);
  process.exit(1);
}

const app = express();

// Middleware
app.use(express.json());
app.use(rateLimiter);

// Routes
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/stores", storeRoutes);
app.use("/stock", stockRoutes);

const PORT = process.env.PORT || 3000;

// Initialize database and start server
initializeDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

    // Start worker process if this is the worker instance
    if (process.env.IS_WORKER === "true") {
      console.log("Starting stock worker in this instance...");
      require("./workers/stockWorker");
    }
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });
