const Product = require("../models/Product");
const Review = require("../models/Review");
const User = require("../models/User");
const Order = require("../models/Order");
const Delivery = require("../models/Delivery");
const ReturnRequest = require("../models/ReturnRequest");
const mongoose = require("mongoose");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");

const isValidRating = (rating) => {
  const ratingNumber = Number(rating);
  if (!Number.isFinite(ratingNumber)) return false;
  if (!Number.isInteger(ratingNumber)) return false;

  return ratingNumber >= 1 && ratingNumber <= 5;
};

const hasRatingInput = (rating) =>
  rating !== undefined && rating !== null && String(rating).trim() !== "";

const normalizeComment = (comment) => String(comment ?? "").trim();

const getReviewStatusForComment = (comment) =>
  normalizeComment(comment) ? "pending" : "approved";

const hasCancelledOrderForProduct = (userId, productId) =>
  Order.exists({
    userId: String(userId).trim(),
    status: "cancelled",
    items: {
      $elemMatch: {
        productId,
      },
    },
  });

const throwCancelledOrderReviewError = () => {
  throw new AppError(
    "You cannot review products from cancelled orders",
    403,
    "ORDER_CANCELLED",
    {
      productId: "You cannot review products from cancelled orders",
    }
  );
};

const throwReturnedProductReviewError = () => {
  throw new AppError(
    "You cannot review a product after submitting a return request for it",
    403,
    "RETURN_REQUESTED",
    {
      productId: "You cannot review a product after submitting a return request for it",
    }
  );
};

const sumProductQuantity = (items = [], productId) =>
  items
    .filter((item) => String(item.productId) === String(productId))
    .reduce((total, item) => total + Number(item.quantity || 0), 0);

const getDeliveredPurchasedQuantity = async (userId, productId) => {
  const deliveries = await Delivery.find({
    userId: String(userId).trim(),
    status: "delivered",
    items: {
      $elemMatch: {
        productId,
      },
    },
  }).lean();

  return deliveries.reduce(
    (total, delivery) => total + sumProductQuantity(delivery.items, productId),
    0
  );
};

const getReturnedQuantity = async (userId, productId) => {
  const returnRequests = await ReturnRequest.find({
    userId: String(userId).trim(),
    "items.productId": productId,
  }).lean();

  return returnRequests.reduce(
    (total, request) => total + sumProductQuantity(request.items, productId),
    0
  );
};

const hasFullyReturnedProduct = async (userId, productId) => {
  const deliveredPurchasedQuantity = await getDeliveredPurchasedQuantity(userId, productId);

  if (deliveredPurchasedQuantity === 0) return false;

  const returnedQuantity = await getReturnedQuantity(userId, productId);
  return returnedQuantity >= deliveredPurchasedQuantity;
};

const validateReviewInput = ({ productId, rating, comment }, options = {}) => {
  const { requireProductId = true } = options;
  const errors = {};
  const normalizedComment = normalizeComment(comment);

  if (requireProductId && (!productId || !String(productId).trim())) {
    errors.productId = "productId is required";
  }

  const hasRating = hasRatingInput(rating);

  if (hasRating && !isValidRating(rating)) {
    errors.rating = "rating must be an integer between 1 and 5";
  }

  if (normalizedComment) {
    if (normalizedComment.length < 10) {
      errors.comment = "comment must be at least 10 characters long";
    } else if (normalizedComment.length > 500) {
      errors.comment = "comment must be 500 characters or less";
    } else if (/https?:\/\/|www\./i.test(normalizedComment)) {
      errors.comment = "comment contains disallowed promotional content";
    } else if (/(.)\1{7,}/i.test(normalizedComment)) {
      errors.comment = "comment looks like spam";
    }
  }

  if (!hasRating && !normalizedComment) {
    errors.general = "rating or comment is required";
  }

  return {
    errors,
    normalizedComment,
  };
};

const getApprovedReviewsForProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const trimmedProductId = String(productId || "").trim();

  if (!trimmedProductId) {
    throw new AppError("productId is required", 400, "VALIDATION_ERROR");
  }

  const reviews = await Review.find({
    productId: trimmedProductId,
    status: "approved",
  })
    .sort({ createdAt: -1 })
    .lean();

  const eligibilityChecks = await Promise.all(
    reviews.map(async (review) => {
      const isFullyReturned = await hasFullyReturnedProduct(
        review.userId,
        trimmedProductId
      );

      return {
        review,
        isEligible: !isFullyReturned,
      };
    })
  );

  const eligibleReviews = eligibilityChecks
    .filter((check) => check.isEligible)
    .map((check) => check.review);

  const userIds = eligibleReviews
    .map((review) => review.userId)
    .filter((id) => mongoose.Types.ObjectId.isValid(id));

  const users = userIds.length
    ? await User.find({ _id: { $in: userIds } }).select("name").lean()
    : [];

  const namesById = users.reduce((acc, user) => {
    acc[String(user._id)] = user.name;
    return acc;
  }, {});

  const data = eligibleReviews.map((review) => ({
    _id: review._id,
    productId: review.productId,
    userId: review.userId,
    reviewerName: namesById[review.userId] || "Anonymous User",
    rating: review.rating,
    comment: review.comment,
    commentStatus: review.commentStatus,
    status: review.status,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  }));

  return res.status(200).json({
    count: data.length,
    data,
  });
});

