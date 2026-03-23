const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");
const Cart = require("../models/Cart");

const createCartId = (suffix) => `test-cart-${suffix}-${Date.now()}`;

afterAll(async () => {
  await Cart.deleteMany({ cartId: { $regex: "^test-cart-" } });
  await mongoose.connection.close();
});

describe("Cart API Endpoints", () => {
  test("GET /api/cart/:cartId returns an empty cart when no cart exists", async () => {
    const cartId = createCartId("empty");
    const res = await request(app).get(`/api/cart/${cartId}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      cartId,
      items: [],
      totalPrice: 0,
      totalItems: 0,
    });
  });

  test("POST /api/cart/:cartId/items adds an item and calculates total price", async () => {
    const cartId = createCartId("add");
    const res = await request(app)
      .post(`/api/cart/${cartId}/items`)
      .send({ productId: "p001", quantity: 2 });

    expect(res.statusCode).toBe(200);
    expect(res.body.cartId).toBe(cartId);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0]).toMatchObject({
      productId: "p001",
      name: "Apple iPhone 15 Pro",
      unitPrice: 1299,
      quantity: 2,
    });
    expect(res.body.totalItems).toBe(2);
    expect(res.body.totalPrice).toBe(2598);
  });

  test("POST /api/cart/:cartId/items merges duplicate products and keeps total accurate", async () => {
    const cartId = createCartId("merge");

    await request(app)
      .post(`/api/cart/${cartId}/items`)
      .send({ productId: "p001", quantity: 2 });

    const res = await request(app)
      .post(`/api/cart/${cartId}/items`)
      .send({ productId: "p001", quantity: 3 });

    expect(res.statusCode).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].quantity).toBe(5);
    expect(res.body.totalItems).toBe(5);
    expect(res.body.totalPrice).toBe(6495);
  });

  test("PATCH /api/cart/:cartId/items/:productId updates quantity", async () => {
    const cartId = createCartId("update");

    await request(app)
      .post(`/api/cart/${cartId}/items`)
      .send({ productId: "p001", quantity: 2 });

    await request(app)
      .post(`/api/cart/${cartId}/items`)
      .send({ productId: "p002", quantity: 1 });

    const res = await request(app)
      .patch(`/api/cart/${cartId}/items/p001`)
      .send({ quantity: 4 });

    expect(res.statusCode).toBe(200);
    expect(res.body.totalItems).toBe(5);
    expect(res.body.totalPrice).toBe(6395);
    expect(res.body.items.find((item) => item.productId === "p001").quantity).toBe(
      4
    );
  });

  test("DELETE /api/cart/:cartId/items/:productId removes an item", async () => {
    const cartId = createCartId("remove");

    await request(app)
      .post(`/api/cart/${cartId}/items`)
      .send({ productId: "p001", quantity: 2 });

    await request(app)
      .post(`/api/cart/${cartId}/items`)
      .send({ productId: "p002", quantity: 1 });

    const res = await request(app).delete(`/api/cart/${cartId}/items/p002`);

    expect(res.statusCode).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].productId).toBe("p001");
    expect(res.body.totalItems).toBe(2);
    expect(res.body.totalPrice).toBe(2598);
  });

  test("POST /api/cart/:cartId/items rejects quantities above available stock", async () => {
    const cartId = createCartId("stock-limit");
    const res = await request(app)
      .post(`/api/cart/${cartId}/items`)
      .send({ productId: "p001", quantity: 13 });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe("Requested quantity exceeds available stock");
    expect(res.body.availableStock).toBe(12);
  });
});
