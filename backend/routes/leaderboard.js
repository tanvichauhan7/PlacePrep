const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Subject = require('../models/Subject');
const Topic = require('../models/Topic');
const { protect } = require('../middleware/authMiddleware');

router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    const subjects = await Subject.find({ user: req.user._id });
    const subjectData = await Promise.all(subjects.map(async (s) => {
      const total = await Topic.countDocuments({ subject: s._id });
      const done = await Topic.countDocuments({ subject: s._id, isCompleted: true });
      return { name: s.name, color: s.color, total, done };
    }));
    res.json({ user, subjects: subjectData });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('name streak maxStreak studyLog createdAt');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const subjects = await Subject.find({ user: req.params.userId });
    const subjectData = await Promise.all(subjects.map(async (s) => {
      const total = await Topic.countDocuments({ subject: s._id });
      const done = await Topic.countDocuments({ subject: s._id, isCompleted: true });
      return { name: s.name, color: s.color, total, done };
    }));
    res.json({ user, subjects: subjectData });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;