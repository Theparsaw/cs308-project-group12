const Delivery = require("../models/Delivery");
const Order = require("../models/Order");
const ReturnRequest = require("../models/ReturnRequest");

const RETURN_ELIGIBLE_DELIVERY_STATUSES = ["delivered"];

const serializeReturnRequest = (request) => ({
  id: request._id,
  orderId: request.orderId,
  items: request.items,
  reason: request.reason,
  refundAmount: request.refundAmount,
  status: request.status,
  resolvedAt: request.resolvedAt,
  createdAt: request.createdAt,
  updatedAt: request.updatedAt,
});

const getMyReturnRequests = async (req, res) => {
  try {
    const requests = await ReturnRequest.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      returnRequests: requests.map(serializeReturnRequest),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch return requests",
      error: error.message,
    });
  }
};

const createReturnRequest = async (req, res) => {
  try {
    const { orderId, reason } = req.body;
    const requestedItems = Array.isArray(req.body.items)
      ? req.body.items
          .map((item) => ({
            productId: String(item.productId || "").trim(),
            quantity: Number(item.quantity),
          }))
          .filter((item) => item.productId)
      : Array.isArray(req.body.itemProductIds)
        ? req.body.itemProductIds
            .map((productId) => ({
              productId: String(productId).trim(),
              quantity: 1,
            }))
            .filter((item) => item.productId)
        : [];

    if (!orderId || !String(orderId).trim()) {
      return res.status(400).json({ message: "orderId is required" });
    }

    if (!reason || !String(reason).trim()) {
      return res.status(400).json({ message: "Return reason is required" });
    }

    if (String(reason).trim().length > 500) {
      return res.status(400).json({ message: "Return reason cannot exceed 500 characters" });
    }

    if (requestedItems.length === 0) {
      return res.status(400).json({ message: "At least one order item must be selected" });
    }

    if (requestedItems.some((item) => !Number.isInteger(item.quantity) || item.quantity < 1)) {
      return res.status(400).json({ message: "Return quantity must be at least 1" });
    }

    const order = await Order.findOne({
      _id: String(orderId).trim(),
      userId: req.user.id,
      status: "paid",
    }).lean();

    if (!order) {
      return res.status(404).json({ message: "Eligible paid order not found" });
    }

    const delivery = await Delivery.findOne({ orderId: String(order._id) }).lean();

    if (!delivery || !RETURN_ELIGIBLE_DELIVERY_STATUSES.includes(delivery.status)) {
      return res.status(400).json({
        message: "Returns can only be requested after delivery",
      });
    }

    const quantityByProductId = requestedItems.reduce((acc, item) => {
      acc[item.productId] = (acc[item.productId] || 0) + item.quantity;
      return acc;
    }, {});
    const uniqueProductIds = Object.keys(quantityByProductId);
    const selectedItems = order.items
      .filter((item) => uniqueProductIds.includes(String(item.productId)))
      .map((item) => ({
        ...item,
        quantity: quantityByProductId[String(item.productId)],
      }));

    if (selectedItems.length !== uniqueProductIds.length) {
      return res.status(400).json({ message: "Selected return items are not part of this order" });
    }

    const invalidQuantityItem = selectedItems.find((selectedItem) => {
      const orderedItem = order.items.find(
        (item) => String(item.productId) === String(selectedItem.productId)
      );
      return selectedItem.quantity > Number(orderedItem?.quantity || 0);
    });

    if (invalidQuantityItem) {
      return res.status(400).json({
        message: "Return quantity cannot exceed the ordered quantity",
      });
    }

    const existingRequest = await ReturnRequest.findOne({
      userId: req.user.id,
      orderId: String(order._id),
    }).lean();

    if (existingRequest) {
      return res.status(409).json({ message: "A return request already exists for this order" });
    }

    const refundAmount = selectedItems.reduce(
      (total, item) => total + Number(item.unitPrice || 0) * Number(item.quantity || 0),
      0
    );

    const request = await ReturnRequest.create({
      userId: req.user.id,
      orderId: String(order._id),
      items: selectedItems.map((item) => ({
        productId: item.productId,
        name: item.name,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
      })),
      reason: String(reason).trim(),
      refundAmount,
    });

    return res.status(201).json({
      message: "Return request submitted successfully",
      returnRequest: serializeReturnRequest(request),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to submit return request",
      error: error.message,
    });
  }
};

module.exports = {
  createReturnRequest,
  getMyReturnRequests,
};
