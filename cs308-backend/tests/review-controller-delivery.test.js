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
  find: jest.fn(),
}));

jest.mock("../models/ReturnRequest", () => ({
  exists: jest.fn(),
  find: jest.fn(),
}));

jest.mock("../models/User", () => ({
  find: jest.fn(),
}));

const mongoose = require("mongoose");
const Product = require("../models/Product");
const Review = require("../models/Review");
const Order = require("../models/Order");
const Delivery = require("../models/Delivery");
const ReturnRequest = require("../models/ReturnRequest");
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

const createQuery = (data) => ({
  lean: jest.fn().mockResolvedValue(data),
});

const buildDelivery = (orderId, quantity = 1) => ({
  _id: orderId,
  userId: "user-1",
  status: "delivered",
  items: [{ productId: "p001", name: "Keyboard", unitPrice: 80, quantity }],
});

describe("createReview delivery requirement", () => {
  beforeEach(() => {
    jest.resetAllMocks();
    Product.findOne.mockResolvedValue({ productId: "p001" });
    Review.findOne.mockResolvedValue(null);
    ReturnRequest.exists.mockResolvedValue(null);
    ReturnRequest.find.mockReturnValue(createQuery([]));
    Delivery.find.mockReturnValue(createQuery([]));
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
    expect(Order.exists).toHaveBeenNthCalledWith(2, {
      userId: "user-1",
      status: "cancelled",
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

  test("rejects reviews for products from cancelled orders with a clear message", async () => {
    Order.exists
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ _id: new mongoose.Types.ObjectId() });

    const req = buildReq();
    const res = createRes();
    const next = jest.fn();

    await createReview(req, res, next);

    expect(Delivery.distinct).not.toHaveBeenCalled();
    expect(Review.create).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 403,
        code: "ORDER_CANCELLED",
        message: "You cannot review products from cancelled orders",
      })
    );
  });

  test("prefers the cancelled order message over the generic delivery message", async () => {
    Order.exists
      .mockResolvedValueOnce({ _id: new mongoose.Types.ObjectId() })
      .mockResolvedValueOnce({ _id: new mongoose.Types.ObjectId() });
    Delivery.distinct.mockResolvedValue([]);

    const req = buildReq();
    const res = createRes();
    const next = jest.fn();

    await createReview(req, res, next);

    expect(Delivery.distinct).toHaveBeenCalled();
    expect(Review.create).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 403,
        code: "ORDER_CANCELLED",
        message: "You cannot review products from cancelled orders",
      })
    );
  });

  test("rejects reviews when the purchased product is still in transit", async () => {
    Order.exists
      .mockResolvedValueOnce({ _id: new mongoose.Types.ObjectId() })
      .mockResolvedValueOnce(null);
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
    expect(Order.exists).toHaveBeenCalledTimes(2);
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
    Delivery.find.mockReturnValue(createQuery([buildDelivery(orderId)]));
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
    expect(ReturnRequest.find).toHaveBeenCalledWith({
      userId: "user-1",
      "items.productId": "p001",
    });
    expect(Review.create).toHaveBeenCalledWith({
      userId: "user-1",
      productId: "p001",
      rating: 5,
      comment: "This product arrived in excellent condition.",
      status: "pending",
      commentStatus: "pending",
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Review submitted for approval.",
      review: createdReview,
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("rejects reviews after all delivered quantity has been returned", async () => {
    const orderId = new mongoose.Types.ObjectId().toString();

    Delivery.distinct.mockResolvedValue([orderId]);
    Delivery.find.mockReturnValue(createQuery([buildDelivery(orderId, 2)]));
    Order.exists
      .mockResolvedValueOnce({ _id: orderId })
      .mockResolvedValueOnce({ _id: orderId });
    ReturnRequest.find.mockReturnValue(createQuery([
      {
        userId: "user-1",
        items: [{ productId: "p001", name: "Keyboard", unitPrice: 80, quantity: 2 }],
      },
    ]));

    const req = buildReq();
    const res = createRes();
    const next = jest.fn();

    await createReview(req, res, next);

    expect(ReturnRequest.find).toHaveBeenCalledWith({
      userId: "user-1",
      "items.productId": "p001",
    });
    expect(Review.create).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 403,
        code: "RETURN_REQUESTED",
        message: "You cannot review a product after submitting a return request for it",
      })
    );
  });

  test("allows reviews when only part of the delivered quantity has been returned", async () => {
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
    Delivery.find.mockReturnValue(createQuery([buildDelivery(orderId, 4)]));
    Order.exists
      .mockResolvedValueOnce({ _id: orderId })
      .mockResolvedValueOnce({ _id: orderId });
    ReturnRequest.find.mockReturnValue(createQuery([
      {
        userId: "user-1",
        items: [{ productId: "p001", name: "Keyboard", unitPrice: 80, quantity: 2 }],
      },
    ]));
    Review.create.mockResolvedValue(createdReview);

    const req = buildReq();
    const res = createRes();
    const next = jest.fn();

    await createReview(req, res, next);

    expect(Review.create).toHaveBeenCalledWith({
      userId: "user-1",
      productId: "p001",
      rating: 5,
      comment: "This product arrived in excellent condition.",
      status: "pending",
      commentStatus: "pending",
    });
    expect(res.status).toHaveBeenCalledWith(201);
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
    Delivery.find.mockReturnValue(createQuery([buildDelivery(orderId)]));
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
      commentStatus: "none",
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Rating submitted successfully.",
      review: createdReview,
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("creates a pending comment-only review after delivery", async () => {
    const orderId = new mongoose.Types.ObjectId().toString();
    const createdReview = {
      _id: new mongoose.Types.ObjectId().toString(),
      userId: "user-1",
      productId: "p001",
      rating: null,
      comment: "This written review should be accepted without stars.",
      status: "pending",
    };

    Delivery.distinct.mockResolvedValue([orderId]);
    Delivery.find.mockReturnValue(createQuery([buildDelivery(orderId)]));
    Order.exists
      .mockResolvedValueOnce({ _id: orderId })
      .mockResolvedValueOnce({ _id: orderId });
    Review.create.mockResolvedValue(createdReview);

    const req = {
      user: { id: "user-1" },
      body: {
        productId: "p001",
        comment: "This written review should be accepted without stars.",
      },
    };
    const res = createRes();
    const next = jest.fn();

    await createReview(req, res, next);

    expect(Review.create).toHaveBeenCalledWith({
      userId: "user-1",
      productId: "p001",
      rating: null,
      comment: "This written review should be accepted without stars.",
      status: "pending",
      commentStatus: "pending",
    });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Review submitted for approval.",
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
      comment: "",
      pendingComment: "",
      commentStatus: "none",
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
    expect(review.comment).toBe("");
    expect(review.pendingComment).toBe("Updated review comment.");
    expect(review.commentStatus).toBe("pending");
    expect(review.status).toBe("approved");
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
      pendingComment: "",
      commentStatus: "approved",
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
    expect(review.pendingComment).toBe("");
    expect(review.commentStatus).toBe("none");
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
      pendingComment: "",
      commentStatus: "approved",
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
    expect(review.pendingComment).toBe("");
    expect(review.status).toBe("approved");
    expect(review.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Rating updated successfully.",
      review,
    });
    expect(next).not.toHaveBeenCalled();
  });

  test("allows clearing a rating while keeping a comment", async () => {
    const reviewId = new mongoose.Types.ObjectId().toString();
    const review = {
      _id: reviewId,
      userId: "user-1",
      productId: "p001",
      rating: 4,
      comment: "Original review comment.",
      pendingComment: "",
      commentStatus: "approved",
      status: "approved",
      save: jest.fn().mockResolvedValue(true),
    };

    Review.findById.mockResolvedValue(review);

    const req = {
      user: { id: "user-1" },
      params: { id: reviewId },
      body: {
        rating: null,
        comment: "Original review comment.",
      },
    };
    const res = createRes();
    const next = jest.fn();

    await updateReview(req, res, next);

    expect(review.rating).toBeNull();
    expect(review.comment).toBe("Original review comment.");
    expect(review.status).toBe("approved");
    expect(review.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(next).not.toHaveBeenCalled();
  });

  test("keeps the old approved comment public while an edited comment waits for approval", async () => {
    const reviewId = new mongoose.Types.ObjectId().toString();
    const review = {
      _id: reviewId,
      userId: "user-1",
      productId: "p001",
      rating: 3,
      comment: "Original review comment.",
      pendingComment: "",
      commentStatus: "approved",
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
    expect(review.comment).toBe("Original review comment.");
    expect(review.pendingComment).toBe("Updated review comment.");
    expect(review.commentStatus).toBe("pending");
    expect(review.status).toBe("approved");
    expect(review.save).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Review update submitted for approval.",
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
