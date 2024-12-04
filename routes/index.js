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

module.exports = router;
