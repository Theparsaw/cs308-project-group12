const express = require("express");
const router = express.Router();

const { authMiddleware } = require("../middleware/authMiddleware");
const {
  getApprovedReviewsForProduct,
  createReview,
} = require("../controllers/reviewController");

router.get("/product/:productId", getApprovedReviewsForProduct);
router.post("/", authMiddleware, createReview);

module.exports = router;
