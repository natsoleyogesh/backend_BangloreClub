const express = require("express");

const router = express.Router();

const userRoutes = require("./userRoutes");
const adminRoutes = require("./adminRoutes");
const profileRequestRoutes = require("./profileRequestRoutes");
const eventRoutes = require("./eventRoutes");
const categoryRoutes = require("./categoryRoutes");
const roomRoutes = require("./roomRoutes");
const offerRoutes = require("./offerRoutes");
const hodRoutes = require("./hodRoutes");
const downloadRoutes = require("./downloadRoutes");
const clubNoticeRoutes = require("./clubNoticeRoutes");
const gCMRoutes = require("./gCMRoutes");
const ruleByelawRoutes = require("./ruleByelawRoutes");
const faqRoutes = require("./faqRoutes");
const comRoutes = require("./comRoutes");
const foodAndBeverageRoutes = require("./foodAndBeverageRoutes");
const membershipWaitingListRoutes = require("./membershipWaitingListRoutes");
const roomWithCategoryRoutes = require("./roomWithCategory");
const banquetRoutes = require("./banquetRoutes");
const dashBoardRoutes = require("./dashBoardRoutes");

// master data routes
const departmentRoutes = require("./masterRoutes/departmentRoutes");
const restaurantRoutes = require("./masterRoutes/restaurantRoutes");
const amenitiesRoutes = require("./masterRoutes/amenitiesRoutes");
const taxTypeRoutes = require("./masterRoutes/taxTypeRoutes");
const billingRoutes = require("./billingRoutes");
const transactionRoutes = require("./transactionRoutes");
const notificationRoutes = require("./notificationRoutes");
const allRequestRoutes = require("./allRequestRoutes");
const locationRoutes = require("./masterRoutes/locationRoutes");

adminRoutes(router);
userRoutes(router);
profileRequestRoutes(router);
eventRoutes(router);
categoryRoutes(router);
roomRoutes(router);
offerRoutes(router);
hodRoutes(router);
downloadRoutes(router);
clubNoticeRoutes(router);
gCMRoutes(router);
ruleByelawRoutes(router);
faqRoutes(router);
comRoutes(router);
foodAndBeverageRoutes(router);
membershipWaitingListRoutes(router);
roomWithCategoryRoutes(router);
banquetRoutes(router);
billingRoutes(router);
transactionRoutes(router);
notificationRoutes(router);
allRequestRoutes(router);
dashBoardRoutes(router);

// master data
departmentRoutes(router);
restaurantRoutes(router);
amenitiesRoutes(router);
taxTypeRoutes(router);
locationRoutes(router);

module.exports = router;
