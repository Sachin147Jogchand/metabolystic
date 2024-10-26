require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../models/users"); // Assuming you have a Mongoose model for users

// Generate JWT Token
function generateJwtToken(userData) {
  return jwt.sign(userData, process.env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "24H",
  });
}

// Verify JWT Token Middleware
const verifyJwtToken = async (req, res, next) => {
  const authHeader = req.get("Authorization");

  // Check if Authorization header exists
  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header is required" });
  }

  const token = authHeader.split(" ")[1]; // Split token from "Bearer"

  // Check if token is valid
  if (!token || token === "" || token === null) {
    return res.status(401).json({ error: "Invalid Token" });
  }

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(401).json({ error: "Token verification failed" });
  }

  // If the token is not decoded, send an unauthorized response
  if (!decodedToken) {
    return res.status(401).json({ error: "Unauthorized request" });
  }

  // Validate user with the decoded token data in MongoDB
  try {
    const validUser = await User.findOne({
      email: decodedToken.email,
      role: decodedToken.role,
      status: { $in: [1, null] }, // Adjusted to work with MongoDB query
    });

    if (!validUser) {
      return res.status(401).json({ error: "Unauthorized request" });
    }

    // Set the user ID in the request headers
    req.headers["user_id"] = validUser._id;
    next();
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  generateJwtToken,
  verifyJwtToken,
};
