const Cart = require("../models/Cart");
const Product = require("../models/Product");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");

const calculateTotalPrice = (items) =>
  items.reduce((total, item) => total + item.unitPrice * item.quantity, 0);

const formatProductName = (product) => `${product.name} ${product.model}`;

const serializeCart = (cart) => ({
  cartId: cart.cartId,
  items: cart.items,
  totalPrice: cart.totalPrice,
  totalItems: cart.items.reduce((count, item) => count + item.quantity, 0),
  createdAt: cart.createdAt,
  updatedAt: cart.updatedAt,
});

const getEmptyCartPayload = (cartId) => ({
  cartId,
  items: [],
  totalPrice: 0,
  totalItems: 0,
});

const isValidQuantity = (quantity) =>
  Number.isInteger(quantity) && quantity >= 1;

const assertCartAccess = (cart, userId) => {
  if (String(cart.userId) !== String(userId)) {
    throw new AppError("You are not allowed to access this cart", 403, "FORBIDDEN");
  }
};

const claimLegacyCartIfNeeded = async (cart, userId) => {
  if (!cart.userId) {
    cart.userId = userId;
    await cart.save();
  }
  return cart;
};

const findOrCreateCart = async (cartId, userId) => {
  let cart = await Cart.findOne({ cartId });

  if (!cart) {
    cart = await Cart.create({ cartId, userId, items: [], totalPrice: 0 });
  } else {
    await claimLegacyCartIfNeeded(cart, userId);
    assertCartAccess(cart, userId);
  }

  return cart;
};

const getCart = asyncHandler(async (req, res) => {
  const { cartId } = req.params;
  const cart = await Cart.findOne({ cartId });

  if (!cart) {
    return res.status(200).json(getEmptyCartPayload(cartId));
  }

  await claimLegacyCartIfNeeded(cart, req.user.id);
  assertCartAccess(cart, req.user.id);
  return res.status(200).json(serializeCart(cart));
});

const addItemToCart = asyncHandler(async (req, res) => {
  const { cartId } = req.params;
  const { productId, quantity = 1 } = req.body;

  if (!productId) {
    throw new AppError("productId is required", 400, "VALIDATION_ERROR");
  }

  if (!isValidQuantity(quantity)) {
    throw new AppError(
      "Quantity must be an integer greater than 0",
      400,
      "VALIDATION_ERROR"
    );
  }

  const product = await Product.findOne({ productId });

  if (!product) {
    throw new AppError("Product not found", 404, "PRODUCT_NOT_FOUND");
  }

  const cart = await findOrCreateCart(cartId, req.user.id);
  const existingItem = cart.items.find((item) => item.productId === productId);
  const nextQuantity = (existingItem?.quantity || 0) + quantity;

  if (nextQuantity > product.quantityInStock) {
    throw new AppError(
      "Requested quantity exceeds available stock",
      400,
      "INSUFFICIENT_STOCK",
      { availableStock: product.quantityInStock }
    );
  }

  if (existingItem) {
      existingItem.quantity = nextQuantity;
      existingItem.unitPrice = product.price;
      existingItem.name = formatProductName(product);
      existingItem.imageUrl = product.imageUrl || "";
    } else {
      cart.items.push({
        productId: product.productId,
        name: formatProductName(product),
        imageUrl: product.imageUrl || "",
        unitPrice: product.price,
        quantity,
      });
  }

  cart.totalPrice = calculateTotalPrice(cart.items);
  await cart.save();

  return res.status(200).json(serializeCart(cart));
});

const updateCartItemQuantity = asyncHandler(async (req, res) => {
  const { cartId, productId } = req.params;
  const { quantity } = req.body;

  if (!isValidQuantity(quantity)) {
    throw new AppError(
      "Quantity must be an integer greater than 0",
      400,
      "VALIDATION_ERROR"
    );
  }

  const cart = await Cart.findOne({ cartId });

  if (!cart) {
    throw new AppError("Cart not found", 404, "CART_NOT_FOUND");
  }

  await claimLegacyCartIfNeeded(cart, req.user.id);
  assertCartAccess(cart, req.user.id);
  const item = cart.items.find((cartItem) => cartItem.productId === productId);

  if (!item) {
    throw new AppError("Cart item not found", 404, "CART_ITEM_NOT_FOUND");
  }

  const product = await Product.findOne({ productId });

  if (!product) {
    throw new AppError("Product not found", 404, "PRODUCT_NOT_FOUND");
  }

  if (quantity > product.quantityInStock) {
    throw new AppError(
      "Requested quantity exceeds available stock",
      400,
      "INSUFFICIENT_STOCK",
      { availableStock: product.quantityInStock }
    );
  }

  item.quantity = quantity;
  item.unitPrice = product.price;
  item.name = formatProductName(product);
  item.imageUrl = product.imageUrl || "";
  cart.totalPrice = calculateTotalPrice(cart.items);

  await cart.save();

  return res.status(200).json(serializeCart(cart));
});

const removeCartItem = asyncHandler(async (req, res) => {
  const { cartId, productId } = req.params;
  const cart = await Cart.findOne({ cartId });

  if (!cart) {
    throw new AppError("Cart not found", 404, "CART_NOT_FOUND");
  }

  await claimLegacyCartIfNeeded(cart, req.user.id);
  assertCartAccess(cart, req.user.id);
  const itemExists = cart.items.some((item) => item.productId === productId);

  if (!itemExists) {
    throw new AppError("Cart item not found", 404, "CART_ITEM_NOT_FOUND");
  }

  cart.items = cart.items.filter((item) => item.productId !== productId);
  cart.totalPrice = calculateTotalPrice(cart.items);

  await cart.save();

  return res.status(200).json(serializeCart(cart));
});

module.exports = {
  getCart,
  addItemToCart,
  updateCartItemQuantity,
  removeCartItem,
};