const AppError = require("./appError");

const processPayment = async ({ amount, paymentMethod }) => {
  if (!paymentMethod || !paymentMethod.cardNumber || !paymentMethod.cardholderName) {
    throw new AppError(
      "Payment details are incomplete",
      400,
      "PAYMENT_VALIDATION_ERROR"
    );
  }

  const cardNumber = String(paymentMethod.cardNumber).replace(/\s+/g, "");

  if (!/^\d{12,19}$/.test(cardNumber)) {
    throw new AppError("Card number is invalid", 400, "PAYMENT_VALIDATION_ERROR");
  }

  if (cardNumber.endsWith("0000")) {
    throw new AppError(
      "Payment was declined by the processor",
      402,
      "PAYMENT_FAILED"
    );
  }

  return {
    success: true,
    transactionId: `txn_${Date.now()}`,
    amount,
  };
};

module.exports = {
  processPayment,
};
