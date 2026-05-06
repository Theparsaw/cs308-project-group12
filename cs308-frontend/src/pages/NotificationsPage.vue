<template>
  <div class="max-w-4xl mx-auto p-6">
    <h1 class="text-3xl font-bold mb-6">
      Notifications
    </h1>

    <div
      v-if="notificationStore.notifications.length === 0"
      class="text-gray-500"
    >
      No notifications found.
    </div>

    <div
      v-for="notification in notificationStore.notifications"
      :key="notification._id"
      class="border rounded-2xl p-4 mb-4 bg-white shadow-sm"
    >
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="font-semibold text-gray-900">
            {{ notification.title }}
          </p>

          <p class="text-gray-600 mt-1">
            {{ notification.message }}
          </p>

          <p class="text-sm text-gray-400 mt-2">
            {{ new Date(notification.createdAt).toLocaleString() }}
          </p>
        </div>
        <button
        v-if="!notification.isRead"
        type="button"
        @click="notificationStore.markAsRead(notification._id)"
        class="relative z-50 pointer-events-auto px-3 py-2 rounded-xl bg-orange-500 text-white text-sm hover:bg-orange-600"
        >
        Mark as read
        </button>
        <span
          v-else
          class="text-sm text-green-600 font-medium"
        >
          Read
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { notificationStore } from "../store/notificationStore";

onMounted(() => {
  notificationStore.loadNotifications();
});
</script>