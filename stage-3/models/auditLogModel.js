const oracledb = require("oracledb");
require("dotenv").config();

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.autoCommit = true;

const auditLogModel = {
  async logAction(actionType, stockId, storeId, productId, quantity) {
    if (
      !actionType ||
      !stockId ||
      !storeId ||
      !productId ||
      quantity === undefined
    ) {
      throw new Error("Missing required fields for audit log");
    }

    const connection = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECTION_STRING,
    });

    try {
      await connection.execute(
        `INSERT INTO audit_logs (action_type, stock_id, store_id, product_id, quantity) 
         VALUES (:action_type, :stock_id, :store_id, :product_id, :quantity)`,
        {
          action_type: actionType,
          stock_id: Number(stockId),
          store_id: Number(storeId),
          product_id: Number(productId),
          quantity: Number(quantity),
        },
        { autoCommit: true }
      );
    } finally {
      await connection.close();
    }
  },
};

module.exports = auditLogModel;
