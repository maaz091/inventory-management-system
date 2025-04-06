# Stage 1

## Design Decisions

### Architecture

- **MVC Pattern**: Models handle data, Controllers process requests, Routes define endpoints

### Database

- **SQLite**: Serverless database with two tables:
  - `products`: Product information with non-negative quantities
  - `stock_movements`: Inventory change tracking with timestamps

### Technology Stack

- Node.js + Express.js backend
- SQLite3 database
- Simple JSON APIs

## Assumptions

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

## API Design

### Base URL

```
http://localhost:3000/inventory
```

### Endpoints

1. **Add Product**

   ```
   POST /addProduct
   ```

2. **Get All Products**

   ```
   GET /getproducts
   ```

3. **Update Stock**
   ```
   POST /updateStock
   ```

### Error Responses

- 400: Invalid input/insufficient stock
- 404: Product not found
- 500: Server error

### Data Models

1. **Product**: id, name, quantity
2. **StockMovement**: id, product_id, quantity, type, timestamp
