const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'model'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const ChatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  language: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    required: true,
  },
  prompt: {
    type: String,
    required: true,
  },
  // Stores the original structured JSON response from Gemini
  response: {
    code: String,
    comments: String,
    explanation: String,
    algorithm: String,
    complexity: {
      time: String,
      space: String,
    },
    flowchart: String,
    alternative: String,
  },
  messages: [MessageSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Chat', ChatSchema);
