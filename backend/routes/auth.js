const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Subject = require('../models/Subject');
const Topic = require('../models/Topic');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const DEFAULT_SUBJECTS = [
  { name: 'DSA', color: '#3266ad', topics: ['Arrays & Strings','Linked List','Stacks & Queues','Trees & BST','Heaps','Graphs (BFS/DFS)','DP Basics','DP Advanced','Greedy','Searching & Sorting','Backtracking','Bit Manipulation'] },
  { name: 'DBMS', color: '#1D9E75', topics: ['ER Model','Relational Model','SQL Basics','SQL Advanced (Joins)','Normalization (1NF-3NF)','BCNF','Transactions & ACID','Concurrency Control','Indexing & B-Trees','File Organization'] },
  { name: 'OS', color: '#BA7517', topics: ['Processes & Threads','CPU Scheduling','Deadlock','Memory Management','Paging & Segmentation','Virtual Memory','File Systems','Disk Scheduling','IPC','Synchronization (Mutex/Semaphore)'] },
  { name: 'Computer Networks', color: '#534AB7', topics: ['OSI Model','TCP/IP Model','Physical Layer','Data Link Layer','Network Layer','Transport Layer','Application Layer','TCP vs UDP','HTTP/HTTPS','DNS & DHCP','Routing Protocols','Error Detection/Correction'] },
  { name: 'OOPs / Java', color: '#993556', topics: ['Classes & Objects','Inheritance','Polymorphism','Abstraction','Encapsulation','Interfaces','Exception Handling','Collections Framework','Generics','Multithreading','Design Patterns'] },
  { name: 'Aptitude / Quant', color: '#73726c', topics: ['Number System','Percentages','Profit & Loss','Ratios & Proportions','Time & Work','Time & Distance','Permutations & Combinations','Probability','Series & Sequences','Logical Reasoning','Data Interpretation'] },
];

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields are required' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password });

    // Seed default subjects + topics for new user
    for (let i = 0; i < DEFAULT_SUBJECTS.length; i++) {
      const s = DEFAULT_SUBJECTS[i];
      const subject = await Subject.create({ user: user._id, name: s.name, color: s.color, order: i });
      const topicDocs = s.topics.map((t, idx) => ({ user: user._id, subject: subject._id, name: t, order: idx }));
      await Topic.insertMany(topicDocs);
    }

    res.status(201).json({ _id: user._id, name: user.name, email: user.email, token: generateToken(user._id) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });

    res.json({ _id: user._id, name: user.name, email: user.email, token: generateToken(user._id) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
