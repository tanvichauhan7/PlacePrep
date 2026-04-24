const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  subject: { type: String, default: '' },
  isDone: { type: Boolean, default: false },
  dueDate: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Reminder', reminderSchema);
