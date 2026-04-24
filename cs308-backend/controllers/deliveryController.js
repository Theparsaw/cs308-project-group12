const Delivery = require("../models/Delivery");
const User = require("../models/User");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");

const ALLOWED_DELIVERY_STATUSES = [
  "processing",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

const serializeDelivery = (delivery, userMap = {}) => ({
  id: delivery._id,
  orderId: delivery.orderId,
  userId: delivery.userId,
  customerName: userMap[delivery.userId]?.name || "Unknown User",
  customerEmail: userMap[delivery.userId]?.email || "",
  items: delivery.items,
  totalPrice: delivery.totalPrice,
  address: delivery.address,
  status: delivery.status,
  createdAt: delivery.createdAt,
  updatedAt: delivery.updatedAt,
});

const getAllDeliveries = asyncHandler(async (_req, res) => {
  const deliveries = await Delivery.find().sort({ createdAt: -1 }).lean();

  const userIds = [...new Set(deliveries.map((delivery) => delivery.userId).filter(Boolean))];

  const users = userIds.length
    ? await User.find({ _id: { $in: userIds } })
        .select("_id name email")
        .lean()
    : [];

  const userMap = users.reduce((acc, user) => {
    acc[String(user._id)] = {
      name: user.name,
      email: user.email,
    };
    return acc;
  }, {});

  return res.status(200).json({
    success: true,
    count: deliveries.length,
    data: deliveries.map((delivery) => serializeDelivery(delivery, userMap)),
  });
});

const updateDeliveryStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status || !String(status).trim()) {
    throw new AppError("status is required", 400, "VALIDATION_ERROR");
  }

  const normalizedStatus = String(status).trim();

  if (!ALLOWED_DELIVERY_STATUSES.includes(normalizedStatus)) {
    throw new AppError(
      `Invalid delivery status. Allowed values: ${ALLOWED_DELIVERY_STATUSES.join(", ")}`,
      400,
      "INVALID_DELIVERY_STATUS"
    );
  }

  const delivery = await Delivery.findById(id);

  if (!delivery) {
    throw new AppError("Delivery not found", 404, "DELIVERY_NOT_FOUND");
  }

  delivery.status = normalizedStatus;
  await delivery.save();

  const user = delivery.userId
    ? await User.findById(delivery.userId).select("_id name email").lean()
    : null;

  const userMap = user
    ? {
        [String(user._id)]: {
          name: user.name,
          email: user.email,
        },
      }
    : {};

  return res.status(200).json({
    success: true,
    message: "Delivery status updated successfully",
    data: serializeDelivery(delivery.toObject(), userMap),
  });
});

module.exports = {
  getAllDeliveries,
  updateDeliveryStatus,
};
