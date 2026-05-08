const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");
const Review = require("../models/Review");
const User = require("../models/User");
const Order = require("../models/Order");
const Delivery = require("../models/Delivery");

const createEmail = (label) => `review-${label}-${Date.now()}@example.com`;
const createdUserIds = [];
const createdOrderIds = [];
const createdDeliveryIds = [];

const createDeliveredPurchase = async (userId, productId) => {
  const order = await Order.create({
    userId: String(userId),
    cartId: `review-cart-${Date.now()}-${Math.random()}`,
    items: [
      {
        productId,
        name: "Review Test Product",
        unitPrice: 100,
        quantity: 1,
      },
    ],
    totalPrice: 100,
    status: "paid",
    paidAt: new Date(),
  });

  const delivery = await Delivery.create({
    orderId: order._id.toString(),
    userId: String(userId),
    items: order.items,
    totalPrice: order.totalPrice,
    status: "delivered",
  });

  createdOrderIds.push(order._id);
  createdDeliveryIds.push(delivery._id);
};

afterAll(async () => {
  if (createdUserIds.length > 0) {
    await Review.deleteMany({ userId: { $in: createdUserIds } });
  }
  if (createdDeliveryIds.length > 0) {
    await Delivery.deleteMany({ _id: { $in: createdDeliveryIds } });
  }
  if (createdOrderIds.length > 0) {
    await Order.deleteMany({ _id: { $in: createdOrderIds } });
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

  test("POST /api/reviews creates a pending comment review after delivery and rejects duplicates", async () => {
    const registerRes = await request(app).post("/api/auth/register").send({
      name: "Duplicate User",
      email: createEmail("duplicate"),
      password: "Password123!",
    });
    createdUserIds.push(registerRes.body.user.id);
    await createDeliveredPurchase(registerRes.body.user.id, "p001");

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
    await createDeliveredPurchase(registerRes.body.user.id, "p001");

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
    expect(res.body.review.status).toBe("approved");
  });

  test("GET /api/reviews/product/:productId hides fully pending comment reviews", async () => {
    const registerRes = await request(app).post("/api/auth/register").send({
      name: "Approved User",
      email: createEmail("approved"),
      password: "Password123!",
    });
    createdUserIds.push(registerRes.body.user.id);
    await createDeliveredPurchase(registerRes.body.user.id, "p002");

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
    expect(createRes.body.review.status).toBe("pending");

    const pendingListRes = await request(app).get("/api/reviews/product/p002");
    expect(pendingListRes.statusCode).toBe(200);
    expect(
      pendingListRes.body.data.some(
        (review) => String(review._id) === String(createRes.body.review._id)
      )
    ).toBe(false);
  });

  test("GET /api/reviews/product/:productId keeps a rating public while an added comment is pending", async () => {
    const registerRes = await request(app).post("/api/auth/register").send({
      name: "Rating Comment User",
      email: createEmail("rating-comment"),
      password: "Password123!",
    });
    createdUserIds.push(registerRes.body.user.id);
    await createDeliveredPurchase(registerRes.body.user.id, "p001");

    const token = registerRes.body.token;

    const ratingRes = await request(app)
      .post("/api/reviews")
      .set("Authorization", `Bearer ${token}`)
      .send({
        productId: "p001",
        rating: 5,
        comment: "",
      });

    expect(ratingRes.statusCode).toBe(201);
    expect(ratingRes.body.review.status).toBe("approved");

    const commentRes = await request(app)
      .patch(`/api/reviews/${ratingRes.body.review._id}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        rating: 5,
        comment: "Adding a comment after leaving stars only.",
      });

    expect(commentRes.statusCode).toBe(200);
    expect(commentRes.body.review.status).toBe("approved");
    expect(commentRes.body.review.commentStatus).toBe("pending");

    const publicListRes = await request(app).get("/api/reviews/product/p001");
    expect(publicListRes.statusCode).toBe(200);

    const publicReview = publicListRes.body.data.find(
      (review) => String(review._id) === String(ratingRes.body.review._id)
    );

    expect(publicReview).toEqual(
      expect.objectContaining({
        rating: 5,
        comment: "",
        commentStatus: "pending",
      })
    );
  });
});
