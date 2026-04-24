jest.mock("../models/Invoice", () => ({
  find: jest.fn(),
  findOne: jest.fn(),
}));

jest.mock("../models/Order", () => ({
  findOne: jest.fn(),
}));

jest.mock("../utils/invoiceGenerator", () => ({
  generateInvoicePDF: jest.fn(),
}));

const Invoice = require("../models/Invoice");
const Order = require("../models/Order");
const { generateInvoicePDF } = require("../utils/invoiceGenerator");
const {
  downloadInvoice,
  getMyInvoices,
} = require("../controllers/invoiceController");

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  return res;
};

const createQuery = (data) => ({
  sort: jest.fn().mockReturnThis(),
  lean: jest.fn().mockResolvedValue(data),
});

describe("invoiceController", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("getMyInvoices returns invoices for the authenticated user", async () => {
    const invoices = [
      {
        _id: "invoice-1",
        orderId: "order-1",
        invoiceNumber: "INV-ORDER1",
        amount: 120,
        status: "emailed",
        createdAt: new Date("2026-04-20T10:00:00.000Z"),
        updatedAt: new Date("2026-04-20T10:00:00.000Z"),
      },
    ];
    const query = createQuery(invoices);
    Invoice.find.mockReturnValue(query);

    const req = { user: { id: "user-1" } };
    const res = createRes();

    await getMyInvoices(req, res);

    expect(Invoice.find).toHaveBeenCalledWith({ userId: "user-1" });
    expect(query.sort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      invoices: [
        {
          id: "invoice-1",
          orderId: "order-1",
          invoiceNumber: "INV-ORDER1",
          amount: 120,
          status: "emailed",
          createdAt: invoices[0].createdAt,
          updatedAt: invoices[0].updatedAt,
        },
      ],
    });
  });

  test("downloadInvoice regenerates a PDF for the invoice owner", async () => {
    const invoice = {
      _id: "invoice-1",
      orderId: "order-1",
      userId: "user-1",
      invoiceNumber: "INV-ORDER1",
      amount: 120,
      status: "emailed",
    };
    const order = {
      _id: "order-1",
      userId: "user-1",
      items: [{ productId: "prod-1", name: "Phone", unitPrice: 120, quantity: 1 }],
      totalPrice: 120,
      status: "paid",
    };
    const pdfBuffer = Buffer.from("pdf");

    Invoice.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(invoice) });
    Order.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(order) });
    generateInvoicePDF.mockResolvedValue(pdfBuffer);

    const req = {
      params: { invoiceId: "invoice-1" },
      user: { id: "user-1", name: "Test User", email: "test@example.com" },
    };
    const res = createRes();

    await downloadInvoice(req, res);

    expect(Invoice.findOne).toHaveBeenCalledWith({
      _id: "invoice-1",
      userId: "user-1",
    });
    expect(Order.findOne).toHaveBeenCalledWith({
      _id: "order-1",
      userId: "user-1",
      status: "paid",
    });
    expect(generateInvoicePDF).toHaveBeenCalledWith(order, req.user);
    expect(res.setHeader).toHaveBeenCalledWith("Content-Type", "application/pdf");
    expect(res.setHeader).toHaveBeenCalledWith(
      "Content-Disposition",
      'attachment; filename="INV-ORDER1.pdf"'
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(pdfBuffer);
  });

  test("downloadInvoice returns 404 when the invoice is not owned by the user", async () => {
    Invoice.findOne.mockReturnValue({ lean: jest.fn().mockResolvedValue(null) });

    const req = {
      params: { invoiceId: "invoice-1" },
      user: { id: "user-1" },
    };
    const res = createRes();

    await downloadInvoice(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Invoice not found" });
    expect(generateInvoicePDF).not.toHaveBeenCalled();
  });
});
