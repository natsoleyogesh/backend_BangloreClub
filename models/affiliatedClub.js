const mongoose = require('mongoose');

// Define Mongoose Schema for Affiliated Clubs
const affiliatedClubSchema = new mongoose.Schema(
    {
        affiliateClubNo: {
            type: String,
            required: true,
            trim: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            default: "",
            trim: true,
        },
        faxNumber: {
            type: String,
            default: "",
            trim: true,
        },
        phoneNumber1: {
            type: String,
            default: "",
            trim: true,
        },
        phoneNumber2: {
            type: String,
            default: "",
            trim: true,
        },
        affiliateDate: {
            type: Date,
            default: null,
        },
        deaffiliateDate: {
            type: Date,
            default: null,
        },
        cityOther: {
            type: String,
            default: "",
            trim: true,
        },
        addr1: {
            type: String,
            default: "",
            trim: true,
        },
        addr2: {
            type: String,
            default: "",
            trim: true,
        },
        addr3: {
            type: String,
            default: "",
            trim: true,
        },
        cityDescription: {
            type: String,
            default: "",
            trim: true,
        },
        pin: {
            type: String,
            default: "",
            trim: true,
        },
        stateDescription: {
            type: String,
            default: "",
            trim: true,
        },
        countryDescription: {
            type: String,
            default: "",
            trim: true,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

const AffiliateClub = mongoose.model('AffiliateClub', affiliatedClubSchema);

module.exports = AffiliateClub;
