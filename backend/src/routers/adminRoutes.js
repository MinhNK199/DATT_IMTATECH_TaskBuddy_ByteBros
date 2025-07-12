const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, verifyAdmin } = require('../middleware/auth');

// Tất cả route này đều cần authenticateToken và verifyAdmin
router.get('/overview', authenticateToken, verifyAdmin, adminController.getOverview);
router.get('/tasks/statistics', authenticateToken, verifyAdmin, adminController.getTaskStatistics);
router.get('/tasks/by-user', authenticateToken, verifyAdmin, adminController.getTasksByUser);
router.get('/users', authenticateToken, verifyAdmin, adminController.getUsers);
router.get('/reports', authenticateToken, verifyAdmin, adminController.getReports);
router.get('/ai/aggregate', authenticateToken, verifyAdmin, adminController.getAIAggregate);

module.exports = router; 