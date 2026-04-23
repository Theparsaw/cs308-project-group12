const express = require("express");
const router = express.Router();

const {
  getAllDeliveries,
  updateDeliveryStatus,
} = require("../controllers/deliveryController");

const { authMiddleware, authorize } = require("../middleware/authMiddleware");

router.use(authMiddleware, authorize("sales_manager"));

router.get("/", getAllDeliveries);
router.patch("/:id/status", updateDeliveryStatus);

module.exports = router;