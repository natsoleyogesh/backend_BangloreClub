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
const affiliatedClubRoutes = require("./affiliatedClubRoutes");

// master data routes
const departmentRoutes = require("./masterRoutes/departmentRoutes");
const designationRoutes = require("./masterRoutes/designationRoutes");
const restaurantRoutes = require("./masterRoutes/restaurantRoutes");
const amenitiesRoutes = require("./masterRoutes/amenitiesRoutes");
const taxTypeRoutes = require("./masterRoutes/taxTypeRoutes");
const billingRoutes = require("./billingRoutes");
const transactionRoutes = require("./transactionRoutes");
const notificationRoutes = require("./notificationRoutes");
const allRequestRoutes = require("./allRequestRoutes");
const locationRoutes = require("./masterRoutes/locationRoutes");

//  settings routes
const smtpSecretRoutes = require("./settings/SmtpSecretRoutes");
const logActionRoutes = require("./settings/logActionRoutes");
// const rolePermissionRoutes = require("./settings/role_permissionRoutes");
const aboutUsRoutes = require("./settings/aboutUsRoutes");
const contactUsRoutes = require("./settings/contactUsRoutes");
const roomGuidelineOrCondition = require("./roomGuidOrCond");


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
affiliatedClubRoutes(router);

// master data
departmentRoutes(router);
designationRoutes(router);
restaurantRoutes(router);
amenitiesRoutes(router);
taxTypeRoutes(router);
locationRoutes(router);

// setting data
smtpSecretRoutes(router);
logActionRoutes(router);
// rolePermissionRoutes(router);
aboutUsRoutes(router);
contactUsRoutes(router);
roomGuidelineOrCondition(router);

module.exports = router;
