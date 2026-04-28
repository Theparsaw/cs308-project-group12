const Category = require("../models/Category");
const Product = require("../models/Product");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");

const serializeCategory = (category) => ({
  id: category._id,
  categoryId: category.categoryId,
  name: category.name,
  description: category.description,
  createdAt: category.createdAt,
  updatedAt: category.updatedAt,
});

const normalizeCategoryId = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const getAllCategories = asyncHandler(async (_req, res) => {
  const categories = await Category.find().sort({ name: 1 }).lean();

  return res.status(200).json({
    categories: categories.map(serializeCategory),
  });
});

const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ categoryId: req.params.id }).lean();

  if (!category) {
    throw new AppError("Category not found", 404, "CATEGORY_NOT_FOUND");
  }

  return res.status(200).json({
    category: serializeCategory(category),
  });
});

const createCategory = asyncHandler(async (req, res) => {
  const name = String(req.body.name || "").trim();
  const description = String(req.body.description || "").trim();
  const categoryId = normalizeCategoryId(req.body.categoryId || name);

  if (!categoryId || !name) {
    throw new AppError("categoryId and name are required", 400, "VALIDATION_ERROR");
  }

  const duplicate = await Category.findOne({
    $or: [
      { categoryId },
      { name: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
    ],
  });

  if (duplicate) {
    throw new AppError(
      "A category with this ID or name already exists",
      400,
      "DUPLICATE_CATEGORY"
    );
  }

  const category = await Category.create({
    categoryId,
    name,
    description,
  });

  return res.status(201).json({
    message: "Category created successfully",
    category: serializeCategory(category),
  });
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ categoryId: req.params.id });

  if (!category) {
    throw new AppError("Category not found", 404, "CATEGORY_NOT_FOUND");
  }

  const nextName =
    req.body.name === undefined ? category.name : String(req.body.name || "").trim();
  const nextDescription =
    req.body.description === undefined
      ? category.description
      : String(req.body.description || "").trim();

  if (!nextName) {
    throw new AppError("name is required", 400, "VALIDATION_ERROR");
  }

  const duplicateName = await Category.findOne({
    _id: { $ne: category._id },
    name: new RegExp(`^${nextName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
  });

  if (duplicateName) {
    throw new AppError("A category with this name already exists", 400, "DUPLICATE_CATEGORY");
  }

  category.name = nextName;
  category.description = nextDescription;

  const updatedCategory = await category.save();

  return res.status(200).json({
    message: "Category updated successfully",
    category: serializeCategory(updatedCategory),
  });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ categoryId: req.params.id });

  if (!category) {
    throw new AppError("Category not found", 404, "CATEGORY_NOT_FOUND");
  }

  const productCount = await Product.countDocuments({ categoryId: category.categoryId });

  if (productCount > 0) {
    throw new AppError(
      "Cannot delete a category that is assigned to products",
      400,
      "CATEGORY_IN_USE"
    );
  }

  await category.deleteOne();

  return res.status(200).json({
    message: "Category deleted successfully",
  });
});

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
