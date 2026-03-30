const mongoose = require("mongoose");

const moderationLogSchema = new mongoose.Schema(
  {
    reviewId: {
      type: String,
      required: true,
      trim: true,
    },
    action: {
      type: String,
      enum: ["APPROVED", "REJECTED"],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("ModerationLog", moderationLogSchema);
