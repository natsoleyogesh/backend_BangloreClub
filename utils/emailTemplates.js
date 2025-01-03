const banquetBookingTemplate = require("./template/banquetBookingTemplate");
const eventBookingTemplate = require("./template/eventBookingTemplate");
const familymemberEditTemplate = require("./template/familymemberEditTemplate");
const memberEditRequestTemplate = require("./template/memberEditRequestTemplate");

// depentends template
const eventBookingDependentTemplate = require("./template/eventBookingDependentTemplate");

module.exports = {
    // roomBooking: roomBookingTemplate,
    // banquetBooking: banquetBookingTemplate,
    eventBooking: eventBookingTemplate,
    banquetBooking: banquetBookingTemplate,
    memberEditRequestTemplate: memberEditRequestTemplate,
    familymemberEditTemplate: familymemberEditTemplate,

    eventBookingDependentTemplate: eventBookingDependentTemplate
};
