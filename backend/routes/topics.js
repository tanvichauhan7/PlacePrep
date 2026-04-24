const express = require('express');
const router = express.Router();
const Topic = require('../models/Topic');
const { protect } = require('../middleware/authMiddleware');

// GET /api/topics/:subjectId — get all topics for a subject
router.get('/:subjectId', protect, async (req, res) => {
  try {
    const topics = await Topic.find({ subject: req.params.subjectId, user: req.user._id }).sort('order');
    res.json(topics);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/topics/:subjectId — add a topic to a subject
router.post('/:subjectId', protect, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Topic name required' });
    const topic = await Topic.create({ user: req.user._id, subject: req.params.subjectId, name });
    res.status(201).json(topic);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/topics/:id/toggle — mark topic done/undone
router.patch('/:id/toggle', protect, async (req, res) => {
  try {
    const topic = await Topic.findOne({ _id: req.params.id, user: req.user._id });
    if (!topic) return res.status(404).json({ message: 'Topic not found' });
    topic.isCompleted = !topic.isCompleted;
    topic.completedAt = topic.isCompleted ? new Date() : null;
    await topic.save();
    res.json(topic);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/topics/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const topic = await Topic.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!topic) return res.status(404).json({ message: 'Topic not found' });
    res.json({ message: 'Topic deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
