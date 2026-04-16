const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");
const User = require("../models/User");

const createEmail = (label) => `auth-${label}-${Date.now()}@example.com`;
const createdEmails = [];

afterAll(async () => {
  await User.deleteMany({ email: { $in: createdEmails } });
  await mongoose.connection.close();
});

describe("Authentication API", () => {

  // Register
  test("POST /api/auth/register creates a new user and returns token", async () => {
    const email = createEmail("register");
    createdEmails.push(email);

    const res = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email,
      password: "password123",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user.email).toBe(email);
    expect(res.body.user.name).toBe("Test User");
    expect(res.body.user.role).toBe("customer");
  });

  test("POST /api/auth/register fails with missing name", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: createEmail("no-name"),
      password: "password123",
    });

    expect(res.statusCode).toBe(400);
  });

  test("POST /api/auth/register fails with missing email", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User",
      password: "password123",
    });

    expect(res.statusCode).toBe(400);
  });

  test("POST /api/auth/register fails with missing password", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: createEmail("no-password"),
    });

    expect(res.statusCode).toBe(400);
  });

  test("POST /api/auth/register fails with duplicate email", async () => {
    const email = createEmail("duplicate");
    createdEmails.push(email);

    await request(app).post("/api/auth/register").send({
      name: "First User",
      email,
      password: "password123",
    });

    const res = await request(app).post("/api/auth/register").send({
      name: "Second User",
      email,
      password: "password456",
    });

    expect(res.statusCode).toBe(400);
  });

  // Login
  test("POST /api/auth/login returns token with correct credentials", async () => {
    const email = createEmail("login");
    createdEmails.push(email);

    await request(app).post("/api/auth/register").send({
      name: "Login User",
      email,
      password: "password123",
    });

    const res = await request(app).post("/api/auth/login").send({
      email,
      password: "password123",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user.email).toBe(email);
  });

  test("POST /api/auth/login fails with wrong password", async () => {
    const email = createEmail("wrong-pass");
    createdEmails.push(email);

    await request(app).post("/api/auth/register").send({
      name: "Wrong Pass User",
      email,
      password: "correctpassword",
    });

    const res = await request(app).post("/api/auth/login").send({
      email,
      password: "wrongpassword",
    });

    expect(res.statusCode).toBe(401);
  });

  test("POST /api/auth/login fails with non-existent email", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "doesnotexist@example.com",
      password: "password123",
    });

    expect(res.statusCode).toBe(401);
  });

  // Protected route
  test("GET /api/auth/me returns user profile with valid token", async () => {
    const email = createEmail("me");
    createdEmails.push(email);

    const registerRes = await request(app).post("/api/auth/register").send({
      name: "Profile User",
      email,
      password: "password123",
    });

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${registerRes.body.token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe(email);
    expect(res.body.user.name).toBe("Profile User");
  });

  test("GET /api/auth/me returns 401 without token", async () => {
    const res = await request(app).get("/api/auth/me");

    expect(res.statusCode).toBe(401);
    expect(res.body.code).toBe("AUTH_REQUIRED");
  });

  test("GET /api/auth/me returns 401 with invalid token", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer invalidtoken123");

    expect(res.statusCode).toBe(401);
  });

});