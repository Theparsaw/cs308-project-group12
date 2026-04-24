const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");
const User = require("../models/User");

const createEmail = (label) => `payment-${label}-${Date.now()}@example.com`;
const createdUserIds = [];
let customerToken;
const fakeOrderId = new mongoose.Types.ObjectId();

const validCard = {
  cardHolder: "Test User",
  cardNumber: "1234567890123456",
  expiryMonth: "12",
  expiryYear: "2099",
  cvv: "123",
};

beforeAll(async () => {
  const customerRes = await request(app).post("/api/auth/register").send({
    name: "Payment Test Customer",
    email: createEmail("customer"),
    password: "Password123!",
  });
  customerToken = customerRes.body.token;
  createdUserIds.push(customerRes.body.user.id);
});

afterAll(async () => {
  await User.deleteMany({ email: /payment-.*@example\.com$/ });
  await mongoose.connection.close();
});

describe("Payment API", () => {
  // GET order for payment
  test("GET /api/payments/order/:orderId requires auth", async () => {
    const res = await request(app).get(`/api/payments/order/${fakeOrderId}`);
    expect(res.statusCode).toBe(401);
  });

  test("GET /api/payments/order/:orderId returns 404 for non-existent order", async () => {
    const res = await request(app)
      .get(`/api/payments/order/${fakeOrderId}`)
      .set("Authorization", `Bearer ${customerToken}`);
    expect(res.statusCode).toBe(404);
  });

  // POST process payment - auth
  test("POST /api/payments/:orderId requires auth", async () => {
    const res = await request(app)
      .post(`/api/payments/${fakeOrderId}`)
      .send(validCard);
    expect(res.statusCode).toBe(401);
  });

  // POST process payment - field validation
  test("POST /api/payments/:orderId returns 400 when fields are missing", async () => {
    const res = await request(app)
      .post(`/api/payments/${fakeOrderId}`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ cardHolder: "Test User" });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("All payment fields are required");
  });

  test("POST /api/payments/:orderId returns 400 for invalid card number", async () => {
    const res = await request(app)
      .post(`/api/payments/${fakeOrderId}`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ ...validCard, cardNumber: "1234" });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Card number must be 16 digits");
  });

  test("POST /api/payments/:orderId returns 400 for expired card", async () => {
    const res = await request(app)
      .post(`/api/payments/${fakeOrderId}`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ ...validCard, expiryYear: "2000", expiryMonth: "01" });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Card expiry date is invalid or expired");
  });

  test("POST /api/payments/:orderId returns 400 for invalid CVV", async () => {
    const res = await request(app)
      .post(`/api/payments/${fakeOrderId}`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send({ ...validCard, cvv: "12" });
    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("CVV must be 3 or 4 digits");
  });

  test("POST /api/payments/:orderId returns 404 for non-existent order", async () => {
    const res = await request(app)
      .post(`/api/payments/${fakeOrderId}`)
      .set("Authorization", `Bearer ${customerToken}`)
      .send(validCard);
    expect(res.statusCode).toBe(404);
  });
});