const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { cancelMyOrder, getMyOrders } = require("../controllers/orderController");

const router = express.Router();

router.get("/my-orders", authMiddleware, getMyOrders);
router.patch("/:orderId/cancel", authMiddleware, cancelMyOrder);

module.exports = router;
