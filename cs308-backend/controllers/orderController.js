const Order = require("../models/Order");
const Delivery = require("../models/Delivery");
const { serializeTrackedOrder } = require("../utils/orderTracking");

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      userId: req.user.id,
      status: "paid",
    })
      .sort({ createdAt: -1 })
      .lean();

    const orderIds = orders.map((order) => String(order._id));

    const deliveries = await Delivery.find({
      orderId: { $in: orderIds },
    }).lean();

    const deliveriesByOrderId = deliveries.reduce((acc, delivery) => {
      acc[String(delivery.orderId)] = delivery;
      return acc;
    }, {});

    return res.status(200).json({
      orders: orders.map((order) =>
        serializeTrackedOrder(order, deliveriesByOrderId[String(order._id)] || null)
      ),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

module.exports = {
  getMyOrders,
};