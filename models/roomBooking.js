const mongoose = require('mongoose');

// Define RoomBooking schema
const roomBookingSchema = new mongoose.Schema(
  {
    // Primary member details
    primaryMemberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    memberType: {
      type: String,
      enum: ['Member', 'Guest of Member'],
      default: 'Member',
    },

    // Member details
    memberDetails: [
      {
        memberName: {
          type: String,
          required: true,
        },
        memberType: {
          type: String,
          required: true,
          default: '',
        },
      },
    ],

    guestContact: {
      type: String,
      required: function () {
        return this.memberType === 'Guest of Member';
      },
      trim: true,
      match: [/^[0-9]{10}$/, 'Please provide a valid mobile number'],
    },

    // Room count by category type
    roomCategoryCounts: [
      {
        roomType: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'RoomWithCategory',
          required: true,
        },
        roomCount: {
          type: Number,
          required: true,
          validate: {
            validator: function (v) {
              return v <= 3;
            },
            message: 'Maximum 3 rooms are allowed per booking.',
          },
        },
        roomPrice: {
          type: Number,
          required: true,
        },
        roomNumbers: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'RoomWithCategory',
          },
        ],

        memberCounts: {

          adults: {
            type: Number,
            required: true,
            default: 0
          },

          children: {
            type: Number,
            required: true,
            default: 0
          },

          infants: {
            type: Number,
            required: true,
            default: 0
          },

          totalOccupants: {
            type: Number,
            required: true,
            default: 0
          }

        },

        extraBedCount: {
          type: Number,
          required: true,
          default: 0,
          min: 0,
          max: 2,
          validate: {
            validator: function (v) {
              return v <= 2;
            },
            message: 'Maximum of 2 extra beds allowed per room.',
          },
        },
        extraBedCharge: {
          type: Number,
          required: true,
        },
        extraBedTotalCharges: {
          type: Number,
          required: true,
          default: 0
        },
        totalAmount: {
          type: Number,
          required: true,
        },
        totalTaxAmount: {
          type: Number,
          required: true,
        },
        final_amount: {
          type: Number,
          required: true,
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
    ],

    // Booking details
    bookingDates: {
      checkIn: {
        type: Date,
        required: true,
      },
      checkOut: {
        type: Date,
        required: true,
      },
      dayStay: {
        type: Number,
        required: true,
        default: function () {
          const checkIn = new Date(this.bookingDates.checkIn);
          const checkOut = new Date(this.bookingDates.checkOut);
          const timeDifference = checkOut - checkIn;
          return Math.ceil(timeDifference / (1000 * 3600 * 24)); // Calculate days
        },
        validate: {
          validator: function (v) {
            const maxStay = this.memberType === 'Member' ? 15 : 7;
            return v <= maxStay;
          },
          message: 'Stay duration exceeds the maximum allowed.',
        },
      },
    },

    // Pricing details
    pricingDetails: {
      final_totalAmount: {
        type: Number,
        required: true,
        default: 0, // Default value will be overwritten in pre-save middleware
      },
      final_totalTaxAmount: {
        type: Number,
        required: true,
        default: 0, // Default value will be overwritten in pre-save middleware
      },
      specialDayExtraCharge: {
        type: Number,
        default: 0
      },
      extraBedTotal: {
        type: Number,
        default: 0
      }
    },

    // QR code details
    allDetailsQRCode: {
      type: String,
      default: '',
    },
    uniqueQRCode: {
      type: String,
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

// Create RoomBooking model
const RoomBooking = mongoose.model('RoomBooking', roomBookingSchema);

module.exports = RoomBooking;
