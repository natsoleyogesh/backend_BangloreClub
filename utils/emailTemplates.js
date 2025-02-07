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

module.exports = {
    eventBooking: eventBookingTemplate,

    banquetBooking: banquetBookingTemplate,
    banquetBookingReq: banquetBookingReqTemplate,
    banquetBookingReject: banquetBookingReject,

    memberEditRequestTemplate: memberEditRequestTemplate,
    familymemberEditTemplate: familymemberEditTemplate,

    eventBookingDependentTemplate: eventBookingDependentTemplate,
    eventBookingGuestTemplate: eventBookingGuestTemplate,

    roomBooking: roomBookingTemplate,

    roomBookingReject: roomBookingReject,


    roomBookingRequest: roomBookingReqTemplate,


    otpTemplate: otpTemplate
};
