const Queue = require("bull");
require("dotenv").config();

const stockQueue = new Queue("stock-updates", {
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
  },
});

// Add error handling
stockQueue.on("error", (error) => {
  console.error("Stock Queue Error:", error);
});

stockQueue.on("failed", (job, error) => {
  console.error("Job Failed:", job.id, error);
});

module.exports = stockQueue;
