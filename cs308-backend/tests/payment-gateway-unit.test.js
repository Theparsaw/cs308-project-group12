const { processPayment } = require("../utils/paymentGateway");

describe("paymentGateway processPayment", () => {
  test("returns a successful transaction for valid payment details", async () => {
    const result = await processPayment({
      amount: 149.99,
      paymentMethod: {
        cardNumber: "4111 1111 1111 1111",
        cardholderName: "Test User",
      },
    });

    expect(result).toMatchObject({
      success: true,
      amount: 149.99,
    });
    expect(result.transactionId).toMatch(/^txn_\d+$/);
  });

  test("rejects missing payment details", async () => {
    await expect(processPayment({ amount: 10, paymentMethod: null })).rejects.toMatchObject({
      message: "Payment details are incomplete",
      statusCode: 400,
      code: "PAYMENT_VALIDATION_ERROR",
    });
  });

  test("rejects card numbers outside the supported length", async () => {
    await expect(
      processPayment({
        amount: 10,
        paymentMethod: {
          cardNumber: "1234",
          cardholderName: "Test User",
        },
      })
    ).rejects.toMatchObject({
      message: "Card number is invalid",
      statusCode: 400,
      code: "PAYMENT_VALIDATION_ERROR",
    });
  });

  test("declines card numbers ending in 0000", async () => {
    await expect(
      processPayment({
        amount: 10,
        paymentMethod: {
          cardNumber: "4111111111110000",
          cardholderName: "Test User",
        },
      })
    ).rejects.toMatchObject({
      message: "Payment was declined by the processor",
      statusCode: 402,
      code: "PAYMENT_FAILED",
    });
  });
});
