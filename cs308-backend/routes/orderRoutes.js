const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { getMyOrders } = require("../controllers/orderController");

const router = express.Router();

router.get("/my-orders", authMiddleware, getMyOrders);

module.exports = router;
