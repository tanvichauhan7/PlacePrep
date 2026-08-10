const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const Subject = require('../models/Subject');
const Topic = require('../models/Topic');
const Reminder = require('../models/Reminder');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// GET /api/stats — comprehensive statistics for overview panel
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all questions
    const questions = await Question.find({ user: userId });
    const practicedQuestions = questions.filter(q => q.isPracticed).length;

    // Questions by difficulty
    const questionsByDifficulty = {
      Easy: questions.filter(q => q.difficulty === 'Easy').length,
      Medium: questions.filter(q => q.difficulty === 'Medium').length,
      Hard: questions.filter(q => q.difficulty === 'Hard').length,
    };

    const practicedByDifficulty = {
      Easy: questions.filter(q => q.difficulty === 'Easy' && q.isPracticed).length,
      Medium: questions.filter(q => q.difficulty === 'Medium' && q.isPracticed).length,
      Hard: questions.filter(q => q.difficulty === 'Hard' && q.isPracticed).length,
    };

    // Questions by subject
    const questionsBySubject = {};
    const practicedBySubject = {};
    questions.forEach(q => {
      questionsBySubject[q.subject] = (questionsBySubject[q.subject] || 0) + 1;
      if (q.isPracticed) {
        practicedBySubject[q.subject] = (practicedBySubject[q.subject] || 0) + 1;
      }
    });

    // Get all subjects and topics
    const subjects = await Subject.find({ user: userId });
    const totalSubjects = subjects.length;
    const totalTopics = await Topic.countDocuments({ user: userId });
    const completedTopics = await Topic.countDocuments({ user: userId, isCompleted: true });

    // Get reminders
    const reminders = await Reminder.find({ user: userId });
    const pendingReminders = reminders.filter(r => !r.isDone).length;
    const completedReminders = reminders.filter(r => r.isDone).length;

    // Get user data
    const user = await User.findById(userId).select('-password');

    // Calculate recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentTopicsCompleted = await Topic.countDocuments({
      user: userId,
      isCompleted: true,
      completedAt: { $gte: sevenDaysAgo }
    });

    const recentQuestionsAdded = questions.filter(q => 
      new Date(q.createdAt) >= sevenDaysAgo
    ).length;

    const recentQuestionsPracticed = questions.filter(q => 
      q.isPracticed && new Date(q.updatedAt) >= sevenDaysAgo
    ).length;

    // Calculate study activity for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const topicsCompletedByDate = await Topic.aggregate([
      {
        $match: {
          user: userId,
          isCompleted: true,
          completedAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$completedAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Time to target
    let daysToTarget = null;
    if (user.targetDate) {
      const target = new Date(user.targetDate);
      const today = new Date();
      const diffTime = target - today;
      daysToTarget = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    res.json({
      overview: {
        totalSubjects,
        totalTopics,
        completedTopics,
        completionPercentage: totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0,
        currentStreak: user.streak || 0,
        maxStreak: user.maxStreak || 0,
        targetDate: user.targetDate,
        daysToTarget
      },
      questions: {
        total: questions.length,
        practiced: practicedQuestions,
        practicedPercentage: questions.length > 0 ? Math.round((practicedQuestions / questions.length) * 100) : 0,
        byDifficulty: questionsByDifficulty,
        practicedByDifficulty,
        bySubject: questionsBySubject,
        practicedBySubject
      },
      reminders: {
        total: reminders.length,
        pending: pendingReminders,
        completed: completedReminders
      },
      recentActivity: {
        topicsCompleted: recentTopicsCompleted,
        questionsAdded: recentQuestionsAdded,
        questionsPracticed: recentQuestionsPracticed
      },
      activityChart: topicsCompletedByDate.map(item => ({
        date: item._id,
        count: item.count
      }))
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
