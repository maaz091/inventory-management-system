const express = require("express");
const inventoryRoutes = require("./routes/inventoryroute");

const app = express();
app.use(express.json());
app.use("/inventory", inventoryRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
