const request = require("supertest");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const app = require("../server");
const User = require("../models/User");
const Product = require("../models/Product");
const ReturnRequest = require("../models/ReturnRequest");

const uniqueSuffix = Date.now();
const salesManagerEmail = `stock-restore-${uniqueSuffix}@example.com`;
const testProductId = `p-restore-${uniqueSuffix}`;

let salesManagerToken;
let returnRequestId;
let initialStock = 5;
let returnQuantity = 2;

beforeAll(async () => {
  const password = await bcrypt.hash("ManagerPass123!", 10);

  // 1. Setup Sales Manager
  await User.create({
    name: "Stock Restore Admin",
    email: salesManagerEmail,
    password,
    role: "sales_manager",
  });

  const managerRes = await request(app).post("/api/auth/login").send({
    email: salesManagerEmail,
    password: "ManagerPass123!",
  });
  salesManagerToken = managerRes.body.token;

  // 2. Setup a Product to track its stock
  await Product.create({
    productId: testProductId,
    categoryId: "electronics",
    name: "Refund Test Item",
    model: "Restore-X",
    serialNumber: `SN-RESTORE-${uniqueSuffix}`,
    description: "Testing stock restoration",
    quantityInStock: initialStock, // Starts at 5
    price: 50.00,
    warrantyStatus: "1 year",
    distributorInfo: "Test Distributor",
  });

  // 3. Setup a pending Return Request for that product
  const returnReq = await ReturnRequest.create({
    userId: new mongoose.Types.ObjectId(),
    orderId: new mongoose.Types.ObjectId(),
    items: [{ productId: testProductId, name: "Refund Test Item", unitPrice: 50, quantity: returnQuantity }],
    reason: "Changed mind",
    refundAmount: 100, // 50 * 2
    status: "pending",
  });
  returnRequestId = returnReq._id;
});

afterAll(async () => {
  await ReturnRequest.findByIdAndDelete(returnRequestId);
  await Product.deleteOne({ productId: testProductId });
  await User.deleteOne({ email: salesManagerEmail });
  await mongoose.connection.close();
});

describe("Refund Approval and Stock Restore", () => {
  test("Approving a refund successfully increments product quantityInStock", async () => {
    // 1. Sales manager approves the refund
    const res = await request(app)
      .patch(`/api/returns/${returnRequestId}/approve`)
      .set("Authorization", `Bearer ${salesManagerToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    // 2. Verify the status changed to approved
    const updatedReq = await ReturnRequest.findById(returnRequestId);
    expect(updatedReq.status).toBe("approved");

    // 3. MOST IMPORTANT: Verify the stock went up!
    const product = await Product.findOne({ productId: testProductId });
    // Initial was 5, returned 2, new stock should be 7.
    expect(product.quantityInStock).toBe(initialStock + returnQuantity); 
  });

  test("Approving an already approved refund does not duplicate stock restoration", async () => {
    // Try to approve it a second time
    const res = await request(app)
      .patch(`/api/returns/${returnRequestId}/approve`)
      .set("Authorization", `Bearer ${salesManagerToken}`);

    // Should ideally return a 400 bad request since it's already approved
    expect(res.statusCode).toBe(400); 

    // Verify stock did NOT go up again
    const product = await Product.findOne({ productId: testProductId });
    expect(product.quantityInStock).toBe(initialStock + returnQuantity); // Still 7
  });
});