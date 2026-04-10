const jwt = require("jsonwebtoken");

const getJwtSecret = () => process.env.JWT_SECRET || "development-jwt-secret";

const signAuthToken = (payload, options = {}) =>
  jwt.sign(payload, getJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    ...options,
  });

module.exports = {
  signAuthToken,
  getJwtSecret,
};
