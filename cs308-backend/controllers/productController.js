const Product = require("../models/Product");

// GET /products - get all products
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

// GET /products/:id - get one product by productId
const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ productId: req.params.id });

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

// POST /products - create a product
const createProduct = async (req, res) => {
  try {
    const {
      productId,
      categoryId,
      name,
      model,
      serialNumber,
      description,
      quantityInStock,
      price,
      warrantyStatus,
      distributorInfo,
    } = req.body;

    const existingProductId = await Product.findOne({ productId });
    if (existingProductId) {
      return res.status(400).json({
        message: "A product with this productId already exists",
      });
    }

    const existingSerialNumber = await Product.findOne({ serialNumber });
    if (existingSerialNumber) {
      return res.status(400).json({
        message: "A product with this serial number already exists",
      });
    }

    const product = await Product.create({
      productId,
      categoryId,
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

// PUT /products/:id - update a product by productId
const updateProduct = async (req, res) => {
  try {
    const {
      categoryId,
      name,
      model,
      serialNumber,
      description,
      quantityInStock,
      price,
      warrantyStatus,
      distributorInfo,
    } = req.body;

    const product = await Product.findOne({ productId: req.params.id });

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

    product.categoryId = categoryId ?? product.categoryId;
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

// DELETE /products/:id - delete a product by productId
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ productId: req.params.id });

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