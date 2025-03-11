
const mongoose = require('mongoose');

// Define BanquetBooking schema
const banquetBookingSchema = new mongoose.Schema(
    {
        // Primary member details
        primaryMemberId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        invitationOfmember: {
            type: String,
            default: '',
        },
        officePhoneNumber: {
            type: String,
            trim: true,
            default: ""
            // match: [/^[0-9]{10}$/, 'Please provide a valid mobile number'],
        },
        mobileNumber: {
            type: String,
            // required: true,
            trim: true,
            default: ""
            // match: [/^[0-9]{10}$/, 'Please provide a valid mobile number'],
        },
        residencePhoneNo: {
            type: String,
            trim: true,
            default: ""
            // match: [/^[0-9]{10}$/, 'Please provide a valid mobile number'],
        },
        address: {
            type: String,
            // required: true,
            default: ""
        },
        occasion: {
            type: String,
            required: true,
        },
        attendingGuests: {
            type: Number,
            required: true,
            min: 1,
        },

        banquetType: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'banquet',
            required: true,
        },
        banquetPrice: {
            type: Number,
            required: true,
        },

        // Booking dates
        bookingDates: {
            checkIn: {
                type: Date,
                required: true,
            },
            checkOut: {
                type: Date,
                required: true,
                // validate: {
                //     validator: function (v) {
                //         return v > this.bookingDates.checkIn;
                //     },
                //     message: 'Check-out date must be after the check-in date.',
                // },
            },
            dayStay: {
                type: Number,
                default: 0, // Will be calculated in pre-save
            },
        },

        // Booking time (for partial bookings)
        bookingTime: {
            from: {
                type: String, // Use String for times like "10:00 AM"
                required: true,
            },
            to: {
                type: String, // Use String for times like "12:00 PM"
                required: true,
            },
            duration: {
                type: Number,
                default: 0, // Will be calculated in pre-save
            },
        },

        // Pricing details
        pricingDetails: {
            specialDayExtraCharge: {
                type: Number,
                default: 0,
            },
            totalAmount: {
                type: Number,
                required: true,
            },
            totalTaxAmount: {
                type: Number,
                default: 0,
            },
            final_totalAmount: {
                type: Number,
                default: 0,
            },
            taxTypes: [
                {
                    taxType: {
                        type: String,
                        required: true,
                    },
                    taxRate: {
                        type: Number,
                        required: true,
                    },
                    taxAmount: {
                        type: Number,
                        required: true,
                    },
                },
            ],
        },

        // QR code details
        allDetailsQRCode: {
            type: String,
            default: '',
        },
        uniqueQRCode: {
            type: String,
            unique: true,
            default: '',
        },

        // Payment and Booking Statuses
        paymentMode: {
            type: String,
            default: 'Direct to Member A/c.',
        },
        paymentStatus: {
            type: String,
            enum: ['Pending', 'Completed', 'Failed'],
            default: 'Pending',
        },
        bookingStatus: {
            type: String,
            enum: ['Pending', 'Confirmed', 'Cancelled'],
            default: 'Pending',
        },
        billable: {
            type: Boolean,
            default: true,
            required: true
        },
        billableDate: {
            type: Date,
            default: null,
        },

        // Soft delete field
        isDeleted: {
            type: Boolean,
            default: false,
        },
        deletedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

// Pre-save middleware to calculate `dayStay` and `duration`
banquetBookingSchema.pre('save', function (next) {
    // Calculate duration for bookingTime
    if (this.bookingTime && this.bookingTime.from && this.bookingTime.to) {
        const [fromHours, fromMinutes] = this.bookingTime.from.split(':').map(Number);
        const [toHours, toMinutes] = this.bookingTime.to.split(':').map(Number);

        const fromTotalMinutes = fromHours * 60 + fromMinutes;
        const toTotalMinutes = toHours * 60 + toMinutes;

        const durationInMinutes = toTotalMinutes - fromTotalMinutes;
        this.bookingTime.duration = durationInMinutes / 60; // Convert minutes to hours
    }

    next();
});

// Create BanquetBooking model
const BanquetBooking = mongoose.model('BanquetBooking', banquetBookingSchema);

module.exports = BanquetBooking;
