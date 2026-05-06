const express = require("express");
const router = express.Router();

const {
  getAllDeliveries,
  updateDeliveryStatus,
  downloadDeliveryInvoice,
} = require("../controllers/deliveryController");

const { authMiddleware, authorize } = require("../middleware/authMiddleware");

router.use(authMiddleware, authorize("product_manager"));

router.get("/", getAllDeliveries);
router.get("/:id/invoice/download", downloadDeliveryInvoice);
router.patch("/:id/status", updateDeliveryStatus);

module.exports = router;