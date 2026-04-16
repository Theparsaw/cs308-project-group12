const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Product Search API", () => {

  // No search
  test("GET /api/products with no search returns all products", async () => {
    const res = await request(app).get("/api/products");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(50);
  });

  // Search by name
  test("GET /api/products?search=Samsung returns only Samsung products", async () => {
    const res = await request(app).get("/api/products?search=Samsung");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);

    res.body.forEach((product) => {
      const combined = `${product.name} ${product.model} ${product.description}`.toLowerCase();
      expect(combined).toContain("samsung");
    });
  });

  test("GET /api/products?search=Apple returns only Apple products", async () => {
    const res = await request(app).get("/api/products?search=Apple");

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);

    res.body.forEach((product) => {
      const combined = `${product.name} ${product.model} ${product.description}`.toLowerCase();
      expect(combined).toContain("apple");
    });
  });

  // Search by description
  test("GET /api/products?search=mirrorless returns products with mirrorless in description", async () => {
    const res = await request(app).get("/api/products?search=mirrorless");

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);

    res.body.forEach((product) => {
      const combined = `${product.name} ${product.model} ${product.description}`.toLowerCase();
      expect(combined).toContain("mirrorless");
    });
  });

  test("GET /api/products?search=wireless returns products with wireless in name or description", async () => {
    const res = await request(app).get("/api/products?search=wireless");

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);

    res.body.forEach((product) => {
      const combined = `${product.name} ${product.model} ${product.description}`.toLowerCase();
      expect(combined).toContain("wireless");
    });
  });

  // Case insensitive
  test("GET /api/products?search=SAMSUNG returns same results as search=Samsung", async () => {
    const upperRes = await request(app).get("/api/products?search=SAMSUNG");
    const lowerRes = await request(app).get("/api/products?search=Samsung");

    expect(upperRes.statusCode).toBe(200);
    expect(upperRes.body.length).toBe(lowerRes.body.length);
  });

  test("GET /api/products?search=samsung (lowercase) returns results", async () => {
    const res = await request(app).get("/api/products?search=samsung");

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  // Empty search
  test("GET /api/products?search= empty string returns all products", async () => {
    const res = await request(app).get("/api/products?search=");

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(50);
  });

  // No results
  test("GET /api/products?search=xyznonexistent returns empty array", async () => {
    const res = await request(app).get("/api/products?search=xyznonexistent");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  // Search by category
  test("GET /api/products?search=gaming returns gaming related products", async () => {
    const res = await request(app).get("/api/products?search=gaming");

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

});