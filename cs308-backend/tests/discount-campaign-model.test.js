const mongoose = require("mongoose");
const DiscountCampaign = require("../models/DiscountCampaign");
const connectDB = require("../config/db");
const dotenv = require("dotenv");

dotenv.config();

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await DiscountCampaign.deleteMany({ name: { $regex: "^Test Campaign" } });
  await mongoose.connection.close();
});

const validCampaign = () => ({
  name: `Test Campaign ${Date.now()}`,
  productIds: ["p001", "p002"],
  discountPercentage: 20,
  startDate: new Date("2099-01-01"),
  endDate: new Date("2099-12-31"),
});

let createdCampaign;

describe("DiscountCampaign Model Validation", () => {
  test("Creates a valid discount campaign successfully", async () => {
    createdCampaign = await DiscountCampaign.create(validCampaign());
    expect(createdCampaign.isActive).toBe(true);
    expect(createdCampaign.discountPercentage).toBe(20);
    expect(createdCampaign.productIds).toHaveLength(2);
  });

  test("Fails without name", async () => {
    const c = new DiscountCampaign({ ...validCampaign(), name: undefined });
    await expect(c.save()).rejects.toThrow();
  });

  test("Fails with empty productIds array", async () => {
    const c = new DiscountCampaign({ ...validCampaign(), productIds: [] });
    await expect(c.save()).rejects.toThrow();
  });

  test("Fails without discountPercentage", async () => {
    const c = new DiscountCampaign({ ...validCampaign(), discountPercentage: undefined });
    await expect(c.save()).rejects.toThrow();
  });

  test("Fails with discountPercentage below 1", async () => {
    const c = new DiscountCampaign({ ...validCampaign(), discountPercentage: 0 });
    await expect(c.save()).rejects.toThrow();
  });

  test("Fails with discountPercentage above 100", async () => {
    const c = new DiscountCampaign({ ...validCampaign(), discountPercentage: 101 });
    await expect(c.save()).rejects.toThrow();
  });

  test("Fails when endDate is before startDate", async () => {
    const c = new DiscountCampaign({
      ...validCampaign(),
      startDate: new Date("2099-12-31"),
      endDate: new Date("2099-01-01"),
    });
    await expect(c.save()).rejects.toThrow();
  });

  test("Fails without startDate", async () => {
    const c = new DiscountCampaign({ ...validCampaign(), startDate: undefined });
    await expect(c.save()).rejects.toThrow();
  });

  test("Fails without endDate", async () => {
    const c = new DiscountCampaign({ ...validCampaign(), endDate: undefined });
    await expect(c.save()).rejects.toThrow();
  });

  test("Default isActive is true", async () => {
    expect(createdCampaign.isActive).toBe(true);
  });

  test("Has timestamps after creation", async () => {
    expect(createdCampaign.createdAt).toBeDefined();
    expect(createdCampaign.updatedAt).toBeDefined();
  });
});