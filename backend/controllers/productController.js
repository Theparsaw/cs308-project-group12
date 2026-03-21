const Product = require('../models/product');

// GET /products - get all products
const getAllProducts = async (req, res) => {
  try {
    console.log('getAllProducts called');
    const products = await Product.find();
    console.log('Products found:', products.length);
    res.status(200).json(products);
  } catch (error) {
    console.log('Error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// GET /products/:id - get one product
const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ product_id: req.params.id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /products - create a product
const createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT /products/:id - update a product
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate(
      { product_id: req.params.id },
      req.body,
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE /products/:id - delete a product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ product_id: req.params.id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};