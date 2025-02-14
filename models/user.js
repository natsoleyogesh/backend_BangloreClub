
const mongoose = require("mongoose");

// Define the user schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
    },
    email: {
        type: String,
        // required: [true, "Email is required"],
        // unique: true,
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
    email2: {
        type: String,
        // required: [true, "Email is required"],
        // unique: true,
        lowercase: true,
        default: ""
    },
    mobileNumber2: {
        type: String,
        trim: true,
        default: ""
    },
    otp: {
        type: String,
        default: null,
    },
    memberId: {
        type: String,
        required: true,
        unique: true,
    },
    relation: {
        type: String,
        enum: ["Primary", "Spouse", "Child", "Senior Dependent", "Dependent", "Senior Dependent Spouse", "Dependent Spouse",], //"Daughter", "Son",
        required: true,
    },
    parentUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null, // Null for top-level primary user
    },
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
        // enum: ['Single', 'Married', 'Divorced', 'Widowed', "Widower"],
        default: 'Single',
    },
    marriageDate: {
        type: Date,
        default: null,
    },
    title: {
        type: String,
        // enum: ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Prof.', 'Other'],
        default: 'Mr.',
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active',
    },
    activatedDate: {
        type: Date,
        // default: null, // Null when user is not active
        default: Date.now,
    },
    profilePicture: {
        type: String,
        default: "", // Default value is an empty string
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    fcmToken: {
        type: String,
        default: ""
    },
    lastLogin: {
        type: Date,
        default: Date.now,
    },
    // New fields added
    vehicleNumber: {
        type: String,
        match: [
            /^[A-Za-z0-9- ]{5,15}$/,
            "Please provide a valid vehicle number",
        ],
        default: "",
    },
    vehicleModel: {
        type: String,
        default: "",
    },
    drivingLicenceNumber: {
        type: String,
        match: [
            /^[A-Za-z0-9-]{5,20}$/,
            "Please provide a valid driving licence number",
        ],
        default: "",
    },
    uploadProofs: [
        {
            type: String,
            validate: {
                validator: function (v) {
                    return v.length > 10; // Maximum 10 files
                },
                message: "You can upload a maximum of 10 files",
            },
            default: [],
        },
    ],
    creditStop: {
        type: Boolean,
        default: false
        // enum: ['Yes', 'No'],
        // default: 'No'
    },
    creditLimit: {
        type: Number,
        default: 0
    },
    qrCodeId: {
        type: String, // QR code containing all booking details
        required: false,
        default: ""
    },
    qrCode: {
        type: String,
        required: false,
        default: "",
        // unique: true,
    },
    cardId: {
        type: String,
        default: ""
    },
    qrGenratedDate: {
        type: Date,
        // default: null, // Null when user is not active
        default: Date.now,
    },

}, { timestamps: true });

const User = mongoose.model("User", userSchema);
module.exports = User;
