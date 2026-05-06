const Notification = require("../models/Notification");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");

const getMyNotifications = asyncHandler(async (req, res) => {

  const notifications = await Notification.find({
    userId: String(req.user.id),
  }).sort({ createdAt: -1 });

  return res.status(200).json({
    notifications,

    unreadCount:
      notifications.filter(
        (notification) => !notification.isRead
      ).length,
  });
});

const markNotificationAsRead = asyncHandler(async (req, res) => {

  const notification = await Notification.findById(
    req.params.id
  );

  if (!notification) {
    throw new AppError(
      "Notification not found",
      404,
      "NOTIFICATION_NOT_FOUND"
    );
  }

  if (
    String(notification.userId) !==
    String(req.user.id)
  ) {
    throw new AppError(
      "Access denied",
      403,
      "FORBIDDEN"
    );
  }

  notification.isRead = true;

  await notification.save();

  return res.status(200).json({
    message: "Notification marked as read",
    notification,
  });
});

module.exports = {
  getMyNotifications,
  markNotificationAsRead,
};