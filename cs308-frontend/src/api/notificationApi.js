import api from "./productApi";

export const getNotifications = () =>
  api.get("/notifications");

export const markNotificationAsRead = (notificationId) =>
  api.patch(`/notifications/${notificationId}/read`);