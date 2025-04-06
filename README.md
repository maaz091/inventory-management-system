# Inventory Management System

A scalable, distributed inventory management system that has evolved from a simple single-store application to a multi-store, horizontally scalable system with advanced features.

## System Evolution Timeline

```
Stage 1 (Basic) → Stage 2 (Multi-Store) → Stage 3 (Scalable)
Simple API       → RESTful API          → Distributed API
SQLite           → OracleDB             → OracleDB + Redis
Single Server    → Single Server        → Multiple Servers + Nginx
No Auth          → JWT Auth             → JWT Auth + Rate Limiting
No Caching       → No Caching           → Redis Caching
Synchronous      → Synchronous          → Asynchronous (Bull Queue)
```

## Overview

This system provides a robust API for managing inventory across multiple stores. It supports stock operations (additions, sales, removals), product management, and store management with proper authentication and authorization. The system has evolved through three stages, each adding significant capabilities and architectural improvements.

## Features

1. **Multi-Store Support**

   - Each store has its own inventory
   - Stock levels are tracked per store
   - Stock movements are recorded with store information

2. **Stock Management**

   - A stock movement is created for every change (stock-in, sales, manual removals)
   - Stock levels cannot be negative (enforced via database constraints)
   - All stock movements are tracked with timestamps and user information
   - Stock movements require proper authorization and validation
   - Three types of stock movements are supported: STOCK_IN, SALE, MANUAL_REMOVE
   - Stock movements are atomic and automatically recorded
   - Stock quantity must be a valid number

3. **API Usage**

   - Clients must authenticate before making API requests
   - API responses should be fast and optimized for reporting
   - Rate limiting is enforced to prevent abuse
   - All API operations are logged for audit purposes
   - API responses include appropriate HTTP status codes
   - Error responses include descriptive messages

4. **Data Integrity**

   - Product catalog is managed centrally
   - Stock movements are atomic and consistent
   - Data validation is enforced at both API and database levels
   - Product existence is validated before stock operations
   - Stock quantities are validated for numeric values
   - Database constraints prevent invalid data

5. **Performance Requirements**

   - Fast response times for stock queries (< 200ms)
   - Support for concurrent operations across stores
   - Efficient handling of bulk operations
   - Optimized database queries for reporting
   - Database connections are properly managed and closed

6. **Error Handling**
   - All database operations are wrapped in try-catch blocks
   - Invalid stock quantities are rejected
   - Non-existent stores/products return 404 errors
   - Database errors return 500 status codes
   - Invalid input data returns 400 status codes

## API Design

### Authentication

```
POST /auth/register - Register a new user
POST /auth/login - Login user
```

### Products

```
GET /products - List all products
GET /products/:id - Get product details
POST /products - Create new product (requires authentication)
PUT /products/:id - Update product (requires authentication)
DELETE /products/:id - Delete product (requires authentication)
```

### Stores

```
GET /stores - List all stores
GET /stores/:id - Get store details
POST /stores - Create new store (requires authentication)
DELETE /stores/:id - Delete store (requires authentication)
```

### Stock

```
GET /stock/:storeId - Get all stock for a specific store
POST /stock - Add new stock (requires authentication)
PUT /stock/:stockId - Update stock quantity (requires authentication)
```

## Evolution Rationale (Stage 1 → Stage 3)

### Stage 1: Basic Implementation

- **Architecture**: Simple MVC pattern with Node.js + Express.js
- **Database**: SQLite with two tables (products, stock_movements)
- **API**: Basic JSON APIs with simple endpoints
- **Features**: Single store, basic stock tracking, no authentication
- **Limitations**: No multi-store support, limited scalability, no security

### Stage 2: Multi-Store Implementation

- **Architecture**: Enhanced MVC pattern with middleware-based security
- **Database**: OracleDB with normalized schema (stores, products, stock, stock_movements, users)
- **API**: RESTful API with proper endpoints and documentation
- **Features**: Multi-store support, JWT authentication, request throttling
- **Improvements**: Centralized product catalog, store-specific stock tracking, audit trail

