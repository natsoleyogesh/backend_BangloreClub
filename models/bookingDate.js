const mongoose = require("mongoose");

const BookingDateSchema = new mongoose.Schema({
    minCheckInDays: { type: Number, required: true, default: 2 }, // Minimum days for check-in
    maxCheckOutMonths: { type: Number, required: true, default: 4 }, // Maximum months for check-out
    bookingStartDate: { type: Date, required: true }, // Admin-defined booking start date
    bookingEndDate: { type: Date, required: true } // Admin-defined booking end date
}, { timestamps: true });

module.exports = mongoose.model("BookingDate", BookingDateSchema);
