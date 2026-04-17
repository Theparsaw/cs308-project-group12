const Order = require("../models/Order");
const { serializeTrackedOrder } = require("../utils/orderTracking");

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });

    return res.status(200).json({
      orders: orders.map(serializeTrackedOrder),
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
