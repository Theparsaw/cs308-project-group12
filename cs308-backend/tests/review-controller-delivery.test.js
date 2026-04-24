jest.mock("../models/Product", () => ({
  findOne: jest.fn(),
}));

jest.mock("../models/Review", () => ({
  findOne: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
}));

jest.mock("../models/Order", () => ({
  exists: jest.fn(),
}));

jest.mock("../models/Delivery", () => ({
  distinct: jest.fn(),
}));

jest.mock("../models/User", () => ({
  find: jest.fn(),
}));

const mongoose = require("mongoose");
const Product = require("../models/Product");
const Review = require("../models/Review");
const Order = require("../models/Order");
const Delivery = require("../models/Delivery");
const { createReview, updateReview } = require("../controllers/reviewController");

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const buildReq = () => ({
  user: { id: "user-1" },
  body: {
    productId: "p001",
    rating: 5,
    comment: "This product arrived in excellent condition.",
  },
});

describe("createReview delivery requirement", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    Product.findOne.mockResolvedValue({ productId: "p001" });
    Review.findOne.mockResolvedValue(null);
  });

  test("rejects reviews when the product has not been purchased", async () => {
    Order.exists.mockResolvedValue(null);

    const req = buildReq();
    const res = createRes();
    const next = jest.fn();

    await createReview(req, res, next);

    expect(Order.exists).toHaveBeenCalledWith({
      userId: "user-1",
      status: "paid",
      items: {
        $elemMatch: {
          productId: "p001",
        },
      },
    });
    expect(Delivery.distinct).not.toHaveBeenCalled();
    expect(Review.create).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 403,
        code: "PURCHASE_REQUIRED",
        message: "You can only review products that you have purchased",
      })
    );
  });

  test("rejects reviews when the purchased product is still in transit", async () => {
    Order.exists.mockResolvedValueOnce({ _id: new mongoose.Types.ObjectId() });
    Delivery.distinct.mockResolvedValue([]);

    const req = buildReq();
    const res = createRes();
    const next = jest.fn();

    await createReview(req, res, next);

    expect(Delivery.distinct).toHaveBeenCalledWith("orderId", {
      userId: "user-1",
      status: "delivered",
      items: {
        $elemMatch: {
          productId: "p001",
        },
      },
    });
    expect(Order.exists).toHaveBeenCalledTimes(1);
    expect(Review.create).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 403,
        code: "DELIVERY_REQUIRED",
        message: "You can only review products after they have been delivered",
      })
    );
  });

  test("creates a pending review with a comment when the matching paid order has been delivered", async () => {
    const orderId = new mongoose.Types.ObjectId().toString();
    const createdReview = {
      _id: new mongoose.Types.ObjectId().toString(),
      userId: "user-1",
      productId: "p001",
      rating: 5,
      comment: "This product arrived in excellent condition.",
      status: "pending",
    };

    Delivery.distinct.mockResolvedValue([orderId]);
    Order.exists
      .mockResolvedValueOnce({ _id: orderId })
      .mockResolvedValueOnce({ _id: orderId });
    Review.create.mockResolvedValue(createdReview);

    const req = buildReq();
    const res = createRes();
    const next = jest.fn();

    await createReview(req, res, next);

    expect(Order.exists).toHaveBeenNthCalledWith(1, {
      userId: "user-1",
      status: "paid",
      items: {
        $elemMatch: {
          productId: "p001",
        },
      },
    });
    expect(Order.exists).toHaveBeenNthCalledWith(2, {
      _id: { $in: [orderId] },
      userId: "user-1",
      status: "paid",
      items: {
        $elemMatch: {
          productId: "p001",
        },
      },
    });
    expect(Review.create).toHaveBeenCalledWith({
      userId: "user-1",
      productId: "p001",
      rating: 5,
      comment: "This product arrived in excellent condition.",
      status: "pending",
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Review submitted for approval.",
      review: createdReview,
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("creates an approved rating-only review after delivery", async () => {
    const orderId = new mongoose.Types.ObjectId().toString();
    const createdReview = {
      _id: new mongoose.Types.ObjectId().toString(),
      userId: "user-1",
      productId: "p001",
      rating: 4,
      comment: "",
      status: "approved",
    };

    Delivery.distinct.mockResolvedValue([orderId]);
    Order.exists
      .mockResolvedValueOnce({ _id: orderId })
      .mockResolvedValueOnce({ _id: orderId });
    Review.create.mockResolvedValue(createdReview);

    const req = {
      user: { id: "user-1" },
      body: {
        productId: "p001",
        rating: 4,
        comment: "",
      },
    };
    const res = createRes();
    const next = jest.fn();

    await createReview(req, res, next);

    expect(Review.create).toHaveBeenCalledWith({
      userId: "user-1",
      productId: "p001",
      rating: 4,
      comment: "",
      status: "approved",
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Rating submitted successfully.",
      review: createdReview,
    });
    expect(next).not.toHaveBeenCalled();
  });
});

describe("updateReview", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("submits comment edits for approval", async () => {
    const reviewId = new mongoose.Types.ObjectId().toString();
    const review = {
      _id: reviewId,
      userId: "user-1",
      productId: "p001",
      rating: 3,
      comment: "Original review comment.",
      status: "approved",
      save: jest.fn().mockResolvedValue(true),
    };

    Review.findById.mockResolvedValue(review);

    const req = {
      user: { id: "user-1" },
      params: { id: reviewId },
      body: {
        rating: 5,
        comment: "Updated review comment.",
      },
    };
    const res = createRes();
    const next = jest.fn();

    await updateReview(req, res, next);

    expect(review.rating).toBe(5);
    expect(review.comment).toBe("Updated review comment.");
    expect(review.status).toBe("pending");
    expect(review.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Review update submitted for approval.",
      review,
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("approves rating-only edits immediately", async () => {
    const reviewId = new mongoose.Types.ObjectId().toString();
    const review = {
      _id: reviewId,
      userId: "user-1",
      productId: "p001",
      rating: 3,
      comment: "Original review comment.",
      status: "approved",
      save: jest.fn().mockResolvedValue(true),
    };

    Review.findById.mockResolvedValue(review);

    const req = {
      user: { id: "user-1" },
      params: { id: reviewId },
      body: {
        rating: 4,
        comment: "",
      },
    };
    const res = createRes();
    const next = jest.fn();

    await updateReview(req, res, next);

    expect(review.rating).toBe(4);
    expect(review.comment).toBe("");
    expect(review.status).toBe("approved");
    expect(review.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Rating updated successfully.",
      review,
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("keeps an approved comment review approved when only the rating changes", async () => {
    const reviewId = new mongoose.Types.ObjectId().toString();
    const review = {
      _id: reviewId,
      userId: "user-1",
      productId: "p001",
      rating: 3,
      comment: "Original review comment.",
      status: "approved",
      save: jest.fn().mockResolvedValue(true),
    };

    Review.findById.mockResolvedValue(review);

    const req = {
      user: { id: "user-1" },
      params: { id: reviewId },
      body: {
        rating: 5,
        comment: "Original review comment.",
      },
    };
    const res = createRes();
    const next = jest.fn();

    await updateReview(req, res, next);

    expect(review.rating).toBe(5);
    expect(review.comment).toBe("Original review comment.");
    expect(review.status).toBe("approved");
    expect(review.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Rating updated successfully.",
      review,
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("rejects edits to another user's review", async () => {
    const reviewId = new mongoose.Types.ObjectId().toString();
    const review = {
      _id: reviewId,
      userId: "user-2",
      productId: "p001",
      rating: 3,
      comment: "Original review comment.",
      status: "approved",
      save: jest.fn(),
    };

    Review.findById.mockResolvedValue(review);

    const req = {
      user: { id: "user-1" },
      params: { id: reviewId },
      body: {
        rating: 4,
        comment: "Trying to edit another review.",
      },
    };
    const res = createRes();
    const next = jest.fn();

    await updateReview(req, res, next);

    expect(review.save).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 403,
        code: "FORBIDDEN",
        message: "You can only edit your own review",
      })
    );
  });
});
