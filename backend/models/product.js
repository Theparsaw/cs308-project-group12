const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  product_id: {
    type: String,
    required: true,
    unique: true
  },
  category_id: {
    type: String,
    required: true
  },
  distributor_id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  serial_number: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  stock_quantity: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  warranty_status: {
    type: Boolean,
    required: true
  },
  image_url: {
    type: String
  },
  is_active: {
    type: Boolean,
    default: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', productSchema);