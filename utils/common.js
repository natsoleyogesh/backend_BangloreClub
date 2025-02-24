const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require('uuid'); // Import UUID for generating unique IDs
const User = require("../models/user");
require("dotenv").config();

// Generate a new JWT token
const generateToken = (payload) => {
  const currentTime = Math.floor(Date.now() / 1000); // Get current time in seconds
  const jwtId = uuidv4(); // Generate a unique identifier for the token

  const tokenPayload = {
    jti: jwtId,       // JWT ID (unique identifier)
    iat: currentTime, // Issued at time (seconds since epoch)
    // exp: currentTime + 3600, // Expiration time (1 hour from the issue time)
    ...payload,       // Your custom payload (user info, etc.)
  };

  // Sign the JWT with a secret and add any extra options (like expiration)
  return jwt.sign(tokenPayload, process.env.JWT_SECRET, {
    algorithm: 'HS256', // or 'RS256' if you want to use RSA
    // expiresIn: '1h', // Can be set to a specific time or calculated using `exp`
  });
};

// Verify the JWT token for protected routes
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access Denied: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded token data to req.user
    next();
  } catch (error) {
    console.error("Token verification failed:", error);
    res.status(401).json({ message: "Access Denied: Invalid token" });
  }
};

// Decode a JWT token without verifying
const decodeToken = (token) => {
  try {
    const decoded = jwt.decode(token);
    return decoded;
  } catch (error) {
    console.error("Token decoding failed:", error);
    return null;
  }
};


// Helper function to generate a unique 10-digit primary member ID
const generatePrimaryMemberId = async () => {
  const count = await User.countDocuments();
  const uniqueNumber = (count + 1).toString().padStart(10, '0'); // Pads with leading zeros to make it 10 digits
  return `BC${uniqueNumber}`; // Example output: BC0000000001
}

// Helper function to generate a unique member ID for family members based on primary member ID
const generateFamilyMemberId = async (primaryMemberId, relationCount) => {
  const suffix = String.fromCharCode(65 + relationCount); // A, B, C, etc.
  return `${primaryMemberId}${suffix}`; // Example output: BC1234567890-A
}

// Generate OTP (a 6-digit random number)
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
}


const toTitleCase = (str) => {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const toLowerCase = (str) => {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toLowerCase() + word.slice(1))
    .join(' ');
};

module.exports = { generateToken, verifyToken, decodeToken, generatePrimaryMemberId, generateFamilyMemberId, generateOtp, toTitleCase, toLowerCase };
