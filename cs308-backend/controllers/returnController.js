const ReturnRequest =
  require("../models/ReturnRequest");

const Order =
  require("../models/Order");

const Delivery =
  require("../models/Delivery");

const createReturnRequest =
  async (req, res) => {

    try {

      const {
        orderId,
        items,
        reason,
      } = req.body;

      const order =
        await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({
          message: "Order not found",
        });
      }

      if (
        order.userId !== req.user.id
      ) {
        return res.status(403).json({
          message: "Access denied",
        });
      }

      // unpaid block
      if (order.status !== "paid") {
        return res.status(400).json({
          message:
            "Only paid orders can be returned",
        });
      }

      const delivery =
        await Delivery.findOne({
          orderId: order._id.toString(),
        });

      // delivered block
      if (
        !delivery ||
        delivery.status !== "delivered"
      ) {
        return res.status(400).json({
          message:
            "Only delivered orders can be returned",
        });
      }

      // 30-day rule
      const deliveredDate =
        new Date(delivery.updatedAt);

      const now = new Date();

      const days =
        (now - deliveredDate) /
        (1000 * 60 * 60 * 24);

      if (days > 30) {
        return res.status(400).json({
          message:
            "Return window expired (30 days)",
        });
      }

      // duplicate prevention
      for (const item of items) {

        const existing =
          await ReturnRequest.findOne({
            orderId,
            userId: req.user.id,
            "items.productId":
              item.productId,
          });

        if (existing) {
          return res.status(400).json({
            message:
              "Return request already exists for this product",
          });
        }
      }

      const requestItems =
        items.map((requestItem) => {

          const orderedItem =
            order.items.find(
              (item) =>
                item.productId ===
                requestItem.productId
            );

          return {
            productId:
              orderedItem.productId,

            name:
              orderedItem.name,

            quantity:
              requestItem.quantity,

            unitPrice:
              orderedItem.unitPrice,
          };
        });

      const refundAmount =
        requestItems.reduce(
          (total, item) =>
            total +
            item.unitPrice *
              item.quantity,
          0
        );

      const returnRequest =
        await ReturnRequest.create({
          orderId,
          userId: req.user.id,
          items: requestItems,
          reason,
          refundAmount,
        });

      return res.status(201).json({
        message:
          "Return request submitted",
        returnRequest,
      });

    } catch (error) {

      return res.status(500).json({
        message:
          "Failed to create return request",
        error: error.message,
      });
    }
};

const getMyReturnRequests =
  async (req, res) => {

    try {

      const returnRequests =
        await ReturnRequest.find({
          userId: req.user.id,
        }).sort({
          createdAt: -1,
        });

      return res.status(200).json({
        returnRequests,
      });

    } catch (error) {

      return res.status(500).json({
        message:
          "Failed to fetch return requests",
        error: error.message,
      });
    }
};

module.exports = {
  createReturnRequest,
  getMyReturnRequests,
};