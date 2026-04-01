// Import jsonwebtoken so we can verify incoming JWT tokens
const jwt = require("jsonwebtoken");

// Middleware to protect routes that require a logged-in user
const authMiddleware = (req, res, next) => {
  // Read the Authorization header from the incoming request
  const authHeader = req.headers.authorization;

  // If there is no Authorization header, block access
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }

  // The token should come in the format: Bearer <token>
  const parts = authHeader.split(" ");

  // If the format is wrong, block access
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return res.status(401).json({ message: "Invalid token format" });
  }

  const token = parts[1];

  try {
    // Verify the token using the secret stored in the environment
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Save the decoded user information on the request object
    req.user = decoded;

    // Continue to the next middleware or route handler
    next();
  } catch (error) {
    // If the token is invalid or expired, block access
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Export the middleware so it can be used in route files
module.exports = authMiddleware;
