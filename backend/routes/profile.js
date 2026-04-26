const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// GET /api/profile
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/profile — update name, targetDate, password
router.patch('/', protect, async (req, res) => {
  try {
    const { name, targetDate, password } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (targetDate !== undefined) user.targetDate = targetDate || null;
    if (password) {
      if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
      user.password = password;
    }

    await user.save();
    res.json({ _id: user._id, name: user.name, email: user.email, targetDate: user.targetDate, streak: user.streak, lastStudiedDate: user.lastStudiedDate });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/profile/streak — call this when user marks a topic done
router.post('/streak', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const last = user.lastStudiedDate ? new Date(user.lastStudiedDate) : null;
    if (last) last.setHours(0, 0, 0, 0);

    const isToday = last && last.getTime() === today.getTime();
    const isYesterday = last && (today - last) === 86400000;

    if (!isToday) {
      user.streak = isYesterday ? user.streak + 1 : 1;
      user.lastStudiedDate = new Date();
      await user.save();
    }

    res.json({ streak: user.streak, lastStudiedDate: user.lastStudiedDate });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;