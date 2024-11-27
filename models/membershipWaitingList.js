const mongoose = require("mongoose");

// Define the membership waiting list schema
const membershipWaitingListSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        match: [
            /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
            "Please provide a valid email address",
        ],
    },
    mobileNumber: {
        type: String,
        trim: true,
        match: [
            /^[0-9]{10}$/,
            "Please provide a valid mobile number",
        ],
    },
    applicationId: {
        type: String,
        required: true,
        unique: true,
    },
    applicationStatus: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending',
    },
    relation: {
        type: String,
        required: true,
    },
    parentUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null, // Null for top-level primary user
    },
    sponsoredBy: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // Reference to the User schema
        }
    ],
    address: {
        type: String,
        default: "",
    },
    address1: {
        type: String,
        default: "",
    },
    address2: {
        type: String,
        default: "",
    },
    city: {
        type: String,
        default: "",
    },
    state: {
        type: String,
        default: "",
    },
    country: {
        type: String,
        default: "",
    },
    pin: {
        type: String,
        match: [
            /^[0-9]{5,10}$/,
            "Please provide a valid pin code",
        ],
        default: "",
    },
    age: {
        type: Number,
        default: null,
    },
    dateOfBirth: {
        type: Date,
        default: null,
    },
    maritalStatus: {
        type: String,
        enum: ['Single', 'Married', 'Divorced', 'Widowed'],
        default: 'Single',
    },
    marriageDate: {
        type: Date,
        default: null,
    },
    title: {
        type: String,
        enum: ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.', 'Other'],
        default: 'Mr.',
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active',
    },
    activatedDate: {
        type: Date,
        default: null, // Null when user is not active
    },
    profilePicture: {
        type: String,
        default: "", // Default value is an empty string
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

const MembershipWaitingList = mongoose.model("membershipWaitingList", membershipWaitingListSchema);
module.exports = MembershipWaitingList;
