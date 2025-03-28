# Stage 1: Inventory Management System

This stage focuses on tracking product inventory for a single kiryana store using SQLite.

## Features

- Add, remove, and update product stock.
- Track stock movements (STOCK_IN, SALE, MANUAL_REMOVE).
- Simple REST API for inventory management.

## Setup

1. Install dependencies:
   npm install

2. Run the server:
   nodemon server.js

3. Test using Postman.

## Database Schema

- `products` table: Stores product details.
- `stock_movements` table: Logs stock transactions.
