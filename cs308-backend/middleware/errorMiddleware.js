const AppError = require("../utils/appError");

const notFound = (req, res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404, "NOT_FOUND"));
};

const errorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const code = error.code || "INTERNAL_SERVER_ERROR";

  if (res.headersSent) {
    return next(error);
  }

  const payload = {
    message: error.message || "Internal server error",
    code,
  };

  if (error.details) {
    payload.details = error.details;
  }

  if (process.env.NODE_ENV !== "production" && !error.isOperational && error.stack) {
    payload.stack = error.stack;
  }

  return res.status(statusCode).json(payload);
};

module.exports = {
  notFound,
  errorHandler,
};
