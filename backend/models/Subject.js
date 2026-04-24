const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  color: { type: String, default: '#3266ad' },
  order: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Subject', subjectSchema);
