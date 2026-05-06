import { reactive } from "vue";
import {
  getNotifications,
  markNotificationAsRead,
} from "../api/notificationApi";

export const notificationStore = reactive({
  notifications: [],
  unreadCount: 0,
  loading: false,

  async loadNotifications() {
    this.loading = true;

    try {
      const res = await getNotifications();

      this.notifications = res.data.notifications || [];

      this.unreadCount = this.notifications.filter(
        (n) => !n.isRead
      ).length;
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      this.loading = false;
    }
  },

  async markAsRead(notificationId) {
    try {
      await markNotificationAsRead(notificationId);

      const notif = this.notifications.find(
        (n) => n._id === notificationId
      );

      if (notif && !notif.isRead) {
        notif.isRead = true;
        this.unreadCount--;
      }
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  },
});