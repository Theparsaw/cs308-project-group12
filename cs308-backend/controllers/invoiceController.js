const Invoice = require("../models/Invoice");
const Order = require("../models/Order");
const User = require("../models/User");
const { generateInvoicePDF } = require("../utils/invoiceGenerator");

const serializeInvoice = (invoice) => ({
  id: invoice._id,
  orderId: invoice.orderId,
  invoiceNumber: invoice.invoiceNumber,
  amount: invoice.amount,
  status: invoice.status,
  createdAt: invoice.createdAt,
  updatedAt: invoice.updatedAt,
});

const getMyInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      invoices: invoices.map(serializeInvoice),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch invoices",
      error: error.message,
    });
  }
};

const downloadInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const invoice = await Invoice.findOne({
      _id: invoiceId,
      userId: req.user.id,
    }).lean();

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const order = await Order.findOne({
      _id: invoice.orderId,
      userId: req.user.id,
      status: "paid",
    }).lean();

    if (!order) {
      return res.status(404).json({ message: "Paid order for this invoice was not found" });
    }

    const user = await User.findById(req.user.id).select("name email address");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const pdfBuffer = await generateInvoicePDF(order, user);
    const safeInvoiceNumber = invoice.invoiceNumber.replace(/[^a-zA-Z0-9_-]/g, "_");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${safeInvoiceNumber}.pdf"`
    );

    return res.status(200).send(pdfBuffer);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to download invoice",
      error: error.message,
    });
  }
};

module.exports = {
  getMyInvoices,
  downloadInvoice,
};
