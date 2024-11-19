// models/profileEditRequest.js

const mongoose = require('mongoose');

const profileRequestSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    dependentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null, // Only set if the request is for a family member
    },
    description: {
        type: String, // Stores a general description of the request
        required: true,
    },
    operation: {
        type: String,
        enum: ['edit', 'add', 'delete'], // Type of operation: 'edit' or 'add' or 'delete'
        required: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending',
    },
    adminResponse: {
        type: String,
        default: '',
    },
}, { timestamps: true });

const ProfileRequest = mongoose.model('profileRequest', profileRequestSchema);

module.exports = ProfileRequest;
