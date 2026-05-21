const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true // This prevents two people from signing up with the same email
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['Admin', 'Member'], // The role MUST be one of these two values
    default: 'Member'          // If not specified, they are a regular Member
  }
}, { timestamps: true }); // Automatically adds createdAt and updatedAt timestamps for us

module.exports = mongoose.model('User', UserSchema);