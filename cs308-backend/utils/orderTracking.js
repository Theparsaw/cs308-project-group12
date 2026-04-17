const addDays = (dateValue, days) => {
  const date = new Date(dateValue);
  date.setDate(date.getDate() + days);
  return date;
};

const getDeliveryStatus = (order) => {
  if (order.status !== "paid") {
    return "processing";
  }

  const processingStart = order.paidAt || order.createdAt;
  const shippedAt = addDays(processingStart, 2);
  const deliveredAt = addDays(processingStart, 5);
  const now = new Date();

  if (now >= deliveredAt) {
    return "delivered";
  }

  if (now >= shippedAt) {
    return "in_transit";
  }

  return "processing";
};

const buildTimeline = (order) => {
  const processingStart = order.paidAt || order.createdAt;
  const shippedAt = addDays(processingStart, 2);
  const deliveredAt = addDays(processingStart, 5);
  const deliveryStatus = getDeliveryStatus(order);

  return [
    {
      key: "processing",
      label: "Processing",
      date: processingStart,
      state:
        deliveryStatus === "processing" ? "current" : "completed",
    },
    {
      key: "in_transit",
      label: "In Transit",
      date: shippedAt,
      state:
        deliveryStatus === "processing"
          ? "pending"
          : deliveryStatus === "in_transit"
          ? "current"
          : "completed",
    },
    {
      key: "delivered",
      label: "Delivered",
      date: deliveredAt,
      state: deliveryStatus === "delivered" ? "current" : "pending",
    },
  ];
};

const serializeOrder = (order) => ({
  id: order._id,
  userId: order.userId,
  cartId: order.cartId,
  items: order.items,
  totalPrice: order.totalPrice,
  status: order.status,
  paidAt: order.paidAt,
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
});

const serializeTrackedOrder = (order) => {
  const baseOrder = serializeOrder(order);
  const deliveryStatus = getDeliveryStatus(order);
  const timeline = buildTimeline(order);

  return {
    ...baseOrder,
    deliveryStatus,
    trackingNumber: `TRK-${String(order._id).slice(-8).toUpperCase()}`,
    estimatedDeliveryAt: timeline[timeline.length - 1].date,
    timeline,
  };
};

module.exports = {
  serializeOrder,
  serializeTrackedOrder,
};
