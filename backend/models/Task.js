const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed'], // Task can only be in one of these states
    default: 'Pending'
  },
  dueDate: {
    type: Date
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project', // Links this task directly to a specific Project
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Links this task to the User ID of the team member working on it
  }
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);