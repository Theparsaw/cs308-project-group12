const mongoose = require("mongoose");
const Wishlist = require("../models/Wishlist");

describe("Wishlist model", () => {
  test("validate trims product ids without requiring next callback middleware", async () => {
    const wishlist = new Wishlist({
      userId: new mongoose.Types.ObjectId(),
      items: [{ productId: "  p039  " }],
    });

    await expect(wishlist.validate()).resolves.toBeUndefined();
    expect(wishlist.items[0].productId).toBe("p039");
  });

  test("validate rejects duplicate product ids", async () => {
    const wishlist = new Wishlist({
      userId: new mongoose.Types.ObjectId(),
      items: [{ productId: "p039" }, { productId: " p039 " }],
    });

    await expect(wishlist.validate()).rejects.toThrow(
      "Wishlist cannot contain duplicate products"
    );
  });
});
