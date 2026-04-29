jest.mock("../models/Delivery", () => ({
  findOne: jest.fn(),
}));

jest.mock("../models/Order", () => ({
  findOne: jest.fn(),
}));

jest.mock("../models/ReturnRequest", () => ({
  create: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
}));

const Delivery = require("../models/Delivery");
const Order = require("../models/Order");
const ReturnRequest = require("../models/ReturnRequest");
const {
  createReturnRequest,
  getMyReturnRequests,
} = require("../controllers/returnRequestController");

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const createQuery = (data) => ({
  sort: jest.fn().mockReturnThis(),
  lean: jest.fn().mockResolvedValue(data),
});

const buildOrder = (overrides = {}) => ({
  _id: "order-1",
  userId: "user-1",
  status: "paid",
  items: [
    { productId: "p001", name: "Keyboard", unitPrice: 80, quantity: 1 },
    { productId: "p002", name: "Mouse", unitPrice: 40, quantity: 2 },
  ],
  ...overrides,
});

describe("returnRequestController", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("getMyReturnRequests returns requests for the authenticated customer", async () => {
    const requests = [
      {
        _id: "return-1",
        orderId: "order-1",
        items: [{ productId: "p001", name: "Keyboard", unitPrice: 80, quantity: 1 }],
        reason: "Damaged",
        refundAmount: 80,
        status: "pending",
        resolvedAt: null,
        createdAt: new Date("2026-04-20T10:00:00.000Z"),
        updatedAt: new Date("2026-04-20T10:00:00.000Z"),
      },
    ];
    const query = createQuery(requests);
    ReturnRequest.find.mockReturnValue(query);

    const req = { user: { id: "user-1" } };
    const res = createRes();

    await getMyReturnRequests(req, res);

    expect(ReturnRequest.find).toHaveBeenCalledWith({ userId: "user-1" });
    expect(query.sort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      returnRequests: [
        {
          id: "return-1",
          orderId: "order-1",
          items: requests[0].items,
          reason: "Damaged",
          refundAmount: 80,
          status: "pending",
          resolvedAt: null,
          createdAt: requests[0].createdAt,
          updatedAt: requests[0].updatedAt,
        },
      ],
    });
  });

  test("createReturnRequest creates a request for a delivered paid order", async () => {
    const order = buildOrder();
    const createdRequest = {
      _id: "return-1",
      orderId: "order-1",
      items: [order.items[1]],
      reason: "Wrong product",
      refundAmount: 80,
      status: "pending",
      resolvedAt: null,
      createdAt: new Date("2026-04-20T10:00:00.000Z"),
      updatedAt: new Date("2026-04-20T10:00:00.000Z"),
    };

    Order.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(order) });
    Delivery.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue({ status: "delivered" }) });
    ReturnRequest.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
    ReturnRequest.create.mockResolvedValue(createdRequest);

    const req = {
      user: { id: "user-1" },
      body: {
        orderId: "order-1",
        items: [{ productId: "p002", quantity: 1 }],
        reason: " Wrong product ",
      },
    };
    const res = createRes();

    await createReturnRequest(req, res);

    expect(Order.findOne).toHaveBeenCalledWith({
      _id: "order-1",
      userId: "user-1",
      status: "paid",
    });
    expect(Delivery.findOne).toHaveBeenCalledWith({ orderId: "order-1" });
    expect(ReturnRequest.create).toHaveBeenCalledWith({
      userId: "user-1",
      orderId: "order-1",
      items: [{ ...order.items[1], quantity: 1 }],
      reason: "Wrong product",
      refundAmount: 40,
    });
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("createReturnRequest allows a partial quantity return", async () => {
    const order = buildOrder();

    Order.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(order) });
    Delivery.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue({ status: "delivered" }) });
    ReturnRequest.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });
    ReturnRequest.create.mockResolvedValue({
      _id: "return-1",
      orderId: "order-1",
      items: [{ ...order.items[1], quantity: 1 }],
      reason: "Only one item was defective",
      refundAmount: 40,
      status: "pending",
      resolvedAt: null,
    });

    const req = {
      user: { id: "user-1" },
      body: {
        orderId: "order-1",
        items: [{ productId: "p002", quantity: 1 }],
        reason: "Only one item was defective",
      },
    };
    const res = createRes();

    await createReturnRequest(req, res);

    expect(ReturnRequest.create).toHaveBeenCalledWith(
      expect.objectContaining({
        items: [{ ...order.items[1], quantity: 1 }],
        refundAmount: 40,
      })
    );
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test("createReturnRequest rejects quantities greater than ordered", async () => {
    Order.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(buildOrder()) });
    Delivery.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue({ status: "delivered" }) });

    const req = {
      user: { id: "user-1" },
      body: {
        orderId: "order-1",
        items: [{ productId: "p002", quantity: 3 }],
        reason: "Too many",
      },
    };
    const res = createRes();

    await createReturnRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Return quantity cannot exceed the ordered quantity",
    });
    expect(ReturnRequest.create).not.toHaveBeenCalled();
  });

  test("createReturnRequest rejects non-delivered orders", async () => {
    Order.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(buildOrder()) });
    Delivery.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue({ status: "processing" }) });

    const req = {
      user: { id: "user-1" },
      body: { orderId: "order-1", itemProductIds: ["p001"], reason: "Damaged" },
    };
    const res = createRes();

    await createReturnRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Returns can only be requested after delivery",
    });
    expect(ReturnRequest.create).not.toHaveBeenCalled();
  });

  test("createReturnRequest rejects duplicate requests for an order", async () => {
    Order.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(buildOrder()) });
    Delivery.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue({ status: "delivered" }) });
    ReturnRequest.findOne.mockReturnValue({
      lean: jest.fn().mockResolvedValue({ _id: "return-1" }),
    });

    const req = {
      user: { id: "user-1" },
      body: { orderId: "order-1", itemProductIds: ["p001"], reason: "Damaged" },
    };
    const res = createRes();

    await createReturnRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      message: "A return request already exists for this order",
    });
    expect(ReturnRequest.create).not.toHaveBeenCalled();
  });

  test("createReturnRequest rejects items that are not in the order", async () => {
    Order.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(buildOrder()) });
    Delivery.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue({ status: "delivered" }) });

    const req = {
      user: { id: "user-1" },
      body: { orderId: "order-1", itemProductIds: ["p999"], reason: "Damaged" },
    };
    const res = createRes();

    await createReturnRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Selected return items are not part of this order",
    });
    expect(ReturnRequest.create).not.toHaveBeenCalled();
  });
});
