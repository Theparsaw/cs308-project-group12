# Product API Documentation

## Base URL
http://localhost:3000

## Endpoints

### 1. Get All Products
- **Route:** GET /products
- **Description:** Returns all products in the database
- **Response:** 200 OK
- **Example:** `curl http://localhost:3000/products`

### 2. Get One Product
- **Route:** GET /products/:id
- **Description:** Returns a single product by product_id
- **Response:** 200 OK, 404 if not found
- **Example:** `curl http://localhost:3000/products/p001`

### 3. Create a Product
- **Route:** POST /products
- **Description:** Creates a new product
- **Response:** 201 Created, 400 if bad data
- **Example:** `curl -X POST http://localhost:3000/products -H "Content-Type: application/json" -d '{"product_id":"p019","name":"Test Jacket",...}'`

### 4. Update a Product
- **Route:** PUT /products/:id
- **Description:** Updates an existing product by product_id
- **Response:** 200 OK, 404 if not found
- **Example:** `curl -X PUT http://localhost:3000/products/p001 -H "Content-Type: application/json" -d '{"price":39.99}'`

### 5. Delete a Product
- **Route:** DELETE /products/:id
- **Description:** Deletes a product by product_id
- **Response:** 200 OK, 404 if not found
- **Example:** `curl -X DELETE http://localhost:3000/products/p001`

## Status Codes
- 200 — Success
- 201 — Created successfully
- 400 — Bad request (missing or invalid data)
- 404 — Product not found
- 500 — Server error