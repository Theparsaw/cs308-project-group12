const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");
const { getJwtSecret } = require("../utils/jwt");

const authMiddleware = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError("Authentication token is required", 401, "AUTH_REQUIRED");
  }

  const parts = authHeader.split(" ");

  if (parts.length !== 2 || parts[0] !== "Bearer") {
    throw new AppError("Invalid token format", 401, "INVALID_TOKEN_FORMAT");
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    const user = await User.findById(decoded.id).select("_id name email role");

    if (!user) {
      throw new AppError("User no longer exists", 401, "USER_NOT_FOUND");
    }

    req.user = {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
    };
    return next();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    if (error.name === "TokenExpiredError") {
      throw new AppError("Token has expired", 401, "TOKEN_EXPIRED");
    }

    throw new AppError("Invalid token", 401, "INVALID_TOKEN");
  }
});

const authorize = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(new AppError("Authentication required", 401, "AUTH_REQUIRED"));
  }

  if (!roles.includes(req.user.role)) {
    return next(new AppError("You are not allowed to access this resource", 403, "FORBIDDEN"));
  }

  return next();
};

module.exports = {
  authMiddleware,
  authorize,
};
