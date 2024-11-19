const express = require("express");

const router = express.Router();

const userRoutes = require("./userRoutes");
const adminRoutes = require("./adminRoutes");
const profileRequestRoutes = require("./profileRequestRoutes");
const eventRoutes = require("./eventRoutes");
const categoryRoutes = require("./categoryRoutes");
const roomRoutes = require("./roomRoutes");
const offerRoutes = require("./offerRoutes");

adminRoutes(router);
userRoutes(router);
profileRequestRoutes(router);
eventRoutes(router);
categoryRoutes(router);
roomRoutes(router);
offerRoutes(router)

module.exports = router;
