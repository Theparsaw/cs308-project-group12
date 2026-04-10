const User = require("../models/User");
const bcrypt = require("bcrypt");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");
const { signAuthToken } = require("../utils/jwt");

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

const register = asyncHandler(async (req, res) => {
  const { name, email, password, taxId, address } = req.body;

  if (!name || !email || !password) {
    throw new AppError("Please provide name, email, and password", 400, "VALIDATION_ERROR");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError("Email already in use", 400, "EMAIL_ALREADY_EXISTS");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    taxId,
    address,
    role: "customer",
  });

  const token = signAuthToken({ id: user._id, role: user.role });

  res.status(201).json({
    token,
    user: sanitizeUser(user),
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Please provide email and password", 400, "VALIDATION_ERROR");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
  }

  const token = signAuthToken({ id: user._id, role: user.role });

  res.status(200).json({
    token,
    user: sanitizeUser(user),
  });
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("_id name email role");

  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  res.status(200).json({
    user: sanitizeUser(user),
  });
});

module.exports = { register, login, getCurrentUser };
