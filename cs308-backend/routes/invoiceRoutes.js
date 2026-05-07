const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/authMiddleware");
const {
  downloadInvoice,
  downloadSalesInvoice,
  getMyInvoices,
  getSalesInvoices,
  getSalesReport,
} = require("../controllers/invoiceController");

const router = express.Router();

router.get("/sales", authMiddleware, authorize("sales_manager"), getSalesInvoices);
router.get("/sales/report", authMiddleware, authorize("sales_manager"), getSalesReport);
router.get(
  "/sales/:invoiceId/download",
  authMiddleware,
  authorize("sales_manager"),
  downloadSalesInvoice
);
router.get("/my-invoices", authMiddleware, getMyInvoices);
router.get("/:invoiceId/download", authMiddleware, downloadInvoice);

module.exports = router;
