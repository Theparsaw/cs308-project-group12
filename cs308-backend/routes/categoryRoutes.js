const express = require("express");
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const { authMiddleware, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").get(getAllCategories).post(authMiddleware, authorize("product_manager"), createCategory);

router
  .route("/:id")
  .get(getCategoryById)
  .put(authMiddleware, authorize("product_manager"), updateCategory)
  .delete(authMiddleware, authorize("product_manager"), deleteCategory);

module.exports = router;
