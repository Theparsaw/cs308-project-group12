const request = require("supertest");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const app = require("../server");
const Category = require("../models/Category");
const User = require("../models/User");

const uniqueSuffix = Date.now();
const productManagerEmail = `category-manager-${uniqueSuffix}@example.com`;
const salesManagerEmail = `category-sales-${uniqueSuffix}@example.com`;
const testCategoryId = `test-category-${uniqueSuffix}`;

const login = async (email) => {
  const res = await request(app).post("/api/auth/login").send({
    email,
    password: "ManagerPass123!",
  });

  return res.body.token;
};

beforeAll(async () => {
  const password = await bcrypt.hash("ManagerPass123!", 10);

  await User.create([
    {
      name: "Category Product Manager",
      email: productManagerEmail,
      password,
      role: "product_manager",
    },
    {
      name: "Category Sales Manager",
      email: salesManagerEmail,
      password,
      role: "sales_manager",
    },
  ]);
});

afterAll(async () => {
  await Category.deleteMany({ categoryId: testCategoryId });
  await User.deleteMany({ email: { $in: [productManagerEmail, salesManagerEmail] } });
  await mongoose.connection.close();
});

describe("Category API Endpoints", () => {
  test("GET /api/categories returns categories", async () => {
    const res = await request(app).get("/api/categories");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.categories)).toBe(true);
  });

  test("POST /api/categories requires authentication", async () => {
    const res = await request(app).post("/api/categories").send({
      categoryId: testCategoryId,
      name: "Unauthorized Category",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.code).toBe("AUTH_REQUIRED");
  });

  test("POST /api/categories rejects sales managers", async () => {
    const token = await login(salesManagerEmail);

    const res = await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({
        categoryId: testCategoryId,
        name: "Sales Manager Category",
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.code).toBe("FORBIDDEN");
  });

  test("Product managers can create, update, and delete a category", async () => {
    const token = await login(productManagerEmail);

    const createRes = await request(app)
      .post("/api/categories")
      .set("Authorization", `Bearer ${token}`)
      .send({
        categoryId: testCategoryId,
        name: "Test Category",
        description: "Created by route test",
      });

    expect(createRes.statusCode).toBe(201);
    expect(createRes.body.category.categoryId).toBe(testCategoryId);

    const updateRes = await request(app)
      .put(`/api/categories/${testCategoryId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Updated Test Category",
        description: "Updated by route test",
      });

    expect(updateRes.statusCode).toBe(200);
    expect(updateRes.body.category.name).toBe("Updated Test Category");

    const deleteRes = await request(app)
      .delete(`/api/categories/${testCategoryId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(deleteRes.statusCode).toBe(200);

    const category = await Category.findOne({ categoryId: testCategoryId });
    expect(category).toBeNull();
  });
});
