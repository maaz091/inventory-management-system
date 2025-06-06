const Redis = require("redis");
require("dotenv").config();

const redisClient = Redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));
redisClient.on("connect", () => console.log("Redis Client Connected"));

// Connect to Redis
(async () => {
  await redisClient.connect();
})();

module.exports = redisClient;
