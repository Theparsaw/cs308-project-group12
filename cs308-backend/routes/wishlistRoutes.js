const express = require("express");
const {
  getWishlist,
  addWishlistItem,
  removeWishlistItem,
} = require("../controllers/wishlistController");
const { authMiddleware, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware, authorize("customer"));

router.get("/", getWishlist);
router.post("/items", addWishlistItem);
router.delete("/items/:productId", removeWishlistItem);

module.exports = router;
