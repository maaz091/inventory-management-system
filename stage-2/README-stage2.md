# Stage 2: Multi-Store Inventory Management System

## Database Schema

### Tables

1. **stores**

   - id (PK)
   - name
   - location
   - created_at
   - updated_at

2. **products**

   - id (PK)
   - name
   - description
   - created_at
   - updated_at

3. **stock**

   - id (PK)
   - store_id (FK)
   - product_id (FK)
   - quantity
   - created_at
   - updated_at

4. **stock_movements**

   - id (PK)
   - stock_id (FK)
   - quantity
   - type (STOCK_IN, SALE, MANUAL_REMOVE)
   - created_at

5. **users**
   - id (PK)
   - username
   - password (hashed)
   - created_at
   - updated_at

## Key Features

- Multi-store support with centralized product catalog
- Store-specific stock tracking
- JWT authentication
- RESTful API design
- OracleDB for robust data storage

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure environment variables:

   ```env
   # Database
   DB_USER=your_user
   DB_PASSWORD=your_password
   DB_CONNECTION_STRING=your_connection_string

   # JWT
   JWT_SECRET=your_jwt_secret

   # Server
   PORT=3000
   ```

3. Start the server:
   ```bash
   node server.js
   ```
