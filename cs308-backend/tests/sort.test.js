const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");
const Order = require("../models/Order");

const popularityTestCartPrefix = `sort-test-cart-${Date.now()}`;

beforeAll(async () => {
  await Order.insertMany([
    {
      userId: "sort-test-user-1",
      cartId: `${popularityTestCartPrefix}-1`,
      items: [
        {
          productId: "p001",
          name: "Apple",
          unitPrice: 1299,
          quantity: 5,
        },
      ],
      totalPrice: 6495,
      status: "paid",
    },
    {
      userId: "sort-test-user-2",
      cartId: `${popularityTestCartPrefix}-2`,
      items: [
        {
          productId: "p001",
          name: "Apple",
          unitPrice: 1299,
          quantity: 2,
        },
        {
          productId: "p002",
          name: "Samsung",
          unitPrice: 999,
          quantity: 3,
        },
      ],
      totalPrice: 5595,
      status: "paid",
    },
    {
      userId: "sort-test-user-3",
      cartId: `${popularityTestCartPrefix}-3`,
      items: [
        {
          productId: "p002",
          name: "Samsung",
          unitPrice: 999,
          quantity: 9,
        },
      ],
      totalPrice: 8991,
      status: "pending_payment",
    },
  ]);
});

afterAll(async () => {
  await Order.deleteMany({ cartId: { $regex: `^${popularityTestCartPrefix}` } });
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
  test("GET /api/products?sort=popularity should return products with popularity", async () => {
    const res = await request(app).get("/api/products?sort=popularity");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);

    res.body.forEach((product) => {
      expect(product).toHaveProperty("popularity");
      expect(typeof product.popularity).toBe("number");
    });
  });

  test("GET /api/products?sort=popularity should sort by sold quantity from paid orders only", async () => {
    const res = await request(app).get("/api/products?sort=popularity");

    expect(res.statusCode).toBe(200);
    expect(res.body[0].productId).toBe("p001");
    expect(res.body[0].popularity).toBe(7);

    for (let i = 0; i < res.body.length - 1; i++) {
      expect(res.body[i].popularity).toBeGreaterThanOrEqual(res.body[i + 1].popularity);
    }
  });

  test("GET /api/products should attach popularity values to product responses", async () => {
    const res = await request(app).get("/api/products");

    expect(res.statusCode).toBe(200);

    const product = res.body.find((item) => item.productId === "p001");
    expect(product).toBeDefined();
    expect(product.popularity).toBe(7);
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

  test("GET /api/products?search=Apple&sort=popularity should keep popularity sorting with search", async () => {
    const res = await request(app).get("/api/products?search=Apple&sort=popularity");

    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].productId).toBe("p001");
    expect(res.body[0].popularity).toBe(7);
  });

});
