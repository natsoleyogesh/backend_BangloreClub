const banquetBookingTemplate = require("./template/banquetBookingTemplate");
const banquetBookingReqTemplate = require("./template/banquetBookingReqTemplate");

const eventBookingTemplate = require("./template/eventBookingTemplate");
const familymemberEditTemplate = require("./template/familymemberEditTemplate");
const memberEditRequestTemplate = require("./template/memberEditRequestTemplate");


// depentends template
const eventBookingDependentTemplate = require("./template/eventBookingDependentTemplate");
const roomBookingTemplate = require("./template/roomBookingTemplate");
const eventBookingGuestTemplate = require("./template/eventBookingGuestTemplate");

module.exports = {
    // roomBooking: roomBookingTemplate,
    // banquetBooking: banquetBookingTemplate,
    eventBooking: eventBookingTemplate,
    banquetBooking: banquetBookingTemplate,
    banquetBookingReq: banquetBookingReqTemplate,
    memberEditRequestTemplate: memberEditRequestTemplate,
    familymemberEditTemplate: familymemberEditTemplate,

    eventBookingDependentTemplate: eventBookingDependentTemplate,
    eventBookingGuestTemplate: eventBookingGuestTemplate,

    roomBooking: roomBookingTemplate
};
