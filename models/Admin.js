const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['admin', 'gatekeeper', 'eventManagement'],
      default: '',
      required: true
    },
    isDeleted: { type: Boolean, default: false },
    lastLogin: { type: Date, default: null },
  },
  { timestamps: true }
);

// Export the Admin model
const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
