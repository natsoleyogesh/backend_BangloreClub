const mongoose = require("mongoose");
// Define the membership list schema based on the provided Excel file
const membershipListSchema = new mongoose.Schema({
    applicationNumber: {
        type: String,
        required: [true, "Application number is required"],
        unique: true,
        trim: true,
    },
    applicationDate: {
        type: Date,
        required: [true, "Application date is required"],
    },
    applicantName: {
        type: String,
        required: [true, "Applicant's name is required"],
        trim: true,
    },
    proposer: {
        name: {
            type: String,
            required: [true, "Proposer name is required"],
        },
        accountNumber: {
            type: String,
            required: [true, "Proposer account number is required"],
        },
    },
    seconders: [
        {
            name: {
                type: String,
                required: [true, "Seconder name is required"],
            },
            accountNumber: {
                type: String,
                required: [true, "Seconder account number is required"],
            },
        }
    ],
    additionalInfo: {
        address: {
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
        pinCode: {
            type: String,
            match: [
                /^[0-9]{5,10}$/,
                "Please provide a valid pin code",
            ],
            default: "",
        },
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });

const MembershipList = mongoose.model("MembershipList", membershipListSchema);
module.exports = MembershipList;
