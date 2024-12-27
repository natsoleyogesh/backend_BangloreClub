const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./database/db");
const routes = require("./routes");
const isAuthenticated = require("./utils/auth");
const { initWebSocket } = require("./utils/websocket");
const http = require("http"); // Import http to create server
require("dotenv").config();

const app = express();

// Middleware
// app.use(cors());
// Middleware
let isDevelopment = true;
app.use(
  cors({
    origin: isDevelopment ? "*" : ["https://13.53.129.30"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true, // Adjust based on your use case
  })
);
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

// // Start server
// const PORT = process.env.PORT || 3005;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// Create HTTP server and integrate WebSocket
const server = http.createServer(app); // Create an HTTP server
const io = initWebSocket(server); // Initialize WebSocket server

// Expose `io` for use in other modules
app.set("io", io); // Attach the `io` instance to the Express app for reuse

// Start server
const PORT = process.env.PORT || 3005;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
