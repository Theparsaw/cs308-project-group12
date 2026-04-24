const mongoose = require("mongoose");

const deliveryItemSchema = new mongoose.Schema(
  {
    productId: String,
    name: String,
    unitPrice: Number,
    quantity: Number,
  },
  { _id: false }
);

const deliverySchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },

    // snapshot of items
    items: {
      type: [deliveryItemSchema],
      required: true,
    },

    totalPrice: {
      type: Number,
      required: true,
    },

    //  since you DON’T have address in Order
    address: {
      type: String,
      default: "Not provided",
    },

    status: {
      type: String,
      enum: [
        "processing",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      default: "processing",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Delivery", deliverySchema);
