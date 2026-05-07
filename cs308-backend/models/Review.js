const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
    },

    productId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },

    pendingComment: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },

    commentStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// Prevent duplicate submissions (same user reviewing same product)
reviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
