const express = require('express');
const router = express.Router();
const Reminder = require('../models/Reminder');
const { protect } = require('../middleware/authMiddleware');

// GET /api/reminders
router.get('/', protect, async (req, res) => {
  try {
    const reminders = await Reminder.find({ user: req.user._id }).sort('-createdAt');
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/reminders
router.post('/', protect, async (req, res) => {
  try {
    const { text, subject, dueDate } = req.body;
    if (!text) return res.status(400).json({ message: 'Reminder text required' });
    const reminder = await Reminder.create({ user: req.user._id, text, subject, dueDate });
    res.status(201).json(reminder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/reminders/:id/toggle
router.patch('/:id/toggle', protect, async (req, res) => {
  try {
    const reminder = await Reminder.findOne({ _id: req.params.id, user: req.user._id });
    if (!reminder) return res.status(404).json({ message: 'Reminder not found' });
    reminder.isDone = !reminder.isDone;
    await reminder.save();
    res.json(reminder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/reminders/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!reminder) return res.status(404).json({ message: 'Reminder not found' });
    res.json({ message: 'Reminder deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
