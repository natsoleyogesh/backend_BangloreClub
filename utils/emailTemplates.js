const banquetBookingTemplate = require("./template/banquetBookingTemplate");
const banquetBookingReqTemplate = require("./template/banquetBookingReqTemplate");

const eventBookingTemplate = require("./template/eventBookingTemplate");
const familymemberEditTemplate = require("./template/familymemberEditTemplate");
const memberEditRequestTemplate = require("./template/memberEditRequestTemplate");


// depentends template
const eventBookingDependentTemplate = require("./template/eventBookingDependentTemplate");
const roomBookingTemplate = require("./template/roomBookingTemplate");
const eventBookingGuestTemplate = require("./template/eventBookingGuestTemplate");

// otp
const otpTemplate = require("./template/otpTemplate");
const roomBookingReqTemplate = require("./template/roomBookingReqTemplate");
const roomBookingReject = require("./template/roomBookingReject");
const banquetBookingReject = require("./template/banquetBookingReject");
const eventBookingCancel = require("./template/eventBookingCancelled/eventBookingCancel");
const dependentBookingCanclled = require("./template/eventBookingCancelled/dependentBookingCanclled");
const guestBookingCanclled = require("./template/eventBookingCancelled/guestBookingCanclled");

module.exports = {
    // event booking Confirmation Template
    eventBooking: eventBookingTemplate,
    eventBookingDependentTemplate: eventBookingDependentTemplate,
    eventBookingGuestTemplate: eventBookingGuestTemplate,

    // Event Booking Rejetc / Canclled Template
    eventBookingCanclled: eventBookingCancel,
    eventDependentCanclled: dependentBookingCanclled,
    eventGuestCanclled: guestBookingCanclled,

    // Banqet Booking Template
    banquetBooking: banquetBookingTemplate,
    banquetBookingReq: banquetBookingReqTemplate,
    banquetBookingReject: banquetBookingReject,

    // Room Booking Template
    roomBooking: roomBookingTemplate,
    roomBookingReject: roomBookingReject,
    roomBookingRequest: roomBookingReqTemplate,


    memberEditRequestTemplate: memberEditRequestTemplate,
    familymemberEditTemplate: familymemberEditTemplate,

    otpTemplate: otpTemplate
};
