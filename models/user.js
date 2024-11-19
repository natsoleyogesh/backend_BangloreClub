// const mongoose = require("mongoose");

// // Define the user schema for both primary users and family members
// const userSchema = new mongoose.Schema(
//     {
//         name: {
//             type: String,
//             required: [true, "Name is required"],
//             trim: true,
//         },
//         email: {
//             type: String,
//             required: [true, "Email is required"],
//             unique: true,
//             lowercase: true,
//             match: [
//                 /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
//                 "Please provide a valid email address",
//             ],
//         },
//         mobileNumber: {
//             type: String,
//             trim: true,
//             match: [
//                 /^[0-9]{10}$/,
//                 "Please provide a valid mobile number",
//             ],
//         },
//         memberId: {
//             type: String,
//             required: true,
//             unique: true,
//         },
//         otp: {
//             type: String,
//             default: null,
//         },
//         isDeleted: {
//             type: Boolean,
//             default: false,
//         },
//         lastLogin: {
//             type: Date,
//             default: Date.now,
//         },
//         // Link to the primary user (for family members)
//         primaryUserId: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "User",
//             default: null, // Null for primary users, primaryUserId for family members
//         },
//         relation: {
//             type: String,
//             // enum: ["Primary", "Spouse", "Child"],
//             required: true,
//         },
//         age: {
//             type: Number,
//             default: null
//             // required: function () {
//             //     return this.relation === "Child";
//             // },
//             // validate: {
//             //     validator: function (value) {
//             //         return value >= 18;
//             //     },
//             //     message: "Children must be above 18 years old",
//             // },
//         },
//         address: {
//             type: String,
//             default: ""
//         }
//     },
//     { timestamps: true }
// );

// // Indexes for email and memberId
// userSchema.index({ email: 1 });
// userSchema.index({ memberId: 1 });

// const User = mongoose.model("User", userSchema);
// module.exports = User;

//----------------------------------- current code to runing code ------------------------------------------------

// const mongoose = require("mongoose");

// // Define the user schema for both primary users and family members
// const userSchema = new mongoose.Schema(
//     {
//         name: {
//             type: String,
//             required: [true, "Name is required"],
//             trim: true,
//         },
//         email: {
//             type: String,
//             required: [true, "Email is required"],
//             unique: true,
//             lowercase: true,
//             match: [
//                 /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
//                 "Please provide a valid email address",
//             ],
//         },
//         mobileNumber: {
//             type: String,
//             trim: true,
//             match: [
//                 /^[0-9]{10}$/,
//                 "Please provide a valid mobile number",
//             ],
//         },
//         memberId: {
//             type: String,
//             required: true,
//             unique: true,
//         },
// otp: {
//     type: String,
//     default: null,
// },
//         isDeleted: {
//             type: Boolean,
//             default: false,
//         },
//         lastLogin: {
//             type: Date,
//             default: Date.now,
//         },
//         // Link to the primary user (for family members)
//         primaryUserId: {
//             type: mongoose.Schema.Types.ObjectId,
//             ref: "User",
//             default: null, // Null for primary users, primaryUserId for family members
//         },
//         relation: {
//             type: String,
//             required: true,
//         },
//         age: {
//             type: Number,
//             default: null,
//         },
//         address: {
//             type: String,
//             default: ""
//         },
//         profilePicture: {
//             type: String, // Stores the URL of the profile picture
//             default: null, // Default is null if no profile picture is uploaded
//         }
//     },
//     { timestamps: true }
// );

// // Indexes for email and memberId
// userSchema.index({ email: 1 });
// userSchema.index({ memberId: 1 });

// const User = mongoose.model("User", userSchema);
// module.exports = User;

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
        required: true,
    },
    parentUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null, // Null for top-level primary user
    },
    address: {
        type: String,
        default: ""
    },
    age: {
        type: Number,
        default: null,
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
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
    lastLogin: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
module.exports = User;
