const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./database/db");
const routes = require("./routes");
const isAuthenticated = require("./utils/auth");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(
  express.urlencoded({
    limit: "50mb",
    extended: true,
  })
);

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  next()
})
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// In your main server file (e.g., app.js or server.js)
app.use("/api/uploads", express.static("uploads"));

// Database Connection
connectDB();

// Routes
// app.use("/", isAuthenticated(), routes);
app.use("/api", routes);


// Error handling for unmatched routes
app.use("/api/*", (req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Start server
const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