// POST /api/reviews
// Expected body:
// { productId: string, rating?: 1-5 (int), comment?: string }
const createReview = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { productId, rating, comment } = req.body;

  if (!userId) {
    throw new AppError("Authentication required", 401, "AUTH_REQUIRED");
  }

  const { errors, normalizedComment } = validateReviewInput({
    productId,
    rating,
    comment,
  });

  if (Object.keys(errors).length > 0) {
    throw new AppError("Validation failed", 400, "VALIDATION_ERROR", errors);
  }

  const trimmedProductId = String(productId).trim();
  const ratingNumber = hasRatingInput(rating) ? Number(rating) : null;

  const product = await Product.findOne({ productId: trimmedProductId });
  if (!product) {
    throw new AppError("Product not found", 404, "PRODUCT_NOT_FOUND");
  }

  const existingReview = await Review.findOne({ userId, productId: trimmedProductId });
  if (existingReview) {
    throw new AppError(
      "You have already submitted a review for this product",
      400,
      "DUPLICATE_REVIEW",
      {
        productId: "You have already submitted a review for this product",
      }
    );
  }

  const hasPurchasedProduct = await Order.exists({
    userId: String(userId).trim(),
    status: "paid",
    items: {
      $elemMatch: {
        productId: trimmedProductId,
      },
    },
  });

  if (!hasPurchasedProduct) {
    if (await hasCancelledOrderForProduct(userId, trimmedProductId)) {
      throwCancelledOrderReviewError();
    }

    throw new AppError(
      "You can only review products that you have purchased",
      403,
      "PURCHASE_REQUIRED",
      {
        productId: "You can only review products that you have purchased",
      }
    );
  }

  const deliveredOrderIds = await Delivery.distinct("orderId", {
    userId: String(userId).trim(),
    status: "delivered",
    items: {
      $elemMatch: {
        productId: trimmedProductId,
      },
    },
  });

  const validDeliveredOrderIds = deliveredOrderIds.filter((orderId) =>
    mongoose.Types.ObjectId.isValid(orderId)
  );

  const hasDeliveredPurchasedProduct =
    validDeliveredOrderIds.length > 0 &&
    (await Order.exists({
      _id: { $in: validDeliveredOrderIds },
      userId: String(userId).trim(),
      status: "paid",
      items: {
        $elemMatch: {
          productId: trimmedProductId,
        },
      },
    }));

  if (!hasDeliveredPurchasedProduct) {
    if (await hasCancelledOrderForProduct(userId, trimmedProductId)) {
      throwCancelledOrderReviewError();
    }

    throw new AppError(
      "You can only review products after they have been delivered",
      403,
      "DELIVERY_REQUIRED",
      {
        productId: "You can only review products after they have been delivered",
      }
    );
  }

  if (await hasFullyReturnedProduct(userId, trimmedProductId)) {
    throwReturnedProductReviewError();
  }

  const review = await Review.create({
    userId,
    productId: trimmedProductId,
    rating: ratingNumber,
    comment: normalizedComment,
    status: getReviewStatusForComment(normalizedComment),
    commentStatus: normalizedComment ? "pending" : "none",
  });

  return res.status(201).json({
    message: review.status === "pending"
      ? "Review submitted for approval."
      : "Rating submitted successfully.",
    review,
  });
});

// PATCH /api/reviews/:id
// Expected body:
// { rating?: 1-5 (int), comment?: string }
const updateReview = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  const { id } = req.params;
  const { rating, comment } = req.body;

  if (!userId) {
    throw new AppError("Authentication required", 401, "AUTH_REQUIRED");
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Review not found", 404, "REVIEW_NOT_FOUND");
  }

  const { errors, normalizedComment } = validateReviewInput(
    {
      rating,
      comment,
    },
    { requireProductId: false }
  );

  if (Object.keys(errors).length > 0) {
    throw new AppError("Validation failed", 400, "VALIDATION_ERROR", errors);
  }

  const review = await Review.findById(id);

  if (!review) {
    throw new AppError("Review not found", 404, "REVIEW_NOT_FOUND");
  }

  if (String(review.userId) !== String(userId)) {
    throw new AppError("You can only edit your own review", 403, "FORBIDDEN");
  }

  const previousApprovedComment = normalizeComment(review.comment);
  const isExistingPublicReview = review.status === "approved";
  const isCommentChanged = normalizedComment !== previousApprovedComment;

  if (hasRatingInput(rating)) {
    review.rating = Number(rating);
  } else if (Object.prototype.hasOwnProperty.call(req.body, "rating")) {
    review.rating = null;
  }

  if (!normalizedComment) {
    review.comment = "";
    review.pendingComment = "";
    review.commentStatus = "none";
    review.status = "approved";
  } else if (isExistingPublicReview && isCommentChanged) {
    review.pendingComment = normalizedComment;
    review.commentStatus = "pending";
  } else if (isExistingPublicReview) {
    review.comment = normalizedComment;
    review.status = "approved";

    if (review.commentStatus !== "pending") {
      review.pendingComment = "";
      review.commentStatus = "approved";
    }
  } else {
    review.comment = normalizedComment;
    review.pendingComment = "";
    review.commentStatus = normalizedComment
      ? review.commentStatus || "approved"
      : "none";
    review.status = getReviewStatusForComment(normalizedComment);
  }

  await review.save();

  const hasPendingComment = normalizeComment(review.pendingComment);

  return res.status(200).json({
    message: review.status === "pending" || hasPendingComment
      ? "Review update submitted for approval."
      : "Rating updated successfully.",
    review,
  });
});

module.exports = {
  getApprovedReviewsForProduct,
  createReview,
  updateReview,
};
