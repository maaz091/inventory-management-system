const oracledb = require("oracledb");
require("dotenv").config();

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.autoCommit = true;

const StockMovement = {
  async recordMovement(storeId, productId, quantity, movementType) {
    if (!storeId || !productId || quantity === undefined || !movementType) {
      throw new Error("Missing required fields for stock movement");
    }

    const connection = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECTION_STRING,
    });

    try {
      await connection.execute(
        `INSERT INTO stock_movements (store_id, product_id, quantity, movement_type) 
         VALUES (:store_id, :product_id, :quantity, :movement_type)`,
        {
          store_id: Number(storeId),
          product_id: Number(productId),
          quantity: Number(quantity),
          movement_type: movementType,
        },
        { autoCommit: true }
      );
    } finally {
      await connection.close();
    }
  },

  async getMovementsByStore(store_id) {
    const connection = await oracledb.getConnection();
    const result = await connection.execute(
      "SELECT * FROM stock_movements WHERE store_id = :store_id",
      [store_id]
    );
    await connection.close();
    return result.rows;
  },
};

module.exports = StockMovement;
