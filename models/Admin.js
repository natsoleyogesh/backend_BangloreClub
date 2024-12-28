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

// Pre-save middleware to format the `name` field
adminSchema.pre('save', function (next) {
  if (this.name) {
    // Convert to title case (e.g., "OTHER Tax" → "Other Tax")
    this.name = this.name
      .toLowerCase() // Convert all to lowercase first
      .split(' ') // Split the name into words
      .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize the first letter of each word
      .join(' '); // Join words back with spaces
  }
  next();
});
// Export the Admin model
const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
