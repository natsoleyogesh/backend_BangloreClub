// const mongoose = require('mongoose');

// const notificationSchema = mongoose.Schema({

//     send_to: {
//         type: String,
//         enum: {
//             values: ['All', 'User', 'Admin'],
//             message: 'Please enter valid type',
//         },
//         required: true
//     },
//     push_message: {
//         type: String,
//         required: true,
//     },
//     departmentId: {
//         type: mongoose.Schema.Types.ObjectId,
//         default: null, // Null if no department is associated
//     },

//     department: {
//         type: String,
//         enum: ['EventBooking', 'RoomBooking', 'BanquetBooking', 'Offer', 'Event'], // Valid model names
//         required: false,
//     },
//     image: {
//         type: String,
//         default: '',
//     },
//     successCount: {
//         type: Number,
//         default: 0,
//     },
//     failureCount: {
//         type: Number,
//         default: 0,
//     },
//     isDeleted: {
//         type: Boolean,
//         default: false,
//     }

// }, {
//     timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
// });

// const Notification = mongoose.model("Notification", notificationSchema);

// module.exports = Notification;

const mongoose = require('mongoose');

// Define the schema for the Notification model
const notificationSchema = new mongoose.Schema(
    {
        // Specifies the recipient of the notification
        send_to: {
            type: String,
            enum: ['All', 'User', 'Admin'], // Allowed values
            required: [true, 'Recipient type is required'], // Custom error message
        },

        // The message content of the notification
        push_message: {
            type: String,
            required: [true, 'Push message is required'], // Custom error message
        },

        departmentId: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'department', // Dynamic reference based on the `department` field
            default: null, // Null if no department is associated
            required: function () {
                // departmentId is required unless department is 'All', 'Offer', or 'Event'
                return !['All', 'Offer', 'Event'].includes(this.department);
            },
        },

        department: {
            type: String,
            enum: ['eventBooking', 'RoomBooking', 'BanquetBooking', 'Offer', 'Event'], // Valid model names
            required: [true, 'Department is required'],
        },

        // Optional image associated with the notification
        image: {
            type: String,
            default: '', // Empty string by default
        },

        // Count of successfully delivered notifications
        successCount: {
            type: Number,
            default: 0, // Default to 0
            min: 0, // Ensure non-negative values
        },

        // Count of failed notification delivery attempts
        failureCount: {
            type: Number,
            default: 0, // Default to 0
            min: 0, // Ensure non-negative values
        },

        // Flag to indicate soft deletion of the notification
        isDeleted: {
            type: Boolean,
            default: false, // Default to false
        },
    },
    {
        timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
    }
);

// Create the Notification model
const Notification = mongoose.model('Notification', notificationSchema);

// Export the model
module.exports = Notification;


// const mongoose = require('mongoose');

// // Define the schema for the Notification model
// const notificationSchema = new mongoose.Schema(
//     {
//         // Specifies the recipient of the notification
//         send_to: {
//             type: String,
//             enum: ['All', 'User', 'Admin'], // Allowed values
//             required: [true, 'Recipient type is required'], // Custom error message
//         },

//         // The message content of the notification
//         push_message: {
//             type: String,
//             required: [true, 'Push message is required'], // Custom error message
//         },

// departmentId: {
//     type: mongoose.Schema.Types.ObjectId,
//     default: null, // Null if no department is associated
// },

// department: {
//     type: String,
//     enum: ['EventBooking', 'RoomBooking', 'BanquetBooking', 'Offer', 'Event'], // Valid model names
//     required: false,
// },
//         // Optional image associated with the notification
//         image: {
//             type: String,
//             default: '', // Empty string by default
//         },

//         // Count of successfully delivered notifications
//         successCount: {
//             type: Number,
//             default: 0, // Default to 0
//             min: 0, // Ensure non-negative values
//         },

//         // Count of failed notification delivery attempts
//         failureCount: {
//             type: Number,
//             default: 0, // Default to 0
//             min: 0, // Ensure non-negative values
//         },

//         // Flag to indicate soft deletion of the notification
//         isDeleted: {
//             type: Boolean,
//             default: false, // Default to false
//         },
//     },
//     {
//         timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
//     }
// );

// // Create the Notification model
// const Notification = mongoose.model('Notification', notificationSchema);

// // Export the model
// module.exports = Notification;
