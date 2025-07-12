import express from 'express';
import taskRoutes from './taskRoutes.js';
import aiRoutes from './aiRoutes.js';
import reportRoutes from './reportRoutes.js';
import userRoutes from './userRoutes.js';
import authRoutes from './authRoutes.js';
const adminRoutes = require('./adminRoutes');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'TaskBuddy API đang hoạt động',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// API routes
router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);
router.use('/ai', aiRoutes);
router.use('/reports', reportRoutes);
router.use('/users', userRoutes);
router.use('/admin', adminRoutes);

export default router;