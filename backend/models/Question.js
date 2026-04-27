const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  question: { type: String, required: true },
  answer: { type: String, default: '' },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  isPracticed: { type: Boolean, default: false },
  company: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);