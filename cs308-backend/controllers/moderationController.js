const Review = require("../models/Review");
const ModerationLog = require("../models/ModerationLog");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");

const getPendingReviews = asyncHandler(async (req, res) => {
  const pendingReviews = await Review.find({
    $or: [{ status: "pending" }, { commentStatus: "pending" }],
  });

  return res.status(200).json({
    success: true,
    count: pendingReviews.length,
    data: pendingReviews,
  });
});

const approveReview = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const review = await Review.findById(id);

  if (!review) {
    throw new AppError("Review not found", 404, "REVIEW_NOT_FOUND");
  }

  if (review.pendingComment) {
    review.comment = review.pendingComment;
    review.pendingComment = "";
    review.commentStatus = "approved";
  }

  review.status = "approved";
  await review.save();

  await ModerationLog.create({
    reviewId: id,
    action: "APPROVED",
  });

  return res.status(200).json({
    success: true,
    message: "Review approved successfully",
    data: review,
  });
});

const rejectReview = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const review = await Review.findById(id);

  if (!review) {
    throw new AppError("Review not found", 404, "REVIEW_NOT_FOUND");
  }

  if (review.pendingComment) {
    review.pendingComment = "";
    review.commentStatus = "rejected";
  } else {
    review.status = "rejected";
  }

  await review.save();

  await ModerationLog.create({
    reviewId: id,
    action: "REJECTED",
  });

  return res.status(200).json({
    success: true,
    message: "Review rejected successfully",
    data: review,
  });
});

module.exports = {
  getPendingReviews,
  approveReview,
  rejectReview,
};
