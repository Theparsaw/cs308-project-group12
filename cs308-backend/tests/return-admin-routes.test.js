const request = require("supertest");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const app = require("../server");
const User = require("../models/User");
const ReturnRequest = require("../models/ReturnRequest");

const uniqueSuffix = Date.now();
const salesManagerEmail = `refund-sales-${uniqueSuffix}@example.com`;
const customerEmail = `refund-customer-${uniqueSuffix}@example.com`;

let salesManagerToken;
let customerToken;
let pendingRequestId;

beforeAll(async () => {
  const password = await bcrypt.hash("ManagerPass123!", 10);

  // 1. Create Sales Manager
  const manager = await User.create({
    name: "Refund Sales Manager",
    email: salesManagerEmail,
    password,
    role: "sales_manager",
  });

  // 2. Create Customer
  const customer = await User.create({
    name: "Refund Customer",
    email: customerEmail,
    password,
    role: "customer",
  });

  // Log them in to get tokens
  const managerRes = await request(app).post("/api/auth/login").send({
    email: salesManagerEmail,
    password: "ManagerPass123!",
  });
  salesManagerToken = managerRes.body.token;

  const customerRes = await request(app).post("/api/auth/login").send({
    email: customerEmail,
    password: "ManagerPass123!",
  });
  customerToken = customerRes.body.token;

  // 3. Seed a pending Return Request directly into DB
  const returnReq = await ReturnRequest.create({
    userId: customer._id,
    orderId: new mongoose.Types.ObjectId(),
    items: [{ productId: "p001", name: "Test Product", unitPrice: 100, quantity: 1 }],
    reason: "Defective out of box",
    refundAmount: 100,
    status: "pending",
  });
  pendingRequestId = returnReq._id;
});

afterAll(async () => {
  await ReturnRequest.deleteMany({ _id: pendingRequestId });
  await User.deleteMany({ email: { $in: [salesManagerEmail, customerEmail] } });
  await mongoose.connection.close();
});

describe("Return Request Admin API (Sales Manager)", () => {
  test("GET /api/returns/pending requires authentication", async () => {
    const res = await request(app).get("/api/returns/pending");
    expect(res.statusCode).toBe(401);
  });

  test("GET /api/returns/pending is denied for regular customers", async () => {
    const res = await request(app)
      .get("/api/returns/pending")
      .set("Authorization", `Bearer ${customerToken}`);
    expect(res.statusCode).toBe(403);
    expect(res.body.code).toBe("FORBIDDEN");
  });

  test("GET /api/returns/pending works for sales managers and returns an array", async () => {
    const res = await request(app)
      .get("/api/returns/pending")
      .set("Authorization", `Bearer ${salesManagerToken}`);
    
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    // Ensure our seeded pending request is in the list
    const found = res.body.data.find(req => req._id === pendingRequestId.toString());
    expect(found).toBeDefined();
    expect(found.status).toBe("pending");
  });

  test("PATCH /api/returns/:id/reject updates status to rejected", async () => {
    const res = await request(app)
      .patch(`/api/returns/${pendingRequestId}/reject`)
      .set("Authorization", `Bearer ${salesManagerToken}`)
      .send({ managerNotes: "Product seal was broken by user." });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    
    const updatedReq = await ReturnRequest.findById(pendingRequestId);
    expect(updatedReq.status).toBe("rejected");
    expect(updatedReq.managerNotes).toBe("Product seal was broken by user.");
  });
});