const Product = require("../models/Product");
const Review = require("../models/Review");

const isValidRating = (rating) => {
  if (rating === undefined || rating === null) return false;

  const ratingNumber = Number(rating);
  if (!Number.isFinite(ratingNumber)) return false;
  if (!Number.isInteger(ratingNumber)) return false;

  return ratingNumber >= 1 && ratingNumber <= 5;
};

// POST /api/reviews
// Expected body:
// { userId: string, productId: string, rating: 1-5 (int), comment?: string }
const createReview = async (req, res) => {
  try {
    const { userId, productId, rating, comment } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    if (!productId) {
      return res.status(400).json({ message: "productId is required" });
    }

    if (!isValidRating(rating)) {
      return res.status(400).json({
        message: "rating must be an integer between 1 and 5",
      });
    }

    const ratingNumber = Number(rating);

    const product = await Product.findOne({ productId });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const existingReview = await Review.findOne({ userId, productId });
    if (existingReview) {
      return res.status(400).json({
        message: "You have already submitted a review for this product",
      });
    }

    const review = await Review.create({
      userId,
      productId,
      rating: ratingNumber,
      comment: comment ?? "",
      // status defaults to "pending"
    });

    return res.status(201).json({
      message: "Review created successfully",
      review,
    });
  } catch (error) {
    // In case two requests race past the findOne() check.
    if (error && error.code === 11000) {
      return res.status(400).json({
        message: "You have already submitted a review for this product",
      });
    }

    return res.status(500).json({
      message: "Failed to create review",
      error: error.message,
    });
  }
};

module.exports = {
  createReview,
};

