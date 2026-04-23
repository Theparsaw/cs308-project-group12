const addDays = (dateValue, days) => {
  const date = new Date(dateValue);
  date.setDate(date.getDate() + days);
  return date;
};

const VALID_DELIVERY_STATUSES = [
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

const getDeliveryStatus = (order, delivery = null) => {
  const deliveryStatus = delivery?.status;

  if (VALID_DELIVERY_STATUSES.includes(deliveryStatus)) {
    return deliveryStatus;
  }

  if (order.status !== "paid") {
    return "processing";
  }

  return "processing";
};

const buildNormalTimeline = (order, deliveryStatus) => {
  const baseDate = order.paidAt || order.createdAt;

  const steps = [
    {
      key: "processing",
      label: "Processing",
      date: baseDate,
    },
    {
      key: "shipped",
      label: "Shipped",
      date: addDays(baseDate, 1),
    },
    {
      key: "out_for_delivery",
      label: "Out for Delivery",
      date: addDays(baseDate, 3),
    },
    {
      key: "delivered",
      label: "Delivered",
      date: addDays(baseDate, 5),
    },
  ];

  const currentIndex = steps.findIndex((step) => step.key === deliveryStatus);

  return steps.map((step, index) => ({
    ...step,
    state:
      index < currentIndex
        ? "completed"
        : index === currentIndex
          ? "current"
          : "pending",
    isLast: index === steps.length - 1,
  }));
};

const buildCancelledTimeline = (order) => {
  const baseDate = order.paidAt || order.createdAt;

  const steps = [
    {
      key: "processing",
      label: "Processing",
      date: baseDate,
      state: "completed",
      isLast: false,
    },
    {
      key: "cancelled",
      label: "Cancelled",
      date: addDays(baseDate, 1),
      state: "current",
      isLast: true,
    },
  ];

  return steps;
};

const buildTimeline = (order, delivery = null) => {
  const deliveryStatus = getDeliveryStatus(order, delivery);

  if (deliveryStatus === "cancelled") {
    return buildCancelledTimeline(order);
  }

  return buildNormalTimeline(order, deliveryStatus);
};

const getEstimatedDeliveryAt = (order, deliveryStatus) => {
  const baseDate = order.paidAt || order.createdAt;

  if (deliveryStatus === "delivered") {
    return addDays(baseDate, 5);
  }

  if (deliveryStatus === "out_for_delivery") {
    return addDays(baseDate, 5);
  }

  if (deliveryStatus === "shipped") {
    return addDays(baseDate, 5);
  }

  if (deliveryStatus === "cancelled") {
    return null;
  }

  return addDays(baseDate, 5);
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

const serializeTrackedOrder = (order, delivery = null) => {
  const baseOrder = serializeOrder(order);
  const deliveryStatus = getDeliveryStatus(order, delivery);
  const timeline = buildTimeline(order, delivery);

  return {
    ...baseOrder,
    deliveryStatus,
    trackingNumber: `TRK-${String(order._id).slice(-8).toUpperCase()}`,
    estimatedDeliveryAt: getEstimatedDeliveryAt(order, deliveryStatus),
    timeline,
  };
};

module.exports = {
  serializeOrder,
  serializeTrackedOrder,
};