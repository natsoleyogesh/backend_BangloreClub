// // models/profileEditRequest.js

// const mongoose = require('mongoose');

// const allRequestSchema = new mongoose.Schema({
//     primaryMemberId: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//         required: true,
//     },
//     departmentId: {
//         type: mongoose.Schema.Types.ObjectId,
//         refPath: 'department', // Dynamic reference based on the `department` field
//         default: null, // Null if no department is associated
//         required: function () {
//             // departmentId is required unless department is 'All', 'Offer', or 'Event'
//             return !['All'].includes(this.department);
//         },
//     },
//     department: {
//         type: String,
//         enum: ['eventBooking', 'RoomBooking', 'BanquetBooking'], // Valid model names
//         required: [true, 'Department is required'],
//     },
//     description: {
//         type: String, // Stores a general description of the request
//         required: true,
//     },
//     status: {
//         type: String,
//         enum: ['Pending', 'Confimed', 'Cancelled'],
//         default: 'Pending',
//     },
//     adminResponse: {
//         type: String,
//         default: '',
//     },
//     isDeleted: {
//         type: Boolean,
//         default: false
//     },
// }, { timestamps: true });

// const AllRequest = mongoose.model('allRequest', allRequestSchema);

// module.exports = AllRequest;


// models/allRequest.js

const mongoose = require('mongoose');

const allRequestSchema = new mongoose.Schema(
    {
        primaryMemberId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        departmentId: {
            type: mongoose.Schema.Types.ObjectId,
            refPath: 'department',
            default: null,
            required: function () {
                return !['All'].includes(this.department);
            },
        },
        department: {
            type: String,
            enum: ['eventBooking', 'RoomBooking', 'BanquetBooking', 'profileRequest'],
            required: [true, 'Department is required'],
        },
        description: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['Pending', 'Confirmed', 'Cancelled'],
            default: 'Pending',
        },
        adminResponse: {
            type: String,
            default: '',
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

const AllRequest = mongoose.model('AllRequest', allRequestSchema);
module.exports = AllRequest;
