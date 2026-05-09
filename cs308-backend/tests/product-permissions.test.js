const express = require("express");
const request = require("supertest");
const { errorHandler } = require("../middleware/errorMiddleware");

jest.mock("../controllers/productController", () => ({
  createProduct: (req, res) =>
    res.status(201).json({
      message: "Product created successfully",
      product: req.body,
    }),
  getAllProducts: (_req, res) => res.status(200).json([]),
  getProductById: (req, res) => res.status(200).json({ productId: req.params.id }),
  updateProduct: (req, res) =>
    res.status(200).json({
      message: "Product updated successfully",
      product: req.body,
    }),
  deleteProduct: (_req, res) =>
    res.status(200).json({
      message: "Product deleted successfully",
    }),
}));

jest.mock("../middleware/authMiddleware", () => {
  const AppError = require("../utils/appError");

  return {
    authMiddleware: (req, _res, next) => {
      const role = req.headers["x-test-role"];

      if (!role) {
        return next(new AppError("Authentication token is required", 401, "AUTH_REQUIRED"));
      }

      req.user = { id: "test-user", role };
      return next();
    },
    authorize: (...roles) => (req, _res, next) => {
      if (!req.user) {
        return next(new AppError("Authentication required", 401, "AUTH_REQUIRED"));
      }

      if (!roles.includes(req.user.role)) {
        return next(new AppError("You are not allowed to access this resource", 403, "FORBIDDEN"));
      }

      return next();
    },
  };
});

const productRoutes = require("../routes/productRoutes");

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use("/api/products", productRoutes);
  app.use(errorHandler);
  return app;
};

describe("Product route permissions", () => {
  const app = buildApp();

  test("GET /api/products remains public", async () => {
    const res = await request(app).get("/api/products");

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual([]);
  });

  test("POST /api/products still requires authentication", async () => {
    const res = await request(app).post("/api/products").send({
      productId: "prod-auth-check",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.code).toBe("AUTH_REQUIRED");
  });

  test("POST /api/products allows product managers to create products", async () => {
    const res = await request(app)
      .post("/api/products")
      .set("x-test-role", "product_manager")
      .send({
        productId: "prod-create-check",
        categoryId: "cat-1",
        name: "Allowed Product",
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.product.productId).toBe("prod-create-check");
  });

  test("POST /api/products forbids sales managers from creating products", async () => {
    const res = await request(app)
      .post("/api/products")
      .set("x-test-role", "sales_manager")
      .send({
        productId: "prod-create-blocked",
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.code).toBe("FORBIDDEN");
  });

  test("PUT /api/products/:id allows product managers to update stock", async () => {
    const res = await request(app)
      .put("/api/products/prod-stock-check")
      .set("x-test-role", "product_manager")
      .send({
        quantityInStock: 42,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.product.quantityInStock).toBe(42);
  });

  test("PUT /api/products/:id forbids sales managers from updating stock", async () => {
    const res = await request(app)
      .put("/api/products/prod-stock-check")
      .set("x-test-role", "sales_manager")
      .send({
        quantityInStock: 42,
      });

    expect(res.statusCode).toBe(403);
    expect(res.body.code).toBe("FORBIDDEN");
  });

  test("DELETE /api/products/:id allows product managers to delete products", async () => {
    const res = await request(app)
      .delete("/api/products/prod-delete-check")
      .set("x-test-role", "product_manager");

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Product deleted successfully");
  });

  test("DELETE /api/products/:id forbids sales managers from deleting products", async () => {
    const res = await request(app)
      .delete("/api/products/prod-delete-check")
      .set("x-test-role", "sales_manager");

    expect(res.statusCode).toBe(403);
    expect(res.body.code).toBe("FORBIDDEN");
  });
});
