const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },

    productId: {
      type: String,
      required: true,
      trim: true,
    },

    campaignId: {
      type: String,
      required: true,
      trim: true,
    },

    productName: {
      type: String,
      required: true,
      trim: true,
    },

    discountPercentage: {
      type: Number,
      required: true,
      min: 1,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index(
  {
    userId: 1,
    productId: 1,
    campaignId: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("Notification", notificationSchema);