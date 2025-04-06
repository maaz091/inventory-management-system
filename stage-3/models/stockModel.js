const oracledb = require("oracledb");
require("dotenv").config();

// Set outFormat to OBJECT to get named fields instead of arrays
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.autoCommit = true;

const Stock = {
  async getStockById(stockId, connection = null) {
    if (isNaN(stockId)) throw new Error("Invalid stock ID");
    console.log(`Fetching stock by ID: ${stockId}`);

    let conn = connection;
    let shouldClose = false;

    try {
      if (!conn) {
        conn = await oracledb.getConnection({
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          connectString: process.env.DB_CONNECTION_STRING,
        });
        shouldClose = true;
      }

      const result = await conn.execute(
        `SELECT stock_id, store_id, product_id, quantity FROM stock WHERE stock_id = :1`,
        [Number(stockId)],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (!result.rows || result.rows.length === 0) {
        console.log(`No stock found for ID: ${stockId}`);
        return null;
      }

      const stock = result.rows[0];
      console.log(`Found stock: ${JSON.stringify(stock)}`);
      return {
        stock_id: stock.STOCK_ID || stock.stock_id,
        store_id: stock.STORE_ID || stock.store_id,
        product_id: stock.PRODUCT_ID || stock.product_id,
        quantity: stock.QUANTITY || stock.quantity,
      };
    } finally {
      if (shouldClose && conn) await conn.close();
    }
  },

  async getStockByStore(storeId, connection = null) {
    if (isNaN(storeId)) throw new Error("Invalid store ID");
    console.log(`Fetching stock by store ID: ${storeId}`);

    let conn = connection;
    let shouldClose = false;

    try {
      if (!conn) {
        conn = await oracledb.getConnection({
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          connectString: process.env.DB_CONNECTION_STRING,
        });
        shouldClose = true;
      }

      const result = await conn.execute(
        `SELECT stock_id, store_id, product_id, quantity FROM stock WHERE store_id = :1`,
        [Number(storeId)]
      );

      console.log(
        `Found ${result.rows.length} stock items for store ${storeId}`
      );
      return result.rows;
    } finally {
      if (shouldClose && conn) await conn.close();
    }
  },

  async updateStockQuantity(stockId, quantity) {
    if (stockId === undefined || quantity === undefined) {
      throw new Error("Missing required values");
    }

    if (isNaN(stockId) || isNaN(quantity)) {
      throw new Error("Invalid number values");
    }

    const validStockId = parseInt(stockId, 10);
    const validQuantity = parseInt(quantity, 10);

    if (validQuantity < 0) throw new Error("Quantity cannot be negative");

    console.log(`Updating stock ${validStockId} quantity to ${validQuantity}`);
    const connection = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECTION_STRING,
    });

    try {
      const result = await connection.execute(
        `UPDATE stock SET quantity = :quantity WHERE stock_id = :stockId`,
        {
          quantity: validQuantity,
          stockId: validStockId,
        },
        { autoCommit: true }
      );

      console.log(`Updated ${result.rowsAffected} rows`);
      return result.rowsAffected;
    } finally {
      await connection.close();
    }
  },

  async addStock(store_id, product_id, quantity) {
    if (isNaN(store_id) || isNaN(product_id) || isNaN(quantity)) {
      throw new Error("Invalid store ID, product ID, or quantity");
    }

    const validStoreId = parseInt(store_id, 10);
    const validProductId = parseInt(product_id, 10);
    const validQuantity = parseInt(quantity, 10);

    if (validQuantity < 0) throw new Error("Quantity cannot be negative");

    console.log(
      `Adding stock: Store ${validStoreId}, Product ${validProductId}, Quantity ${validQuantity}`
    );
    const connection = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECTION_STRING,
    });

    try {
      const result = await connection.execute(
        `INSERT INTO stock (store_id, product_id, quantity) 
         VALUES (:store_id, :product_id, :quantity) 
         RETURNING stock_id INTO :stock_id`,
        {
          store_id: validStoreId,
          product_id: validProductId,
          quantity: validQuantity,
          stock_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
        },
        { autoCommit: true }
      );

      const newStockId = result.outBinds.stock_id[0];
      console.log(`Added new stock with ID: ${newStockId}`);
      return newStockId;
    } finally {
      await connection.close();
    }
  },
};

module.exports = Stock;
