const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const {
  getOrderForPayment,
  processPayment,
} = require("../controllers/paymentController");

const router = express.Router();

router.get("/order/:orderId", authMiddleware, getOrderForPayment);
router.post("/:orderId", authMiddleware, processPayment);

module.exports = router;
