const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const {
  downloadInvoice,
  getMyInvoices,
} = require("../controllers/invoiceController");

const router = express.Router();

router.get("/my-invoices", authMiddleware, getMyInvoices);
router.get("/:invoiceId/download", authMiddleware, downloadInvoice);

module.exports = router;
