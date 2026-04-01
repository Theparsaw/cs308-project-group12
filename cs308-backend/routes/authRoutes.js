// Import Express so we can create a router for authentication URLs
const express = require("express");

// Import the controller functions that handle registration and login logic
const { register, login } = require("../controllers/authController");
// Import middleware that checks whether a valid JWT token was sent
const authMiddleware = require("../middleware/authMiddleware");

// Create a router object to group authentication-related routes together
const router = express.Router();

// When a POST request comes to /register, run the register controller
router.post("/register", register);

// When a POST request comes to /login, run the login controller
router.post("/login", login);

// When a GET request comes to /me, first verify the token, then return user info
router.get("/me", authMiddleware, (req, res) => {
  res.status(200).json({
    message: "Protected route accessed successfully",
    user: req.user,
  });
});

// Export the router so server.js can attach it to the main app
module.exports = router;
