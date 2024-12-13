// const mongoose = require('mongoose');

// // Define RoomBooking schema
// const roomBookingSchema = new mongoose.Schema(
//   {
//     // Primary member details
//     primaryMemberId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User', // Reference to the User schema for primary member
//       required: true,
//     },
//     memberType: {
//       type: String,
//       enum: ['Member', 'Guest of Member'], // 'self' or 'guest' to denote the type
//       default: 'Member',
//     },

//     // Member details (Multiple members can be added, including guests)
//     memberDetails: [
//       {
//         memberName: {
//           type: String,
//           required: true,
//         },
//         memberType: {
//           type: String,
//           required: true,
//           default: '',
//         },
//       },
//     ],
//     guestContact: {
//       type: String,
//       required: function () {
//         return this.memberType === 'Guest of Member'; // Only required for guest members
//       },
//       trim: true,
//       match: [
//         /^[0-9]{10}$/, // Validate exactly 10 digits
//         'Please provide a valid mobile number',
//       ],
//     },

//     // Room count by category type (e.g., Single, Double, Suite)
//     roomCategoryCounts: [
//       {
//         roomType: {
//           type: mongoose.Schema.Types.ObjectId, // Reference to room category
//           ref: 'RoomWithCategory',
//           required: true,
//         },
//         roomCount: {
//           type: Number, // Number of rooms for this category type
//           required: true,
//           validate: {
//             validator: function (v) {
//               return v <= 3; // Maximum 3 rooms per booking
//             },
//             message: 'Maximum 3 rooms are allowed per booking.',
//           },
//         },
//         roomPrice: {
//           type: Number, // Price per room for this category type
//           required: true,
//         },
//         roomNumbers: [
//           {
//             type: mongoose.Schema.Types.ObjectId, // Should reference RoomWithCategory
//             ref: 'RoomWithCategory', // Reference to the room model (RoomWithCategory)
//           },
//         ],
//         extraBedCount: {
//           type: Number,
//           required: true,
//           default: 0,
//           min: 0,
//           max: 2, // Max 2 extra beds allowed per room
//           validate: {
//             validator: function (v) {
//               return v <= 2; // Ensure no more than 2 extra beds per room
//             },
//             message: 'Maximum of 2 extra beds allowed per room.',
//           },
//         },
//         extraBedCharge: {
//           type: Number,
//           required: true,
//         },
//         taxTypes: [
//           {
//             taxType: {
//               type: String, // e.g., SGST, CGST, Luxury Tax, etc.
//               required: true,
//             },
//             taxRate: {
//               type: Number, // Tax rate for this room category (e.g., 18%)
//               required: true,
//             },
//             taxAmount: {
//               type: Number, // Tax rate for this room category (e.g., 18%)
//               required: true,
//             },
//           },
//         ],
//         totalAmount: {
//           type: Number,
//           required: true,
//           default: function () {
//             let totalAmount = 0;
//             let totalTaxAmount = 0;
//             this.roomCategoryCounts.forEach((roomCategoryCount) => {
//               const { roomPrice, roomCount, taxRate } = roomCategoryCount;
//               const roomTotalPrice = roomPrice * roomCount;
//               const taxAmount = (roomTotalPrice * taxRate) / 100;
//               totalAmount += roomTotalPrice;
//               totalTaxAmount += taxAmount;
//             });

//             // Add total tax amount to the final total amount
//             return totalAmount + totalTaxAmount;
//           },
//         },
//         totalTaxAmount: {
//           type: Number,
//           required: true,
//           default: function () {
//             let totalTaxAmount = 0;
//             this.roomCategoryCounts.forEach((roomCategoryCount) => {
//               const { roomPrice, roomCount, taxRate } = roomCategoryCount;
//               const roomTotalPrice = roomPrice * roomCount;
//               const taxAmount = (roomTotalPrice * taxRate) / 100;
//               totalTaxAmount += taxAmount;
//             });
//             return totalTaxAmount;
//           },
//         },

//         // Per-room member counts
//         memberCounts: {
//           adults: {
//             type: Number,
//             required: true,
//             default: 0,
//             validate: {
//               validator: function (v) {
//                 return v <= 2; // Maximum 2 adults per room
//               },
//               message: 'Maximum 2 adults allowed per room.',
//             },
//           },
//           children: {
//             type: Number,
//             required: true,
//             default: 0,
//             validate: {
//               validator: function (v) {
//                 return v <= 2; // Maximum 2 children per room
//               },
//               message: 'Maximum 2 children allowed per room.',
//             },
//           },
//           infants: {
//             type: Number,
//             required: true,
//             default: 0,
//             validate: {
//               validator: function (v) {
//                 return v <= 2; // Infants are accommodated with adults by default
//               },
//               message: 'Maximum 2 infants allowed per room.',
//             },
//           },
//           totalOccupants: {
//             type: Number,
//             required: true,
//             default: function () {
//               return (
//                 this.adults + this.children + this.infants
//               );
//             },
//           },
//         },
//       },
//     ],

//     // Booking details (check-in, check-out dates, day stay)
//     bookingDates: {
//       checkIn: {
//         type: Date,
//         required: true,
//       },
//       checkOut: {
//         type: Date,
//         required: true,
//       },
//       dayStay: {
//         type: Number,
//         required: true,
//         default: function () {
//           const checkIn = new Date(this.bookingDates.checkIn);
//           const checkOut = new Date(this.bookingDates.checkOut);
//           const timeDifference = checkOut - checkIn;
//           return Math.ceil(timeDifference / (1000 * 3600 * 24)); // Calculate number of days
//         },
//         validate: {
//           validator: function (v) {
//             const maxStay = this.memberType === 'Member' ? 15 : 7;
//             return v <= maxStay; // Validate stay duration based on member type
//           },
//           message: 'Stay duration exceeds the maximum allowed.',
//         },
//       },
//     },

