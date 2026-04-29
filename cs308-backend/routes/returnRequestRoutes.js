const express = require("express");
const {
  createReturnRequest,
  getMyReturnRequests,
} = require("../controllers/returnRequestController");
const { authMiddleware, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware, authorize("customer"));

router.get("/my-returns", getMyReturnRequests);
router.post("/", createReturnRequest);

module.exports = router;
