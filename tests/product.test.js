const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../backend/server");

beforeAll(async () => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Product API Endpoints", () => {
  // GET /products
  test("GET /products should return 200 and array of products", async () => {
    const res = await request(app).get("/products");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("GET /products should return 18 products", async () => {
    const res = await request(app).get("/products");
    expect(res.body.length).toBe(18);
  });

  test("GET /products should return products with required fields", async () => {
    const res = await request(app).get("/products");
    const product = res.body[0];
    expect(product).toHaveProperty("product_id");
    expect(product).toHaveProperty("name");
    expect(product).toHaveProperty("price");
    expect(product).toHaveProperty("stock_quantity");
    expect(product).toHaveProperty("category_id");
  });

  // GET /products/:id
  test("GET /products/p001 should return 200 and correct product", async () => {
    const res = await request(app).get("/products/p001");
    expect(res.statusCode).toBe(200);
    expect(res.body.product_id).toBe("p001");
  });

  test("GET /products/p001 should return Levis jeans", async () => {
    const res = await request(app).get("/products/p001");
    expect(res.body.name).toBe("Levi's 501 Original Jeans");
  });

  test("GET /products/p001 should return product with all required fields", async () => {
    const res = await request(app).get("/products/p001");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("product_id");
    expect(res.body).toHaveProperty("name");
    expect(res.body).toHaveProperty("price");
    expect(res.body).toHaveProperty("stock_quantity");
    expect(res.body).toHaveProperty("category_id");
    expect(res.body).toHaveProperty("warranty_status");
  });

  test("GET /products/fakeid should return 404", async () => {
    const res = await request(app).get("/products/fakeid");
    expect(res.statusCode).toBe(404);
  });

  test("GET /products/fakeid should return not found message", async () => {
    const res = await request(app).get("/products/fakeid");
    expect(res.body.message).toBe("Product not found");
  });

  // POST /products
  test("POST /products should create a new product and return 201", async () => {
    const res = await request(app).post("/products").send({
      product_id: "p099",
      category_id: "cat1",
      distributor_id: "dist1",
      name: "Test Product",
      model: "TP-001",
      serial_number: "SN-TP-099",
      description: "A test product",
      stock_quantity: 10,
      price: 29.99,
      warranty_status: false,
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.product_id).toBe("p099");
  });

  test("POST /products should return the created product name", async () => {
    const res = await request(app).post("/products").send({
      product_id: "p098",
      category_id: "cat1",
      distributor_id: "dist1",
      name: "Another Test Product",
      model: "TP-002",
      serial_number: "SN-TP-098",
      description: "Another test product",
      stock_quantity: 5,
      price: 19.99,
      warranty_status: false,
    });
    expect(res.body.name).toBe("Another Test Product");
  });

  test("POST /products with missing fields should return 400", async () => {
    const res = await request(app).post("/products").send({
      name: "Incomplete Product",
    });
    expect(res.statusCode).toBe(400);
  });

  test("POST /products with duplicate product_id should return 400 or 409", async () => {
    const res = await request(app).post("/products").send({
      product_id: "p001",
      category_id: "cat1",
      distributor_id: "dist1",
      name: "Duplicate Product",
      model: "DUP-001",
      serial_number: "SN-DUP-001",
      description: "Bu ürün zaten var",
      stock_quantity: 5,
      price: 9.99,
      warranty_status: false,
    });
    expect([400, 409]).toContain(res.statusCode);
  });

  test("POST /products with negative price should return 400", async () => {
    const res = await request(app).post("/products").send({
      product_id: "p097",
      category_id: "cat1",
      distributor_id: "dist1",
      name: "Negative Price Product",
      model: "NP-001",
      serial_number: "SN-NP-097",
      description: "Geçersiz fiyatlı ürün",
      stock_quantity: 5,
      price: -10,
      warranty_status: false,
    });
    expect(res.statusCode).toBe(400);
  });

  // PUT /products/:id
  test("PUT /products/p001 should update price and return 200", async () => {
    const res = await request(app).put("/products/p001").send({ price: 49.99 });
    expect(res.statusCode).toBe(200);
    expect(res.body.price).toBe(49.99);
  });

  test("PUT /products/p001 should update multiple fields correctly", async () => {
    const res = await request(app)
      .put("/products/p001")
      .send({ price: 79.99, stock_quantity: 99 });
    expect(res.statusCode).toBe(200);
    expect(res.body.price).toBe(79.99);
    expect(res.body.stock_quantity).toBe(99);
  });

  test("PUT /products/fakeid should return 404", async () => {
    const res = await request(app)
      .put("/products/fakeid")
      .send({ price: 49.99 });
    expect(res.statusCode).toBe(404);
  });

  // DELETE /products/:id
  test("DELETE /products/p099 should return 200 and success message", async () => {
    const res = await request(app).delete("/products/p099");
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Product deleted successfully");
  });

  test("DELETE /products/p098 should return 200", async () => {
    const res = await request(app).delete("/products/p098");
    expect(res.statusCode).toBe(200);
  });

  test("DELETE /products/fakeid should return 404", async () => {
    const res = await request(app).delete("/products/fakeid");
    expect(res.statusCode).toBe(404);
  });

  test("Deleted product should return 404 on subsequent GET", async () => {
    await request(app).post("/products").send({
      product_id: "p096",
      category_id: "cat1",
      distributor_id: "dist1",
      name: "To Be Deleted",
      model: "DEL-001",
      serial_number: "SN-DEL-096",
      description: "Silinecek ürün",
      stock_quantity: 1,
      price: 5.99,
      warranty_status: false,
    });

    await request(app).delete("/products/p096");

    const res = await request(app).get("/products/p096");
    expect(res.statusCode).toBe(404);
  });
});
