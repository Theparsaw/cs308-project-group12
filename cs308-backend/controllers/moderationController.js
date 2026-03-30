const Review = require("../models/Review");
const ModerationLog = require("../models/ModerationLog");

const getPendingReviews = async (req, res) => {
  try {
    const pendingReviews = await Review.find({ status: "pending" });

    return res.status(200).json({
      success: true,
      count: pendingReviews.length,
      data: pendingReviews,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const approveReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByIdAndUpdate(
      id,
      { status: "approved" },
      { new: true },
    );

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    await ModerationLog.create({
      reviewId: id,
      action: "APPROVED",
    });

    return res.status(200).json({
      success: true,
      message: "Review approved successfully",
      data: review,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const rejectReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByIdAndUpdate(
      id,
      { status: "rejected" },
      { new: true },
    );

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    await ModerationLog.create({
      reviewId: id,
      action: "REJECTED",
    });

    return res.status(200).json({
      success: true,
      message: "Review rejected successfully",
      data: review,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPendingReviews,
  approveReview,
  rejectReview,
};
