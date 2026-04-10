const Product = require("../models/Product");
const Review = require("../models/Review");
const User = require("../models/User");
const mongoose = require("mongoose");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");

const isValidRating = (rating) => {
  if (rating === undefined || rating === null) return false;

  const ratingNumber = Number(rating);
  if (!Number.isFinite(ratingNumber)) return false;
  if (!Number.isInteger(ratingNumber)) return false;

  return ratingNumber >= 1 && ratingNumber <= 5;
};

const normalizeComment = (comment) => String(comment ?? "").trim();

const validateReviewInput = ({ productId, rating, comment }) => {
  const errors = {};
  const normalizedComment = normalizeComment(comment);

  if (!productId || !String(productId).trim()) {
    errors.productId = "productId is required";
  }

  if (!isValidRating(rating)) {
    errors.rating = "rating must be an integer between 1 and 5";
  }

  if (!normalizedComment) {
    errors.comment = "comment is required";
  } else {
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

  return {
    errors,
    normalizedComment,
  };
};

const getApprovedReviewsForProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!productId || !String(productId).trim()) {
    throw new AppError("productId is required", 400, "VALIDATION_ERROR");
  }

  const reviews = await Review.find({
    productId: String(productId).trim(),
    status: "approved",
  })
    .sort({ createdAt: -1 })
    .lean();

  const userIds = reviews
    .map((review) => review.userId)
    .filter((id) => mongoose.Types.ObjectId.isValid(id));

  const users = userIds.length
    ? await User.find({ _id: { $in: userIds } }).select("name").lean()
    : [];

  const namesById = users.reduce((acc, user) => {
    acc[String(user._id)] = user.name;
    return acc;
  }, {});

  const data = reviews.map((review) => ({
    _id: review._id,
    productId: review.productId,
    userId: review.userId,
    reviewerName: namesById[review.userId] || "Anonymous User",
    rating: review.rating,
    comment: review.comment,
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
// { productId: string, rating: 1-5 (int), comment: string }
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
  const ratingNumber = Number(rating);

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

  const review = await Review.create({
    userId,
    productId: trimmedProductId,
    rating: ratingNumber,
    comment: normalizedComment,
  });

  return res.status(201).json({
    message: "Review submitted successfully and is pending approval",
    review,
  });
});

module.exports = {
  getApprovedReviewsForProduct,
  createReview,
};
