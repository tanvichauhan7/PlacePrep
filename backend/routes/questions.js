const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, async (req, res) => {
  try {
    const { subject, difficulty } = req.query;
    const filter = { user: req.user._id };
    if (subject) filter.subject = subject;
    if (difficulty) filter.difficulty = difficulty;
    const questions = await Question.find(filter).sort('-createdAt');
    res.json(questions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', protect, async (req, res) => {
  try {
    const { subject, question, answer, difficulty, company } = req.body;
    if (!subject || !question) return res.status(400).json({ message: 'Subject and question are required' });
    const q = await Question.create({ user: req.user._id, subject, question, answer, difficulty, company });
    res.status(201).json(q);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/:id/toggle', protect, async (req, res) => {
  try {
    const q = await Question.findOne({ _id: req.params.id, user: req.user._id });
    if (!q) return res.status(404).json({ message: 'Question not found' });
    q.isPracticed = !q.isPracticed;
    await q.save();
    res.json(q);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/:id', protect, async (req, res) => {
  try {
    const q = await Question.findOne({ _id: req.params.id, user: req.user._id });
    if (!q) return res.status(404).json({ message: 'Question not found' });
    const { question, answer, difficulty, company } = req.body;
    if (question !== undefined) q.question = question;
    if (answer !== undefined) q.answer = answer;
    if (difficulty !== undefined) q.difficulty = difficulty;
    if (company !== undefined) q.company = company;
    await q.save();
    res.json(q);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const q = await Question.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!q) return res.status(404).json({ message: 'Question not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;