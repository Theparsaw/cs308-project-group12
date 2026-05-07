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

const parseDateRange = (query = {}) => {
  const startDate = query.startDate ? new Date(query.startDate) : null;
  const endDate = query.endDate ? new Date(query.endDate) : null;

  if (startDate && Number.isNaN(startDate.getTime())) {
    return { error: "startDate is invalid" };
  }

  if (endDate && Number.isNaN(endDate.getTime())) {
    return { error: "endDate is invalid" };
  }

  if (endDate) {
    endDate.setUTCHours(23, 59, 59, 999);
  }

  if (startDate && endDate && startDate > endDate) {
    return { error: "startDate must be before or equal to endDate" };
  }

  const createdAt = {};
  if (startDate) createdAt.$gte = startDate;
  if (endDate) createdAt.$lte = endDate;

  return {
    startDate,
    endDate,
    filter: Object.keys(createdAt).length ? { createdAt } : {},
  };
};

const getOrderDate = (order) => order.paidAt || order.createdAt;

const getLineOriginalPrice = (item) =>
  Number(item.originalPrice ?? item.unitPrice ?? 0);

const getLineDiscountLoss = (item) => {
  const originalPrice = getLineOriginalPrice(item);
  const unitPrice = Number(item.unitPrice || 0);
  return Math.max(0, originalPrice - unitPrice) * Number(item.quantity || 0);
};

const buildReportSummary = (orders) => {
  const summaryByDate = new Map();

  let revenue = 0;
  let discountLoss = 0;
  let itemsSold = 0;

  orders.forEach((order) => {
    const orderRevenue = Number(order.totalPrice || 0);
    const orderDiscountLoss = (order.items || []).reduce(
      (sum, item) => sum + getLineDiscountLoss(item),
      0
    );
    const orderItemsSold = (order.items || []).reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0
    );
    const dateKey = getOrderDate(order)?.toISOString().slice(0, 10) || "unknown";

    revenue += orderRevenue;
    discountLoss += orderDiscountLoss;
    itemsSold += orderItemsSold;

    const current = summaryByDate.get(dateKey) || {
      date: dateKey,
      revenue: 0,
      discountLoss: 0,
      estimatedProfit: 0,
      orders: 0,
      itemsSold: 0,
    };

    current.revenue += orderRevenue;
    current.discountLoss += orderDiscountLoss;
    current.estimatedProfit = current.revenue - current.discountLoss;
    current.orders += 1;
    current.itemsSold += orderItemsSold;
    summaryByDate.set(dateKey, current);
  });

  return {
    revenue: Number(revenue.toFixed(2)),
    discountLoss: Number(discountLoss.toFixed(2)),
    estimatedProfit: Number((revenue - discountLoss).toFixed(2)),
    orderCount: orders.length,
    itemsSold,
    chart: Array.from(summaryByDate.values())
      .sort((left, right) => left.date.localeCompare(right.date))
      .map((point) => ({
        ...point,
        revenue: Number(point.revenue.toFixed(2)),
        discountLoss: Number(point.discountLoss.toFixed(2)),
        estimatedProfit: Number(point.estimatedProfit.toFixed(2)),
      })),
  };
};

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

const getSalesInvoices = async (req, res) => {
  try {
    const range = parseDateRange(req.query);

    if (range.error) {
      return res.status(400).json({ message: range.error });
    }

    const invoices = await Invoice.find(range.filter)
      .sort({ createdAt: -1 })
      .lean();
    const userIds = [...new Set(invoices.map((invoice) => invoice.userId))];
    const users = userIds.length
      ? await User.find({ _id: { $in: userIds } }).select("_id name email").lean()
      : [];
    const usersById = users.reduce((acc, user) => {
      acc[String(user._id)] = user;
      return acc;
    }, {});
    const totalAmount = invoices.reduce(
      (sum, invoice) => sum + Number(invoice.amount || 0),
      0
    );

    return res.status(200).json({
      invoices: invoices.map((invoice) => ({
        ...serializeInvoice(invoice),
        userId: invoice.userId,
        customerName: usersById[invoice.userId]?.name || "Unknown User",
        customerEmail: usersById[invoice.userId]?.email || "",
      })),
      summary: {
        count: invoices.length,
        totalAmount: Number(totalAmount.toFixed(2)),
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch sales invoices",
      error: error.message,
    });
  }
};

const getSalesReport = async (req, res) => {
  try {
    const range = parseDateRange(req.query);

    if (range.error) {
      return res.status(400).json({ message: range.error });
    }

    const paidAt = {};
    if (range.startDate) paidAt.$gte = range.startDate;
    if (range.endDate) paidAt.$lte = range.endDate;

    const filter = {
      status: "paid",
      ...(Object.keys(paidAt).length ? { paidAt } : {}),
    };
    const orders = await Order.find(filter).sort({ paidAt: 1, createdAt: 1 }).lean();

    return res.status(200).json({
      summary: buildReportSummary(orders),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to calculate sales report",
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

const downloadSalesInvoice = async (req, res) => {
  try {
    const { invoiceId } = req.params;

    const invoice = await Invoice.findOne({ _id: invoiceId }).lean();

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    const order = await Order.findOne({
      _id: invoice.orderId,
      status: "paid",
    }).lean();

    if (!order) {
      return res.status(404).json({ message: "Paid order for this invoice was not found" });
    }

    const user = await User.findById(invoice.userId).select("name email address");

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
      message: "Failed to download sales invoice",
      error: error.message,
    });
  }
};

module.exports = {
  getMyInvoices,
  getSalesInvoices,
  getSalesReport,
  downloadInvoice,
  downloadSalesInvoice,
};
