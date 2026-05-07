const express = require("express");

const {
  createReturnRequest,
  getMyReturnRequests,
} = require("../controllers/returnController");

const {
  authMiddleware,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

router.get(
  "/my-returns",
  getMyReturnRequests
);

router.post(
  "/",
  createReturnRequest
);

module.exports = router;