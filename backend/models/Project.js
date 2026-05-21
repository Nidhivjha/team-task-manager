const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // This links the project to the User ID of the Admin who created it
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Project', ProjectSchema);