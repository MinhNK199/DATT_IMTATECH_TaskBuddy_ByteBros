const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticateToken } = require('../middleware/auth');

router.get('/suggest-tasks', authenticateToken, aiController.suggestTasks);
router.get('/performance', authenticateToken, aiController.getPerformance);
router.get('/reminders', authenticateToken, aiController.getReminders);
router.get('/summary', authenticateToken, aiController.getSummary);
router.post('/analyze-task', authenticateToken, aiController.analyzeTask);

module.exports = router; 