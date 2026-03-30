const express = require("express");
const router = express.Router();
const {
  getPendingReviews,
  approveReview,
  rejectReview,
} = require("../controllers/moderationController");

router.get("/reviews/pending", getPendingReviews);
router.patch("/reviews/:id/approve", approveReview);
router.patch("/reviews/:id/reject", rejectReview);

module.exports = router;
