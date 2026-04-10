const Payment = require("../models/Payment");
const Order = require("../models/Order");
const Product = require("../models/Product");
const Cart = require("../models/Cart");

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;

const sanitizeCardNumber = (cardNumber = "") => cardNumber.replace(/\s+/g, "");

const isValidCardNumber = (cardNumber) => /^\d{16}$/.test(cardNumber);
const isValidCvv = (cvv) => /^\d{3,4}$/.test(cvv);

const isValidExpiry = (expiryMonth, expiryYear) => {
  const month = Number(expiryMonth);
  const year = Number(expiryYear);

  if (!Number.isInteger(month) || month < 1 || month > 12) return false;
  if (!Number.isInteger(year) || year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;

  return true;
};

const simulatePaymentResult = (cardNumber) => {
  const lastDigit = Number(cardNumber[cardNumber.length - 1]);
  return lastDigit % 2 === 0;
};

const serializeOrder = (order) => ({
  id: order._id,
  userId: order.userId,
  cartId: order.cartId,
  items: order.items,
  totalPrice: order.totalPrice,
  status: order.status,
  createdAt: order.createdAt,
  updatedAt: order.updatedAt,
});

const validateOrderStock = async (items) => {
  for (const item of items) {
    const product = await Product.findOne({ productId: item.productId });

    if (!product) {
      return {
        valid: false,
        message: `Product not found: ${item.productId}`,
      };
    }

    if (product.quantityInStock < item.quantity) {
      return {
        valid: false,
        message: `Not enough stock for ${item.name}`,
        productId: item.productId,
        availableStock: product.quantityInStock,
      };
    }
  }

  return { valid: true };
};

const getOrderForPayment = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.userId !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    const stockCheck = await validateOrderStock(order.items);

    if (!stockCheck.valid) {
      return res.status(400).json(stockCheck);
    }

    return res.status(200).json({
      order: serializeOrder(order),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch order",
      error: error.message,
    });
  }
};

const processPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { cardHolder, cardNumber, expiryMonth, expiryYear, cvv } = req.body;

    if (!cardHolder || !cardNumber || !expiryMonth || !expiryYear || !cvv) {
      return res.status(400).json({
        message: "All payment fields are required",
      });
    }

    const cleanedCardNumber = sanitizeCardNumber(cardNumber);

    if (!isValidCardNumber(cleanedCardNumber)) {
      return res.status(400).json({
        message: "Card number must be 16 digits",
      });
    }

    if (!isValidExpiry(expiryMonth, expiryYear)) {
      return res.status(400).json({
        message: "Card expiry date is invalid or expired",
      });
    }

    if (!isValidCvv(cvv)) {
      return res.status(400).json({
        message: "CVV must be 3 or 4 digits",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    if (order.userId !== req.user.id) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    if (order.status === "paid") {
      return res.status(400).json({
        message: "Order has already been paid",
      });
    }

    const stockCheck = await validateOrderStock(order.items);

    if (!stockCheck.valid) {
      order.status = "payment_failed";
      await order.save();

      return res.status(400).json(stockCheck);
    }

    const success = simulatePaymentResult(cleanedCardNumber);

    const payment = await Payment.create({
      orderId: order._id.toString(),
      userId: req.user.id,
      amount: order.totalPrice,
      status: success ? "success" : "failed",
      cardLast4: cleanedCardNumber.slice(-4),
      transactionId: `TXN-${Date.now()}`,
      message: success ? "Payment completed successfully" : "Payment was declined",
    });

    if (success) {
      for (const item of order.items) {
        await Product.updateOne(
          { productId: item.productId },
          { $inc: { quantityInStock: -item.quantity } }
        );
      }

      order.status = "paid";
      await order.save();

      const cart = await Cart.findOne({ cartId: order.cartId });
      if (cart) {
        cart.items = [];
        cart.totalPrice = 0;
        await cart.save();
      }

      return res.status(200).json({
        success: true,
        message: "Payment completed successfully",
        paymentStatus: payment.status,
        payment: {
          id: payment._id,
          orderId: payment.orderId,
          amount: payment.amount,
          status: payment.status,
          cardLast4: payment.cardLast4,
          transactionId: payment.transactionId,
          createdAt: payment.createdAt,
        },
        order: serializeOrder(order),
      });
    }

    order.status = "payment_failed";
    await order.save();

    return res.status(200).json({
      success: false,
      message: "Payment was declined",
      paymentStatus: payment.status,
      payment: {
        id: payment._id,
        orderId: payment.orderId,
        amount: payment.amount,
        status: payment.status,
        cardLast4: payment.cardLast4,
        transactionId: payment.transactionId,
        createdAt: payment.createdAt,
      },
      order: serializeOrder(order),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to process payment",
      error: error.message,
    });
  }
};

module.exports = {
  getOrderForPayment,
  processPayment,
};
