const mongoose = require("mongoose");

const returnItemSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const returnRequestSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
    },

    userId: {
      type: String,
      required: true,
    },

    items: {
      type: [returnItemSchema],
      required: true,
      default: [],
    },

    reason: {
      type: String,
      required: true,
      trim: true,
    },

    refundAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.model(
    "ReturnRequest",
    returnRequestSchema
  );