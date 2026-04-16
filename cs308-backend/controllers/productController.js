const Product = require("../models/Product");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");

const escapeRegex = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildRegexFallbackFilter = (search) => {
  const terms = String(search)
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((term) => escapeRegex(term));

  if (terms.length === 0) return {};

  return {
    $or: terms.flatMap((term) => {
      const regex = new RegExp(term, "i");
      return [
        { name: regex },
        { model: regex },
        { description: regex },
        { categoryId: regex },
        { productId: regex },
      ];
    }),
  };
};

const getAllProducts = asyncHandler(async (req, res) => {
  const rawSearch = req.query.search;
  const search = typeof rawSearch === "string" ? rawSearch.trim() : "";

  // Original behavior: no search query -> return all products
  if (!search) {
    const products = await Product.find({}).sort({ createdAt: -1 });
    return res.status(200).json(products);
  }

  try {
    // Atlas Search version
    // Make sure you create an Atlas Search index on the products collection.
    // Suggested index name: "product_search"
    const products = await Product.aggregate([
      {
        $search: {
          index: "product_search",
          compound: {
            should: [
              {
                autocomplete: {
                  query: search,
                  path: "name",
                  fuzzy: {
                    maxEdits: 1,
                    prefixLength: 1,
                  },
                },
              },
              {
                autocomplete: {
                  query: search,
                  path: "model",
                  fuzzy: {
                    maxEdits: 1,
                    prefixLength: 1,
                  },
                },
              },
              {
                text: {
                  query: search,
                  path: ["name", "model", "description", "categoryId", "productId"],
                  fuzzy: {
                    maxEdits: 1,
                    prefixLength: 1,
                  },
                },
              },
            ],
            minimumShouldMatch: 1,
          },
        },
      },
      {
        $addFields: {
          score: { $meta: "searchScore" },
        },
      },
      {
        $sort: {
          score: -1,
          createdAt: -1,
        },
      },
    ]);

    // If Atlas Search returned results, use them
    // If it returned nothing, fall back to regex so description search still works
    if (products.length > 0) {
      return res.status(200).json(products);
    }

    // Fallback: regex search across all fields including description
    const fallbackFilter = buildRegexFallbackFilter(search);
    const fallbackResults = await Product.find(fallbackFilter).sort({ createdAt: -1 });
    return res.status(200).json(fallbackResults);

  } catch (error) {
    // Safe fallback so search still works even if Atlas Search index
    // is not created yet or aggregation search is unavailable.
    const fallbackFilter = buildRegexFallbackFilter(search);
    const products = await Product.find(fallbackFilter).sort({ createdAt: -1 });
    return res.status(200).json(products);
  }
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ productId: req.params.id });

  if (!product) {
    throw new AppError("Product not found", 404, "PRODUCT_NOT_FOUND");
  }

  res.status(200).json(product);
});

const createProduct = asyncHandler(async (req, res) => {
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
    throw new AppError(
      "A product with this productId already exists",
      400,
      "DUPLICATE_PRODUCT_ID"
    );
  }

  const existingSerialNumber = await Product.findOne({ serialNumber });
  if (existingSerialNumber) {
    throw new AppError(
      "A product with this serial number already exists",
      400,
      "DUPLICATE_SERIAL_NUMBER"
    );
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
});

const updateProduct = asyncHandler(async (req, res) => {
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
    throw new AppError("Product not found", 404, "PRODUCT_NOT_FOUND");
  }

  if (serialNumber && serialNumber !== product.serialNumber) {
    const serialExists = await Product.findOne({ serialNumber });
    if (serialExists) {
      throw new AppError(
        "Another product already uses this serial number",
        400,
        "DUPLICATE_SERIAL_NUMBER"
      );
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
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ productId: req.params.id });

  if (!product) {
    throw new AppError("Product not found", 404, "PRODUCT_NOT_FOUND");
  }

  await product.deleteOne();

  res.status(200).json({
    message: "Product deleted successfully",
  });
});

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};