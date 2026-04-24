const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../middleware/authMiddleware");
const {
  getApprovedReviewsForProduct,
  createReview,
  updateReview,
} = require("../controllers/reviewController");

router.get("/product/:productId", getApprovedReviewsForProduct);
router.post("/", authMiddleware, createReview);
router.patch("/:id", authMiddleware, updateReview);

module.exports = router;