//     // Pricing details (per night, total amount, tax, etc.)
//     pricingDetails: {
//       final_totalAmount: {
//         type: Number,
//         required: true,
//         default: function () {
//           let totalAmount = 0;
//           let totalTaxAmount = 0;

//           // Check if roomCategoryCounts exists and is an array
//           if (Array.isArray(this.roomCategoryCounts)) {
//             this.roomCategoryCounts.forEach((roomCategoryCount) => {
//               const { roomPrice, roomCount, taxRate } = roomCategoryCount;

//               // Ensure roomPrice, roomCount, and taxRate are valid numbers
//               const validRoomPrice = typeof roomPrice === 'number' && !isNaN(roomPrice) ? roomPrice : 0;
//               const validRoomCount = typeof roomCount === 'number' && !isNaN(roomCount) ? roomCount : 0;
//               const validTaxRate = typeof taxRate === 'number' && !isNaN(taxRate) ? taxRate : 0;

//               const roomTotalPrice = validRoomPrice * validRoomCount;
//               const taxAmount = (roomTotalPrice * validTaxRate) / 100;

//               totalAmount += roomTotalPrice;
//               totalTaxAmount += taxAmount;
//             });
//           }

//           // Return the final total amount with tax included
//           return totalAmount + totalTaxAmount;
//         },
//       },
//       final_totalTaxAmount: {
//         type: Number,
//         required: true,
//         default: function () {
//           let totalTaxAmount = 0;

//           // Check if roomCategoryCounts exists and is an array
//           if (Array.isArray(this.roomCategoryCounts)) {
//             this.roomCategoryCounts.forEach((roomCategoryCount) => {
//               const { roomPrice, roomCount, taxRate } = roomCategoryCount;

//               // Ensure roomPrice, roomCount, and taxRate are valid numbers
//               const validRoomPrice = typeof roomPrice === 'number' && !isNaN(roomPrice) ? roomPrice : 0;
//               const validRoomCount = typeof roomCount === 'number' && !isNaN(roomCount) ? roomCount : 0;
//               const validTaxRate = typeof taxRate === 'number' && !isNaN(taxRate) ? taxRate : 0;

//               const roomTotalPrice = validRoomPrice * validRoomCount;
//               const taxAmount = (roomTotalPrice * validTaxRate) / 100;

//               totalTaxAmount += taxAmount;
//             });
//           }

//           // Return the total tax amount
//           return totalTaxAmount;
//         },
//       },
//     },

//     // QR code details for booking (All details and Unique QR Code)
//     allDetailsQRCode: {
//       type: String, // QR code containing all booking details
//       default: '',
//     },
//     uniqueQRCode: {
//       type: String,
//       default: '',
//     },

//     // Payment and Booking Statuses
//     paymentMode: {
//       type: String,
//       default: 'Direct to Member A/c.',
//     },
//     paymentStatus: {
//       type: String,
//       enum: ['Pending', 'Completed', 'Failed'],
//       default: 'Pending',
//     },
//     bookingStatus: {
//       type: String,
//       enum: ['Pending', 'Confirmed', 'Cancelled'],
//       default: 'Pending',
//     },

//     // Soft delete field
//     isDeleted: {
//       type: Boolean,
//       default: false,
//     },
//     deletedAt: {
//       type: Date,
//       default: null,
//     },
//   },
//   { timestamps: true }
// );

// // Create RoomBooking model
// const RoomBooking = mongoose.model('RoomBooking', roomBookingSchema);

// module.exports = RoomBooking;



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

// // Pre-save middleware to calculate totalAmount and totalTaxAmount
// roomBookingSchema.pre('save', function (next) {
//   let totalAmount = 0;
//   let totalTaxAmount = 0;

//   if (Array.isArray(this.roomCategoryCounts)) {
//     this.roomCategoryCounts.forEach((roomCategoryCount) => {
//       const { roomPrice, roomCount, taxRate } = roomCategoryCount;

//       const validRoomPrice = typeof roomPrice === 'number' && !isNaN(roomPrice) ? roomPrice : 0;
//       const validRoomCount = typeof roomCount === 'number' && !isNaN(roomCount) ? roomCount : 0;
//       const validTaxRate = typeof taxRate === 'number' && !isNaN(taxRate) ? taxRate : 0;

//       const roomTotalPrice = validRoomPrice * validRoomCount;
//       const taxAmount = (roomTotalPrice * validTaxRate) / 100;

//       totalAmount += roomTotalPrice;
//       totalTaxAmount += taxAmount;
//     });
//   }

//   // Set the totalAmount and totalTaxAmount before saving
//   this.pricingDetails.final_totalAmount = totalAmount + totalTaxAmount;
//   this.pricingDetails.final_totalTaxAmount = totalTaxAmount;

//   next(); // Proceed with saving the document
// });

// Create RoomBooking model
const RoomBooking = mongoose.model('RoomBooking', roomBookingSchema);

module.exports = RoomBooking;



// https://chatgpt.com/c/6756c89c-d64c-800a-8efb-602f864e4b80