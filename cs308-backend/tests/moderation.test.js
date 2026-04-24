const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");
const Review = require("../models/Review");
const ModerationLog = require("../models/ModerationLog");
const User = require("../models/User");

const createEmail = (label) => `mod-${label}-${Date.now()}@example.com`;
const createdUserIds = [];
let managerToken;
let customerToken;
let testReviewId;
let testUserId;

beforeAll(async () => {
  // Login as sales manager
  const managerRes = await request(app).post("/api/auth/login").send({
    email: "salesmanager@store.com",
    password: "sales123",
  });
  managerToken = managerRes.body.token;

  // Register a regular customer
  const customerRes = await request(app).post("/api/auth/register").send({
    name: "Mod Test Customer",
    email: createEmail("customer"),
    password: "Password123!",
  });
  customerToken = customerRes.body.token;
  testUserId = customerRes.body.user.id;
  createdUserIds.push(testUserId);

  // Create review directly in DB — bypasses purchase requirement
  const review = await Review.create({
    userId: testUserId,
    productId: "p001",
    rating: 4,
    comment: "Moderation test review created directly in DB.",
    status: "pending",
  });
  testReviewId = review._id;
});

afterAll(async () => {
  if (testReviewId) {
    await Review.findByIdAndDelete(testReviewId);
    await ModerationLog.deleteMany({ reviewId: String(testReviewId) });
  }
  await Review.deleteMany({ userId: { $in: createdUserIds } });
  await User.deleteMany({ email: /mod-.*@example\.com$/ });
  await mongoose.connection.close();
});

describe("Moderation API", () => {
  test("GET /api/moderation/reviews/pending requires auth", async () => {
    const res = await request(app).get("/api/moderation/reviews/pending");
    expect(res.statusCode).toBe(401);
  });

  test("GET /api/moderation/reviews/pending denied for regular customer", async () => {
    const res = await request(app)
      .get("/api/moderation/reviews/pending")
      .set("Authorization", `Bearer ${customerToken}`);
    expect(res.statusCode).toBe(403);
  });

  test("GET /api/moderation/reviews/pending works for manager", async () => {
    const res = await request(app)
      .get("/api/moderation/reviews/pending")
      .set("Authorization", `Bearer ${managerToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test("PATCH /api/moderation/reviews/:id/approve requires auth", async () => {
    const res = await request(app).patch(
      `/api/moderation/reviews/${testReviewId}/approve`
    );
    expect(res.statusCode).toBe(401);
  });

  test("PATCH /api/moderation/reviews/:id/approve denied for regular customer", async () => {
    const res = await request(app)
      .patch(`/api/moderation/reviews/${testReviewId}/approve`)
      .set("Authorization", `Bearer ${customerToken}`);
    expect(res.statusCode).toBe(403);
  });

  test("PATCH /api/moderation/reviews/:id/approve works for manager", async () => {
    const res = await request(app)
      .patch(`/api/moderation/reviews/${testReviewId}/approve`)
      .set("Authorization", `Bearer ${managerToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("PATCH /api/moderation/reviews/:id/reject requires auth", async () => {
    const review = await Review.create({
      userId: testUserId,
      productId: "p002",
      rating: 2,
      comment: "Review to test reject auth check.",
      status: "pending",
    });

    const res = await request(app).patch(
      `/api/moderation/reviews/${review._id}/reject`
    );
    expect(res.statusCode).toBe(401);

    await Review.findByIdAndDelete(review._id);
  });

  test("PATCH /api/moderation/reviews/:id/reject works for manager", async () => {
    const review = await Review.create({
      userId: testUserId,
      productId: "p003",
      rating: 1,
      comment: "Review to be rejected by manager in moderation test.",
      status: "pending",
    });

    const res = await request(app)
      .patch(`/api/moderation/reviews/${review._id}/reject`)
      .set("Authorization", `Bearer ${managerToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);

    await Review.findByIdAndDelete(review._id);
    await ModerationLog.deleteMany({ reviewId: String(review._id) });
  });

  test("Approving a non-existent review returns 404", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .patch(`/api/moderation/reviews/${fakeId}/approve`)
      .set("Authorization", `Bearer ${managerToken}`);
    expect(res.statusCode).toBe(404);
  });
});