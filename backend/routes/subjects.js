const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');
const Topic = require('../models/Topic');
const { protect } = require('../middleware/authMiddleware');

// GET /api/subjects — get all subjects with topic counts
router.get('/', protect, async (req, res) => {
  try {
    const subjects = await Subject.find({ user: req.user._id }).sort('order');
    const result = await Promise.all(subjects.map(async (s) => {
      const total = await Topic.countDocuments({ subject: s._id });
      const done = await Topic.countDocuments({ subject: s._id, isCompleted: true });
      return { ...s.toObject(), totalTopics: total, completedTopics: done };
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/subjects — add a new subject
router.post('/', protect, async (req, res) => {
  try {
    const { name, color } = req.body;
    if (!name) return res.status(400).json({ message: 'Subject name required' });
    const subject = await Subject.create({ user: req.user._id, name, color: color || '#3266ad' });
    res.status(201).json(subject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/subjects/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const subject = await Subject.findOne({ _id: req.params.id, user: req.user._id });
    if (!subject) return res.status(404).json({ message: 'Subject not found' });
    await Topic.deleteMany({ subject: subject._id });
    await subject.deleteOne();
    res.json({ message: 'Subject deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
