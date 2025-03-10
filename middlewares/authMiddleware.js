const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return next(); // Proceed without authentication

    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Replace with your secret key
    req.user = decoded; // Attach user data to the request
  } catch (err) {
    console.log("JWT Error:", err);
  }
  next();
};

module.exports = authMiddleware;
