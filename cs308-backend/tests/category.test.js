const mongoose = require("mongoose");
const Category = require("../models/Category");
const dotenv = require("dotenv");
const connectDB = require("../config/db");

dotenv.config();

beforeAll(async () => {
  await connectDB();
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Category Model Tests", () => {

  test("Database should have at least 3 categories", async () => {
    const categories = await Category.find();
    expect(categories.length).toBeGreaterThanOrEqual(3);
  });

  test("Each category should have a categoryId", async () => {
    const categories = await Category.find();
    categories.forEach(category => {
      expect(category).toHaveProperty("categoryId");
    });
  });

  test("Each category should have a name", async () => {
    const categories = await Category.find();
    categories.forEach(category => {
      expect(category.name).toBeTruthy();
    });
  });

  test("Category names should be unique", async () => {
    const categories = await Category.find();
    const names = categories.map(c => c.name);
    const uniqueNames = [...new Set(names)];
    expect(names.length).toBe(uniqueNames.length);
  });

  test("Category categoryId should be unique", async () => {
    const categories = await Category.find();
    const ids = categories.map(c => c.categoryId);
    const uniqueIds = [...new Set(ids)];
    expect(ids.length).toBe(uniqueIds.length);
  });

  test("Category should have timestamps", async () => {
    const category = await Category.findOne();
    expect(category).toHaveProperty("createdAt");
    expect(category).toHaveProperty("updatedAt");
  });

  test("Creating category without name should fail", async () => {
    const category = new Category({
      categoryId: "test-cat-999",
      description: "No name category"
    });
    await expect(category.save()).rejects.toThrow();
  });

  test("Creating category without categoryId should fail", async () => {
    const category = new Category({
      name: "No ID Category",
      description: "No id category"
    });
    await expect(category.save()).rejects.toThrow();
  });

  test("Category description should have a default value", async () => {
    const category = await Category.findOne();
    expect(category.description).toBeDefined();
  });

  test("Smartphones category should exist", async () => {
    const category = await Category.findOne({ name: "Smartphones" });
    expect(category).not.toBeNull();
  });

});