### Stage 3: Scalable Implementation

- **Architecture**: Distributed system with Nginx load balancing
- **Database**: OracleDB with read/write separation + Redis for caching
- **API**: Distributed API with rate limiting and caching
- **Features**: Horizontal scalability, asynchronous processing, Redis caching
- **Improvements**: Multiple server instances, worker processes, event-driven architecture

## Design Decisions and Trade-offs

### 1. Database Evolution

**Stage 1**: SQLite → **Stage 2**: OracleDB → **Stage 3**: OracleDB + Redis

**Rationale**:

- SQLite was suitable for a simple single-store system
- OracleDB provided enterprise features needed for multi-store operations
- Redis added caching capabilities for improved performance

**Trade-offs**:

- Increased complexity with each database addition
- Higher operational costs with enterprise databases
- Need for proper data synchronization between systems

### 2. API Design Evolution

**Stage 1**: Simple API → **Stage 2**: RESTful API → **Stage 3**: Distributed API

**Rationale**:

- Simple API was sufficient for basic operations
- RESTful principles improved API consistency and usability
- Distributed API enabled horizontal scalability

**Trade-offs**:

- Increased development complexity
- Need for proper API versioning
- Potential for inconsistent API behavior across instances

### 3. Authentication Evolution

**Stage 1**: No authentication → **Stage 2**: JWT authentication → **Stage 3**: JWT + Rate limiting

**Rationale**:

- Basic system didn't require authentication
- JWT provided secure, stateless authentication for multi-store system
- Rate limiting protected the system from abuse

**Trade-offs**:

- Increased complexity in authentication flow
- Need for proper token management
- Potential performance impact from authentication checks

### 4. Scalability Evolution

**Stage 1**: Single server → **Stage 2**: Single server → **Stage 3**: Multiple servers + Nginx

**Rationale**:

- Single server was sufficient for initial implementation
- Enhanced single server handled multi-store operations
- Multiple servers with load balancing enabled horizontal scalability

**Trade-offs**:

- Increased operational complexity
- Need for proper session management
- Potential for race conditions in concurrent operations

### 5. Processing Evolution

**Stage 1**: Synchronous → **Stage 2**: Synchronous → **Stage 3**: Asynchronous (Bull Queue)

**Rationale**:

- Synchronous processing was simple and sufficient for basic operations
- Enhanced synchronous processing handled multi-store operations
- Asynchronous processing improved performance and reliability

**Trade-offs**:

- Increased system complexity
- Potential for eventual consistency issues
- Need for proper job monitoring and management

### 6. Caching Evolution

**Stage 1**: No caching → **Stage 2**: No caching → **Stage 3**: Redis caching

**Rationale**:

- Basic system didn't require caching
- Enhanced system could benefit from caching but wasn't implemented
- Redis caching significantly improved performance for read-heavy operations

**Trade-offs**:

- Need for proper cache invalidation
- Potential for stale data
- Additional infrastructure requirement

## Assumptions

### Stage 1 Assumptions

1. **Data Validation**:

   - Required product names
   - Non-negative quantities
   - Positive stock movements

2. **Business Rules**:

   - No negative stock
   - Movement types: STOCK_IN, SALE, MANUAL_REMOVE
   - Automatic movement timestamps

3. **System Requirements**:
   - Single server deployment
   - Local database
   - No user management

### Stage 2 Assumptions

1. **Store Operations**:

   - Each store has its own stock but shares a central product catalog
   - Stores can only modify their own stock levels
   - Store-specific stock tracking and reporting
   - Support for 500+ stores with independent operations

2. **Stock Movements**:

   - A stock movement is created for every change
   - Stock levels cannot be negative
   - All stock movements are tracked with timestamps and user information

3. **API Usage**:
   - Clients must authenticate before making API requests
   - API responses should be fast and optimized for reporting
   - Rate limiting is enforced to prevent abuse

### Stage 3 Assumptions

1. **Database**:

   - Oracle Database is available and properly configured
   - Database user has appropriate permissions
   - Database can handle the expected load

