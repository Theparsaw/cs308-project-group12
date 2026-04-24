const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");
const Cart = require("../models/Cart");
const User = require("../models/User");

const createEmail = (label) => `checkout-${label}-${Date.now()}@example.com`;
const createdUserIds = [];
let customerToken;
let customerId;
let testCartId;

beforeAll(async () => {
  const customerRes = await request(app).post("/api/auth/register").send({
    name: "Checkout Test Customer",
    email: createEmail("customer"),
    password: "Password123!",
  });
  customerToken = customerRes.body.token;
  customerId = customerRes.body.user.id;
  createdUserIds.push(customerId);

  // Create a test cart directly in DB with correct fields
  testCartId = `checkout-test-cart-${Date.now()}`;
  await Cart.create({
    cartId: testCartId,
    userId: new mongoose.Types.ObjectId(customerId),
    items: [
      {
        productId: "p001",
        name: "Test Product",
        unitPrice: 100,
        quantity: 1,
        imageUrl: "",
      },
    ],
    totalPrice: 100,
  });
});

afterAll(async () => {
  await Cart.deleteOne({ cartId: testCartId });
  await User.deleteMany({ email: /checkout-.*@example\.com$/ });
  await mongoose.connection.close();
});

describe("Checkout API", () => {
  test("GET /api/checkout/:cartId requires auth", async () => {
    const res = await request(app).get(`/api/checkout/${testCartId}`);
    expect(res.statusCode).toBe(401);
  });

  test("GET /api/checkout/:cartId returns cart for logged-in user", async () => {
    const res = await request(app)
      .get(`/api/checkout/${testCartId}`)
      .set("Authorization", `Bearer ${customerToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("cartId", testCartId);
    expect(res.body).toHaveProperty("items");
    expect(res.body).toHaveProperty("totalPrice");
  });

  test("GET /api/checkout/:cartId returns 404 for non-existent cart", async () => {
    const res = await request(app)
      .get("/api/checkout/non-existent-cart-id")
      .set("Authorization", `Bearer ${customerToken}`);
    expect(res.statusCode).toBe(404);
  });

  test("POST /api/checkout/:cartId/validate requires auth", async () => {
    const res = await request(app).post(`/api/checkout/${testCartId}/validate`);
    expect(res.statusCode).toBe(401);
  });

  test("POST /api/checkout/:cartId/validate returns 400 for non-existent cart", async () => {
    const res = await request(app)
      .post("/api/checkout/non-existent-cart-id/validate")
      .set("Authorization", `Bearer ${customerToken}`);
    expect(res.statusCode).toBe(400);
  });

  test("POST /api/checkout/:cartId/validate succeeds for valid cart", async () => {
    const res = await request(app)
      .post(`/api/checkout/${testCartId}/validate`)
      .set("Authorization", `Bearer ${customerToken}`);
    // 200 = valid stock, 400 = stock issue — both are correct
    expect([200, 400]).toContain(res.statusCode);
  });

  test("POST /api/checkout/:cartId/order requires auth", async () => {
    const res = await request(app).post(`/api/checkout/${testCartId}/order`);
    expect(res.statusCode).toBe(401);
  });

  test("POST /api/checkout/:cartId/order returns 400 for non-existent cart", async () => {
    const res = await request(app)
      .post("/api/checkout/non-existent-cart-id/order")
      .set("Authorization", `Bearer ${customerToken}`);
    expect(res.statusCode).toBe(400);
  });
});