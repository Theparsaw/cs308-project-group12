const express = require("express");
const {
  createReturnRequest,
  getMyReturnRequests,
  getPendingReturnRequests,
  approveReturnRequest,
  rejectReturnRequest,
} = require("../controllers/returnRequestController");
const { authMiddleware, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware); // All routes require login

// Customer Routes
router.get("/my-returns", authorize("customer"), getMyReturnRequests);
router.post("/", authorize("customer"), createReturnRequest);

// Sales Manager Routes
router.get("/pending", authorize("sales_manager"), getPendingReturnRequests);
router.patch("/:id/approve", authorize("sales_manager"), approveReturnRequest);
router.patch("/:id/reject", authorize("sales_manager"), rejectReturnRequest);

module.exports = router;