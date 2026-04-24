const mongoose = require("mongoose");
const Product = require("../models/Product");
const connectDB = require("../config/db");
const dotenv = require("dotenv");

dotenv.config();

const testProductId = `model-test-${Date.now()}`;
const testSerialNumber = `SN-model-test-${Date.now()}`;

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await Product.deleteMany({ productId: { $regex: "^model-test-" } });
  await mongoose.connection.close();
});

describe("Product Model Validation", () => {
  test("Creates a valid product successfully", async () => {
    const product = await Product.create({
      productId: testProductId,
      categoryId: "electronics",
      name: "Test Product",
      model: "Model X",
      serialNumber: testSerialNumber,
      description: "A test product description",
      quantityInStock: 10,
      price: 99.99,
      warrantyStatus: "1 year",
      distributorInfo: "Test Distributor",
    });
    expect(product.productId).toBe(testProductId);
    expect(product.price).toBe(99.99);
    await Product.deleteOne({ productId: testProductId });
  });

  test("Fails without required productId", async () => {
    const product = new Product({
      categoryId: "electronics",
      name: "Test",
      model: "X",
      serialNumber: `SN-no-id-${Date.now()}`,
      description: "desc",
      quantityInStock: 1,
      price: 10,
      warrantyStatus: "none",
      distributorInfo: "none",
    });
    await expect(product.save()).rejects.toThrow();
  });

  test("Fails without required name", async () => {
    const product = new Product({
      productId: `no-name-${Date.now()}`,
      categoryId: "electronics",
      model: "X",
      serialNumber: `SN-no-name-${Date.now()}`,
      description: "desc",
      quantityInStock: 1,
      price: 10,
      warrantyStatus: "none",
      distributorInfo: "none",
    });
    await expect(product.save()).rejects.toThrow();
  });

  test("Fails with negative price", async () => {
    const product = new Product({
      productId: `neg-price-${Date.now()}`,
      categoryId: "electronics",
      name: "Bad Price Product",
      model: "X",
      serialNumber: `SN-neg-${Date.now()}`,
      description: "desc",
      quantityInStock: 1,
      price: -5,
      warrantyStatus: "none",
      distributorInfo: "none",
    });
    await expect(product.save()).rejects.toThrow();
  });

  test("Fails with negative quantityInStock", async () => {
    const product = new Product({
      productId: `neg-qty-${Date.now()}`,
      categoryId: "electronics",
      name: "Bad Qty Product",
      model: "X",
      serialNumber: `SN-qty-${Date.now()}`,
      description: "desc",
      quantityInStock: -1,
      price: 10,
      warrantyStatus: "none",
      distributorInfo: "none",
    });
    await expect(product.save()).rejects.toThrow();
  });

  test("Fails with duplicate productId", async () => {
    const base = {
      categoryId: "electronics",
      name: "Dup Test",
      model: "X",
      description: "desc",
      quantityInStock: 1,
      price: 10,
      warrantyStatus: "none",
      distributorInfo: "none",
    };
    const dupId = `dup-id-${Date.now()}`;
    await Product.create({ ...base, productId: dupId, serialNumber: `SN-dup-1-${Date.now()}` });
    const dup = new Product({ ...base, productId: dupId, serialNumber: `SN-dup-2-${Date.now()}` });
    await expect(dup.save()).rejects.toThrow();
    await Product.deleteOne({ productId: dupId });
  });

  test("Fails with duplicate serialNumber", async () => {
    const base = {
      categoryId: "electronics",
      name: "Dup Serial Test",
      model: "X",
      description: "desc",
      quantityInStock: 1,
      price: 10,
      warrantyStatus: "none",
      distributorInfo: "none",
    };
    const dupSerial = `SN-dup-serial-${Date.now()}`;
    await Product.create({ ...base, productId: `dup-serial-1-${Date.now()}`, serialNumber: dupSerial });
    const dup = new Product({ ...base, productId: `dup-serial-2-${Date.now()}`, serialNumber: dupSerial });
    await expect(dup.save()).rejects.toThrow();
    await Product.deleteMany({ serialNumber: dupSerial });
  });

  test("Has timestamps after creation", async () => {
    const pid = `ts-test-${Date.now()}`;
    const product = await Product.create({
      productId: pid,
      categoryId: "electronics",
      name: "Timestamp Test",
      model: "X",
      serialNumber: `SN-ts-${Date.now()}`,
      description: "desc",
      quantityInStock: 1,
      price: 10,
      warrantyStatus: "none",
      distributorInfo: "none",
    });
    expect(product.createdAt).toBeDefined();
    expect(product.updatedAt).toBeDefined();
    await Product.deleteOne({ productId: pid });
  });
});