const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    model: {
      type: String,
      required: true,
      trim: true,
    },

    serialNumber: {
      type: String,
      required: true,
      unique: true, //  UNIQUE constraint
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    quantityInStock: {
      type: Number,
      required: true,
      default: 0,
      min: 0, //  prevents negative stock
    },

    price: {
      type: Number,
      required: true,
      min: 0, //  prevents negative price
    },

    warrantyStatus: {
      type: String,
      default: "No warranty",
    },

    distributorInfo: {
      type: String,
      default: "Unknown",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);