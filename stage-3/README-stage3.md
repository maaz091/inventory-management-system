# Stage 3: Distributed Inventory Management System

## Database Schema

### Tables

1. **stores**

   - store_id (PK)
   - name
   - location

2. **products**

   - product_id (PK)
   - name
   - price

3. **stock**

   - stock_id (PK)
   - store_id (FK)
   - product_id (FK)
   - quantity
   - last_updated

4. **stock_movements**

   - movement_id (PK)
   - store_id (FK)
   - product_id (FK)
   - quantity
   - movement_type (STOCK_IN, SALE, MANUAL_REMOVE)
   - movement_date

5. **users**

   - user_id (PK)
   - username
   - password_hash

6. **audit_logs**
   - id (PK)
   - action_type (STOCK_IN, SALE, MANUAL_REMOVE)
   - stock_id (FK)
   - store_id (FK)
   - product_id (FK)
   - quantity
   - timestamp

## Key Features

- Multi-store support with centralized product catalog
- Store-specific stock tracking
- JWT authentication
- RESTful API design
- OracleDB for robust data storage
- Redis caching for improved performance
- Asynchronous processing with Bull Queue
- Horizontal scalability with Nginx load balancing
- Rate limiting to prevent API abuse

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

   # Redis
   REDIS_HOST=localhost
   REDIS_PORT=6379

   # JWT
   JWT_SECRET=your_jwt_secret

   # Server
   PORT=3000
   IS_WORKER=false
   ```

3. Start Redis:

   ```bash
   # Using Docker
   docker run --name redis -p 6379:6379 -d redis
   ```

4. Start the server instances:

   ```bash
   # Worker instance
   $env:IS_WORKER='true'; $env:PORT=3001; node server.js

   # Regular instances
   $env:PORT=3002; node server.js
   $env:PORT=3003; node server.js
   ```

5. Configure Nginx (if using load balancing):

   ```bash
   # Install Nginx
   sudo apt-get install nginx

   # Configure Nginx
   sudo nano /etc/nginx/sites-available/inventory

   # Create symlink
   sudo ln -s /etc/nginx/sites-available/inventory /etc/nginx/sites-enabled/

   # Test configuration
   sudo nginx -t

   # Restart Nginx
   sudo systemctl restart nginx
   ```
