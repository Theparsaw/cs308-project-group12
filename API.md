### #API Documentation

- Base URL
http://localhost:5001/api

# Products Endpoints

- GET /api/products
Returns all products

- GET /api/products/:id
Returns a single product by productId

-- Example:
/api/products/p001

- POST /api/products
Create a new product


- Request body:

{
"productId": "p021",
"categoryId": "cat1",
"name": "Apple",
"model": "iPhone 16",
"serialNumber": "APL-IP16-001",
"description": "New product",
"quantityInStock": 10,
"price": 1399,
"warrantyStatus": "2 years",
"distributorInfo": "Apple Türkiye"
}

- PUT /api/products/:id
Update a product

-- Example body:

{
"price": 1500,
"quantityInStock": 5
}

- DELETE /api/products/:id
Delete a product

- Example:
/api/products/p021

# Notes

- Use productId (not Mongo _id)
- All fields are camelCase
