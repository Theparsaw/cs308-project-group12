const Cart = require("../models/Cart");
const Product = require("../models/Product");

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

const findOrCreateCart = async (cartId) => {
  let cart = await Cart.findOne({ cartId });

  if (!cart) {
    cart = await Cart.create({ cartId, items: [], totalPrice: 0 });
  }

  return cart;
};

const getCart = async (req, res) => {
  try {
    const { cartId } = req.params;
    const cart = await Cart.findOne({ cartId });

    if (!cart) {
      return res.status(200).json(getEmptyCartPayload(cartId));
    }

    return res.status(200).json(serializeCart(cart));
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch cart",
      error: error.message,
    });
  }
};

const addItemToCart = async (req, res) => {
  try {
    const { cartId } = req.params;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({
        message: "productId is required",
      });
    }

    if (!isValidQuantity(quantity)) {
      return res.status(400).json({
        message: "Quantity must be an integer greater than 0",
      });
    }

    const product = await Product.findOne({ productId });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const cart = await findOrCreateCart(cartId);
    const existingItem = cart.items.find((item) => item.productId === productId);
    const nextQuantity = (existingItem?.quantity || 0) + quantity;

    if (nextQuantity > product.quantityInStock) {
      return res.status(400).json({
        message: "Requested quantity exceeds available stock",
        availableStock: product.quantityInStock,
      });
    }

    if (existingItem) {
      existingItem.quantity = nextQuantity;
      existingItem.unitPrice = product.price;
      existingItem.name = formatProductName(product);
    } else {
      cart.items.push({
        productId: product.productId,
        name: formatProductName(product),
        unitPrice: product.price,
        quantity,
      });
    }

    cart.totalPrice = calculateTotalPrice(cart.items);
    await cart.save();

    return res.status(200).json(serializeCart(cart));
  } catch (error) {
    return res.status(500).json({
      message: "Failed to add item to cart",
      error: error.message,
    });
  }
};

const updateCartItemQuantity = async (req, res) => {
  try {
    const { cartId, productId } = req.params;
    const { quantity } = req.body;

    if (!isValidQuantity(quantity)) {
      return res.status(400).json({
        message: "Quantity must be an integer greater than 0",
      });
    }

    const cart = await Cart.findOne({ cartId });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    const item = cart.items.find((cartItem) => cartItem.productId === productId);

    if (!item) {
      return res.status(404).json({
        message: "Cart item not found",
      });
    }

    const product = await Product.findOne({ productId });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    if (quantity > product.quantityInStock) {
      return res.status(400).json({
        message: "Requested quantity exceeds available stock",
        availableStock: product.quantityInStock,
      });
    }

    item.quantity = quantity;
    item.unitPrice = product.price;
    item.name = formatProductName(product);
    cart.totalPrice = calculateTotalPrice(cart.items);

    await cart.save();

    return res.status(200).json(serializeCart(cart));
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update cart item quantity",
      error: error.message,
    });
  }
};

const removeCartItem = async (req, res) => {
  try {
    const { cartId, productId } = req.params;
    const cart = await Cart.findOne({ cartId });

    if (!cart) {
      return res.status(404).json({
        message: "Cart not found",
      });
    }

    const itemExists = cart.items.some((item) => item.productId === productId);

    if (!itemExists) {
      return res.status(404).json({
        message: "Cart item not found",
      });
    }

    cart.items = cart.items.filter((item) => item.productId !== productId);
    cart.totalPrice = calculateTotalPrice(cart.items);

    await cart.save();

    return res.status(200).json(serializeCart(cart));
  } catch (error) {
    return res.status(500).json({
      message: "Failed to remove item from cart",
      error: error.message,
    });
  }
};

module.exports = {
  getCart,
  addItemToCart,
  updateCartItemQuantity,
  removeCartItem,
};