2. **Redis**:

   - Redis server is available and properly configured
   - Redis has sufficient memory for caching and queues
   - Redis connection is stable and reliable
   - Redis persistence is configured to prevent data loss
   - Redis cluster is set up for high availability (optional)

3. **Network**:

   - Network latency between components is acceptable
   - Network is stable and reliable
   - Firewall rules allow communication between components
   - Load balancer can properly distribute traffic
   - Network bandwidth is sufficient for the expected load

4. **Load**:

   - System is designed for moderate to high read operations
   - Write operations are less frequent but still significant
   - Peak load can be handled by the configured instances
   - Traffic patterns are predictable enough for proper scaling
   - Burst traffic can be handled by the caching layer

5. **Security**:

   - JWT authentication is sufficient for the use case
   - API keys are properly secured
   - Database credentials are properly protected
   - Redis connections are secured
   - Rate limiting effectively prevents abuse

6. **Asynchronous Processing**:

   - Job queues can handle the expected volume of stock operations
   - Failed jobs can be retried automatically
   - Job processing is idempotent to prevent duplicate operations
   - Worker processes can be scaled independently
   - Job monitoring is in place to detect issues

7. **Caching**:

   - Cache hit rates are high enough to justify the caching layer
   - Cache invalidation strategies are effective
   - Cache consistency is maintained across instances
   - Cache size is sufficient for the expected data volume
   - Cache expiration times are appropriate for the data

8. **Scalability**:

   - New server instances can be added without downtime
   - Load balancer can detect and remove unhealthy instances
   - Session state is managed appropriately across instances
   - Database connections are properly pooled and managed
   - Resource utilization is monitored for scaling decisions

9. **Monitoring and Observability**:

   - System metrics are collected and analyzed
   - Alerts are configured for critical issues
   - Logs are centralized and searchable
   - Performance bottlenecks can be identified
   - User experience is monitored end-to-end

10. **Disaster Recovery**:
    - System can recover from component failures
    - Data backups are regularly performed and tested
    - Failover procedures are documented and tested
    - Recovery time objectives are achievable
    - Data integrity is maintained during recovery

## Stage 3 Enhancements

### Horizontal Scalability with Nginx

The application is designed to work with multiple Node.js instances behind an Nginx load balancer. This allows the system to handle increased load by distributing requests across multiple server instances.

#### Nginx Configuration

```nginx
upstream nodejs_backend {
    server localhost:3001;  # Worker instance
    server localhost:3002;  # Regular instance
    server localhost:3003;  # Regular instance
}

server {
    listen 8080;
    server_name localhost;

    location / {
        proxy_pass http://nodejs_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Starting Multiple Server Instances

```bash
# Worker instance
$env:IS_WORKER='true'; $env:PORT=3001; node server.js

# Regular instances
$env:PORT=3002; node server.js
$env:PORT=3003; node server.js
```

### Asynchronous Processing with Bull Queue

Stock operations are processed asynchronously using Bull Queue, which is built on top of Redis. This allows the system to handle high volumes of stock updates without blocking the API.

#### Redis Setup

```bash
# Windows (using WSL or Docker)
docker run --name redis -p 6379:6379 -d redis

# Linux
sudo apt-get install redis-server
```

#### Redis Configuration

```env
REDIS_HOST=localhost
REDIS_PORT=6379
```

### Caching Strategy

The system implements a comprehensive caching strategy to improve performance:

1. **Redis Caching**

   - Product data is cached for 60 seconds
   - Store data is cached for 60 seconds
   - Stock data is cached for 60 seconds

2. **Cache Invalidation**

   - Product caches are invalidated on create/update/delete
   - Store caches are invalidated on create/delete
   - Stock caches are invalidated on any stock operation

3. **Cache Keys**
   - Products: `products:all`, `product:{id}`
   - Stores: `stores:all`, `store:{id}`
   - Stock: `stock:{id}`, `stock:store:{storeId}`

### Rate Limiting

API rate limiting is implemented using express-rate-limit to prevent abuse:

```javascript
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later",
});

app.use(limiter);
```

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
