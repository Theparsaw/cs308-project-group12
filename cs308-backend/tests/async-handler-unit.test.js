const asyncHandler = require("../utils/asyncHandler");

describe("asyncHandler", () => {
  test("passes req, res, and next to the wrapped handler", async () => {
    const req = { id: "req-1" };
    const res = { statusCode: 200 };
    const next = jest.fn();
    const handler = jest.fn().mockResolvedValue("done");

    await asyncHandler(handler)(req, res, next);

    expect(handler).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });

  test("forwards rejected errors to next", async () => {
    const error = new Error("boom");
    const next = jest.fn();
    const handler = jest.fn().mockRejectedValue(error);

    await asyncHandler(handler)({}, {}, next);

    expect(next).toHaveBeenCalledWith(error);
  });

});
