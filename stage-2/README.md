# Stage 2

## Design Decisions

### Technology Stack

- Node.js + Express.js backend
- OracleDB database
- RESTful JSON APIs

### Database Choice

- **OracleDB**: Chosen for its robust enterprise features, scalability, and strong support for complex queries
- **Schema Design**:
  - Centralized product catalog
  - Store-specific stock tracking
  - Separate stock movements table for audit trail
  - Normalized structure to prevent data redundancy
  - **Schema Overview**:
    - Stores (stores table) → Manages store information
    - Products (products table) → Centralized product catalog
    - Stock (stock table) → Maintains store-wise stock
    - Stock Movements (stock_movements table) → Logs stock changes
    - Users (users table) → stores details for registered users

### Architecture

- **MVC Pattern**: Separates concerns into Models, Views, and Controllers
- **Middleware-based Security**:
  - JWT for authentication
  - Rate limiting using Bottleneck
  - Request validation
- **Modular Design**: Each component (products, stores, stock) is isolated for better maintainability

### API Design

- **RESTful Principles**: Follows standard HTTP methods and status codes
- **Resource-based URLs**: Clear and intuitive endpoint structure
- **Consistent Response Format**: Standardized JSON responses with proper error handling

## Assumptions

1. **Store Operations**

   - Each store has its own stock but shares a central product catalog
   - Stores can only modify their own stock levels
   - Store-specific stock tracking and reporting
   - Support for 500+ stores with independent operations
   - Store existence is validated before any stock operations
   - Each store can have multiple products in stock

2. **Stock Movements**

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

## Evolution Rationale (Stage 1 → Stage 2)

### Stage 1 to Stage 2 Transition

1. **Data Storage**

   - Stage 1: Local storage (flat file/SQLite)
   - Stage 2: OracleDB for better scalability and concurrent access

2. **API Development**

   - Stage 1: Simple API
   - Stage 2: RESTful API with proper endpoints and documentation

3. **Security Implementation**

   - Stage 1: No authentication
   - Stage 2: JWT authentication and request throttling

4. **Scalability Features**

   - Stage 1: Single store focus
   - Stage 2: Multi-store support with central product catalog

5. **Reporting Capabilities**
   - Stage 1: Basic stock tracking
   - Stage 2: Advanced reporting by store and date range

## Getting Started

1. Install dependencies:

   -npm install

2. Configure environment variables:

   -Edit .env with your configuration

3. Start the server:

   -nodemon server.js
