const mongoose = require('mongoose');

const contactUsSchema = new mongoose.Schema({
    organizationName: {
        type: String,
        required: true,
    },
    address: {
        street: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: false,
        },
        postalCode: {
            type: String,
            required: true,
        },
        country: {
            type: String,
            required: true,
        },
    },
    phoneNumbers: [
        {
            type: String,
            required: true,
        },
    ],
    fax: {
        type: String,
        required: false,
    },
    email: {
        type: String,
        required: true,
        match: [/.+\@.+\..+/, 'Please enter a valid email address'],
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin', // Reference to the admin user who created/updated this
        required: true,
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });


// Middleware to format the name field to Title Case
contactUsSchema.pre("save", function (next) {
    if (this.organizationName) {
        this.organizationName = this.organizationName
            .toLowerCase()
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    }
    next();
});


const ContactUs = mongoose.model('ContactUs', contactUsSchema);

module.exports = ContactUs;
