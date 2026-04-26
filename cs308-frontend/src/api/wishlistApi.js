import api from "./productApi";

export const getWishlist = () => api.get("/wishlist");

export const addWishlistItem = (productId) =>
  api.post("/wishlist/items", { productId });

export const removeWishlistItem = (productId) =>
  api.delete(`/wishlist/items/${productId}`);
