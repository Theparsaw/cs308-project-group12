const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Product Sorting API", () => {

  // price_asc
  test("GET /api/products?sort=price_asc should return products sorted cheapest first", async () => {
    const res = await request(app).get("/api/products?sort=price_asc");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);

    // Each product should be cheaper than or equal to the next one
    for (let i = 0; i < res.body.length - 1; i++) {
      expect(res.body[i].price).toBeLessThanOrEqual(res.body[i + 1].price);
    }
  });

  test("GET /api/products?sort=price_asc first product should be the cheapest", async () => {
    const res = await request(app).get("/api/products?sort=price_asc");

    expect(res.statusCode).toBe(200);
    expect(res.body[0].price).toBe(29); // Kingston DataTraveler USB
    expect(res.body[0].productId).toBe("p030");
  });

  // price_desc
  test("GET /api/products?sort=price_desc should return products most expensive first", async () => {
    const res = await request(app).get("/api/products?sort=price_desc");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);

    // Each product should be more expensive than or equal to the next one
    for (let i = 0; i < res.body.length - 1; i++) {
      expect(res.body[i].price).toBeGreaterThanOrEqual(res.body[i + 1].price);
    }
  });

  test("GET /api/products?sort=price_desc first product should be the most expensive", async () => {
    const res = await request(app).get("/api/products?sort=price_desc");

    expect(res.statusCode).toBe(200);
    expect(res.body[0].price).toBe(2499); // Sony A7 IV
    expect(res.body[0].productId).toBe("p041");
  });

  // popularity
  test("GET /api/products?sort=popularity should return products with avgRating and reviewCount", async () => {
    const res = await request(app).get("/api/products?sort=popularity");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);

    res.body.forEach((product) => {
      expect(product).toHaveProperty("avgRating");
      expect(product).toHaveProperty("reviewCount");
    });
  });

  test("GET /api/products?sort=popularity should have highest rated products first", async () => {
    const res = await request(app).get("/api/products?sort=popularity");

    expect(res.statusCode).toBe(200);

    // Each product avgRating should be greater than or equal to the next one
    for (let i = 0; i < res.body.length - 1; i++) {
      expect(res.body[i].avgRating).toBeGreaterThanOrEqual(res.body[i + 1].avgRating);
    }
  });

  // invalid sort
  test("GET /api/products?sort=invalid should ignore sort and return all 50 products", async () => {
    const res = await request(app).get("/api/products?sort=invalid");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(50);
  });

  // search + sort combined
  test("GET /api/products?search=Samsung&sort=price_desc should return Samsung products most expensive first", async () => {
    const res = await request(app).get("/api/products?search=Samsung&sort=price_desc");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);

    // All results should be Samsung
    res.body.forEach((product) => {
      const combined = `${product.name} ${product.model} ${product.description}`.toLowerCase();
      expect(combined).toContain("samsung");
    });

    // Should be sorted by price descending
    for (let i = 0; i < res.body.length - 1; i++) {
      expect(res.body[i].price).toBeGreaterThanOrEqual(res.body[i + 1].price);
    }
  });

  test("GET /api/products?search=Samsung&sort=price_asc should return Samsung products cheapest first", async () => {
    const res = await request(app).get("/api/products?search=Samsung&sort=price_asc");

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);

    for (let i = 0; i < res.body.length - 1; i++) {
      expect(res.body[i].price).toBeLessThanOrEqual(res.body[i + 1].price);
    }
  });

});