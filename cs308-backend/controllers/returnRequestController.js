const mongoose = require("mongoose");
const ReturnRequest = require("../models/ReturnRequest");
const Order = require("../models/Order");
const Delivery = require("../models/Delivery");
const Product = require("../models/Product");

const getMyReturnRequests = async (req, res) => {
  try {
    const returnRequests = await ReturnRequest.find({ userId: req.user.id }).sort({ createdAt: -1 }).lean();
    return res.status(200).json({ returnRequests });
  } catch (error) {
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const createReturnRequest = async (req, res) => {
  try {
    const { orderId, items, reason } = req.body;

    const order = await Order.findOne({ _id: orderId, userId: req.user.id, status: "paid" }).lean();
    if (!order) return res.status(404).json({ message: "Order not found" });

    const delivery = await Delivery.findOne({ orderId }).lean();
    if (!delivery || delivery.status !== "delivered") return res.status(400).json({ message: "Not delivered yet" });

    let refundAmount = 0;
    const processedItems = [];

    for (const requestedItem of items) {
      const orderItem = order.items.find(i => i.productId === requestedItem.productId);
      if (!orderItem) return res.status(400).json({ message: "Item not in order" });
      
      refundAmount += orderItem.unitPrice * requestedItem.quantity;
      processedItems.push({ ...orderItem, quantity: requestedItem.quantity });
    }

    const returnRequest = await ReturnRequest.create({
      userId: req.user.id, orderId, items: processedItems, reason, refundAmount,
    });

    return res.status(201).json(returnRequest);
  } catch (error) {
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const getPendingReturnRequests = async (req, res) => {
  try {
    const pendingRequests = await ReturnRequest.find({ status: "pending" })
      .populate("userId", "name email")
      .sort({ createdAt: 1 }); 
    return res.status(200).json({ success: true, count: pendingRequests.length, data: pendingRequests });
  } catch (error) {
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const rejectReturnRequest = async (req, res) => {
  try {
    const { managerNotes } = req.body;
    const returnReq = await ReturnRequest.findById(req.params.id);

    if (!returnReq || returnReq.status !== "pending") return res.status(400).json({ message: "Invalid request" });

    returnReq.status = "rejected";
    returnReq.managerNotes = managerNotes || "";
    returnReq.resolvedAt = new Date();
    returnReq.reviewedBy = req.user.id;
    await returnReq.save();

    return res.status(200).json({ success: true, data: returnReq });
  } catch (error) {
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};

const approveReturnRequest = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const returnReq = await ReturnRequest.findById(req.params.id).session(session);
    if (!returnReq || returnReq.status !== "pending") return res.status(400).json({ message: "Invalid request" });

    for (const item of returnReq.items) {
      await Product.findOneAndUpdate(
        { productId: item.productId },
        { $inc: { quantityInStock: item.quantity } },
        { session }
      );
    }

    returnReq.status = "approved";
    returnReq.resolvedAt = new Date();
    returnReq.reviewedBy = req.user.id;
    await returnReq.save({ session });

    await session.commitTransaction();
    session.endSession();
    return res.status(200).json({ success: true, data: returnReq });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};

module.exports = {
  getMyReturnRequests, createReturnRequest, getPendingReturnRequests, rejectReturnRequest, approveReturnRequest,
};