const Product = require("../models/Product");

// CREATE product
const createProduct = async (req, res) => {
  try {
    const {
      name,
      model,
      serialNumber,
      description,
      quantityInStock,
      price,
      warrantyStatus,
      distributorInfo,
    } = req.body;

    const existingProduct = await Product.findOne({ serialNumber });
    if (existingProduct) {
      return res.status(400).json({
        message: "A product with this serial number already exists",
      });
    }

    const product = await Product.create({
      name,
      model,
      serialNumber,
      description,
      quantityInStock,
      price,
      warrantyStatus,
      distributorInfo,
    });

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create product",
      error: error.message,
    });
  }
};

// READ all products
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

// READ one product by id
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};

// UPDATE product
const updateProduct = async (req, res) => {
  try {
    const {
      name,
      model,
      serialNumber,
      description,
      quantityInStock,
      price,
      warrantyStatus,
      distributorInfo,
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    if (serialNumber && serialNumber !== product.serialNumber) {
      const serialExists = await Product.findOne({ serialNumber });
      if (serialExists) {
        return res.status(400).json({
          message: "Another product already uses this serial number",
        });
      }
    }

    product.name = name ?? product.name;
    product.model = model ?? product.model;
    product.serialNumber = serialNumber ?? product.serialNumber;
    product.description = description ?? product.description;
    product.quantityInStock = quantityInStock ?? product.quantityInStock;
    product.price = price ?? product.price;
    product.warrantyStatus = warrantyStatus ?? product.warrantyStatus;
    product.distributorInfo = distributorInfo ?? product.distributorInfo;

    const updatedProduct = await product.save();

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
};

// DELETE product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    await product.deleteOne();

    res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};