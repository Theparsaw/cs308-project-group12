// Import the User model so we can interact with the users collection in MongoDB
const User = require("../models/User");

// bcrypt is used to hash (scramble) passwords before saving them
const bcrypt = require("bcrypt");

// jsonwebtoken is used to create tokens that prove a user is logged in
const jwt = require("jsonwebtoken");


// ─── REGISTER ─────────────────────────────────────────────────────────────────
// Handles POST /api/auth/register
// Creates a new user account with a hashed password and returns a JWT token
const register = async (req, res) => {
  try {
    // Pull the required customer fields out of the request body
    const { name, email, password, taxId, address } = req.body;

    // If any required field is missing, stop and return an error
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please provide name, email, and password",
      });
    }

    // Check if a user with this email already exists in the database
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // Hash the password using bcrypt — 10 rounds of scrambling
    // We NEVER store the plain password, only this scrambled version
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save the new customer in MongoDB
    const user = await User.create({
      name,
      email,
      password: hashedPassword, // store the hash, not the real password
      taxId,
      address,
      role: "customer",
    });

    // Create a JWT token containing the user's ID and role
    // It's signed with our secret key and expires in 7 days
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Send back the token and basic user info (never send the password back)
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    // If anything goes wrong unexpectedly, return a 500 server error
    res.status(500).json({ message: error.message });
  }
};


// ─── LOGIN ────────────────────────────────────────────────────────────────────
// Handles POST /api/auth/login
// Checks credentials and returns a JWT token if they are correct
const login = async (req, res) => {
  try {
    // Pull email and password out of the request body
    const { email, password } = req.body;

    // If either field is missing, stop and return an error
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    // Look for a user with this email in the database
    const user = await User.findOne({ email });

    // If no user found, return a vague error on purpose
    // (we don't want to reveal whether the email exists or not)
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare the plain password the user typed with the stored hash
    // bcrypt handles this — it scrambles the input and compares
    const isMatch = await bcrypt.compare(password, user.password);

    // If passwords don't match, return the same vague error
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Passwords match — create a JWT token for this user
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Send back the token and basic user info
    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    // If anything goes wrong unexpectedly, return a 500 server error
    res.status(500).json({ message: error.message });
  }
};


// Export both functions so they can be used in the routes file
module.exports = { register, login };
