const mongoose = require('mongoose');

const codeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title for your code snippet'],
      trim: true,
      default: 'Untitled Workspace',
    },
    language: {
      type: String,
      required: [true, 'Please specify a programming language'],
      default: 'javascript',
    },
    code: {
      type: String,
      default: '// Write your code here...',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    roomId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Code', codeSchema);