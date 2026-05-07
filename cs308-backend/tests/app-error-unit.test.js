const AppError = require("../utils/appError");

describe("AppError", () => {
  test("uses default error metadata when only a message is provided", () => {
    const error = new AppError("Something failed");

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("AppError");
    expect(error.message).toBe("Something failed");
    expect(error.statusCode).toBe(500);
    expect(error.code).toBe("INTERNAL_SERVER_ERROR");
    expect(error.details).toBeUndefined();
    expect(error.isOperational).toBe(true);
  });

  test("stores custom status, code, and details", () => {
    const details = { field: "email" };
    const error = new AppError("Invalid input", 400, "VALIDATION_ERROR", details);

    expect(error.statusCode).toBe(400);
    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.details).toBe(details);
    expect(error.isOperational).toBe(true);
  });
});
