import { admin } from "../config/database.js";

// Middleware xác thực Firebase token
export const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access token không được cung cấp'
            });
        }

        // Xác thực token với Firebase
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            displayName: decodedToken.name || decodedToken.email.split('@')[0]
        };

        next();
    } catch (error) {
        console.error('Lỗi xác thực token:', error);
        return res.status(403).json({
            success: false,
            message: 'Token không hợp lệ hoặc đã hết hạn'
        });
    }
};

// Middleware kiểm tra quyền truy cập task
export const checkTaskOwnership = async (req, res, next) => {
    try {
        const { taskId } = req.params;
        const userId = req.user.uid;

        const Task = (await import('../models/Task.js')).default;
        const task = await Task.findOne({ _id: taskId, userId });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy task hoặc không có quyền truy cập'
            });
        }

        req.task = task;
        next();
    } catch (error) {
        console.error('Lỗi kiểm tra quyền sở hữu task:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
};

// Middleware kiểm tra quyền truy cập report
export const checkReportOwnership = async (req, res, next) => {
    try {
        const { reportId } = req.params;
        const userId = req.user.uid;

        const Report = (await import('../models/Report.js')).default;
        const report = await Report.findOne({ _id: reportId, userId });

        if (!report) {
            return res.status(404).json({
                success: false,
                message: 'Không tìm thấy report hoặc không có quyền truy cập'
            });
        }

        req.report = report;
        next();
    } catch (error) {
        console.error('Lỗi kiểm tra quyền sở hữu report:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi server'
        });
    }
}; 