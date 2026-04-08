const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  getCheckoutCart,
  validateCheckout,
  createOrder,
} = require("../controllers/checkoutController");

const router = express.Router();

router.get("/:cartId", authMiddleware, getCheckoutCart);
router.post("/:cartId/validate", authMiddleware, validateCheckout);
router.post("/:cartId/order", authMiddleware, createOrder);

module.exports = router;