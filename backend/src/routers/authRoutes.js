import express from 'express';
import authController from '../controllers/authController.js';
import { validateAuth } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Đăng ký
router.post('/register', validateAuth.register, authController.register);

// Đăng nhập
router.post('/login', validateAuth.login, authController.login);

// Đăng nhập với Google
router.post('/google', validateAuth.googleLogin, authController.googleLogin);

// Đăng xuất (cần authentication)
router.post('/logout', authenticateToken, authController.logout);

// Refresh token
router.post('/refresh', validateAuth.refreshToken, authController.refreshToken);

// Kiểm tra trạng thái đăng nhập
router.get('/check', authenticateToken, authController.checkAuth);

export default router; 