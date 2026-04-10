const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");
const Review = require("../models/Review");
const User = require("../models/User");

const createEmail = (label) => `review-${label}-${Date.now()}@example.com`;
const createdUserIds = [];

afterAll(async () => {
  if (createdUserIds.length > 0) {
    await Review.deleteMany({ userId: { $in: createdUserIds } });
  }
  await User.deleteMany({ email: /review-.*@example\.com$/ });
  await mongoose.connection.close();
});

describe("Review validation and integration flow", () => {
  test("POST /api/reviews requires authentication", async () => {
    const res = await request(app).post("/api/reviews").send({
      productId: "p001",
      rating: 5,
      comment: "This should not be accepted without a token.",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.code).toBe("AUTH_REQUIRED");
  });

  test("POST /api/reviews returns validation errors for invalid input", async () => {
    const registerRes = await request(app).post("/api/auth/register").send({
      name: "Validation User",
      email: createEmail("validation"),
      password: "Password123!",
    });
    createdUserIds.push(registerRes.body.user.id);

    const res = await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${registerRes.body.token}`)
      .send({
        productId: "p001",
        rating: 9,
        comment: "spam",
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Validation failed");
    expect(res.body.details.rating).toBe(
      "rating must be an integer between 1 and 5"
    );
    expect(res.body.details.comment).toBe(
      "comment must be at least 10 characters long"
    );
  });

  test("POST /api/reviews creates a pending review and rejects duplicates", async () => {
    const registerRes = await request(app).post("/api/auth/register").send({
      name: "Duplicate User",
      email: createEmail("duplicate"),
      password: "Password123!",
    });
    createdUserIds.push(registerRes.body.user.id);

    const token = registerRes.body.token;
    const payload = {
      productId: "p001",
      rating: 5,
      comment: "This product has been consistently reliable for me.",
    };

    const createRes = await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${token}`)
      .send(payload);

    expect(createRes.statusCode).toBe(201);
    expect(createRes.body.review.status).toBe("pending");

    const duplicateRes = await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${token}`)
      .send(payload);

    expect(duplicateRes.statusCode).toBe(400);
    expect(duplicateRes.body.message).toBe(
      "You have already submitted a review for this product"
    );
  });

  test("POST /api/reviews allows rating-only reviews without a comment", async () => {
    const registerRes = await request(app).post("/api/auth/register").send({
      name: "Rating Only User",
      email: createEmail("rating-only"),
      password: "Password123!",
    });
    createdUserIds.push(registerRes.body.user.id);

    const res = await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${registerRes.body.token}`)
      .send({
        productId: "p001",
        rating: 4,
        comment: "",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.review.rating).toBe(4);
    expect(res.body.review.comment).toBe("");
  });

  test("GET /api/reviews/product/:productId hides pending reviews and shows approved ones", async () => {
    const registerRes = await request(app).post("/api/auth/register").send({
      name: "Approved User",
      email: createEmail("approved"),
      password: "Password123!",
    });
    createdUserIds.push(registerRes.body.user.id);

    const token = registerRes.body.token;

    const createRes = await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${token}`)
      .send({
        productId: "p002",
        rating: 4,
        comment: "Solid product with dependable day to day performance.",
      });

    expect(createRes.statusCode).toBe(201);

    const pendingListRes = await request(app).get("/api/reviews/product/p002");
    expect(pendingListRes.statusCode).toBe(200);
    expect(pendingListRes.body.data).toEqual([]);

    const approveRes = await request(app).patch(
      `/api/moderation/reviews/${createRes.body.review._id}/approve`
    );

    expect(approveRes.statusCode).toBe(200);

    const approvedListRes = await request(app).get("/api/reviews/product/p002");
    expect(approvedListRes.statusCode).toBe(200);
    expect(approvedListRes.body.data).toHaveLength(1);
    expect(approvedListRes.body.data[0].comment).toBe(
      "Solid product with dependable day to day performance."
    );
    expect(approvedListRes.body.data[0].reviewerName).toBe("Approved User");
    expect(approvedListRes.body.data[0].status).toBe("approved");
  });
});
