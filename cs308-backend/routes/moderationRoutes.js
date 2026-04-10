const express = require("express");
const router = express.Router();
const {
  getPendingReviews,
  approveReview,
  rejectReview,
} = require("../controllers/moderationController");
const { authMiddleware, authorize } = require("../middleware/authMiddleware");

router.use(authMiddleware, authorize("sales_manager", "product_manager"));
router.get("/reviews/pending", getPendingReviews);
router.patch("/reviews/:id/approve", approveReview);
router.patch("/reviews/:id/reject", rejectReview);

module.exports = router;
