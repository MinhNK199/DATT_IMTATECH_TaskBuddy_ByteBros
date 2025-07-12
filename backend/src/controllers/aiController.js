import AIService from '../services/aiService.js';

class AIController {
    // Tạo lộ trình công việc AI
    async generateSchedule(req, res) {
        try {
            const userId = req.user.uid;
            const schedule = await AIService.generateTaskSchedule(userId);

            res.json({
                success: true,
                data: schedule
            });
        } catch (error) {
            console.error('Lỗi tạo lộ trình AI:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Lỗi tạo lộ trình công việc'
            });
        }
    }

    // Tạo insights năng suất
    async generateProductivityInsights(req, res) {
        try {
            const userId = req.user.uid;
            const { period = 30 } = req.query;

            const insights = await AIService.generateProductivityInsights(userId, parseInt(period));

            res.json({
                success: true,
                data: insights
            });
        } catch (error) {
            console.error('Lỗi tạo insights năng suất:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Lỗi tạo insights năng suất'
            });
        }
    }

    // Gợi ý tối ưu hóa
    async getOptimizationSuggestions(req, res) {
        try {
            const userId = req.user.uid;
            const { type = 'all' } = req.query;

            // Lấy lộ trình và insights
            const schedule = await AIService.generateTaskSchedule(userId);
            const insights = await AIService.generateProductivityInsights(userId);

            let suggestions = [];

            // Lọc theo loại gợi ý
            if (type === 'all' || type === 'schedule') {
                suggestions.push(...schedule.suggestions.filter(s => s.type === 'schedule'));
            }
            if (type === 'all' || type === 'priority') {
                suggestions.push(...schedule.suggestions.filter(s => s.type === 'priority'));
            }
            if (type === 'all' || type === 'optimization') {
                suggestions.push(...schedule.suggestions.filter(s => s.type === 'optimization'));
            }
            if (type === 'all' || type === 'break') {
                suggestions.push(...schedule.suggestions.filter(s => s.type === 'break'));
            }

            // Sắp xếp theo độ ưu tiên
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            suggestions.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

            res.json({
                success: true,
                data: {
                    suggestions,
                    schedule: schedule.schedule,
                    insights
                }
            });
        } catch (error) {
            console.error('Lỗi lấy gợi ý tối ưu hóa:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Lỗi lấy gợi ý tối ưu hóa'
            });
        }
    }

    // Phân tích workload
    async analyzeWorkload(req, res) {
        try {
            const userId = req.user.uid;
            const { period = 7 } = req.query; // Mặc định phân tích 7 ngày

            const schedule = await AIService.generateTaskSchedule(userId);
            
            // Phân tích workload
            const workloadAnalysis = {
                totalHours: schedule.totalHours,
                estimatedDays: schedule.estimatedDays,
                dailyAverage: Math.round((schedule.totalHours / schedule.estimatedDays) * 100) / 100,
                isOverloaded: schedule.totalHours > 40, // > 40h/tuần
                suggestions: schedule.suggestions.filter(s => s.type === 'schedule' || s.type === 'break')
            };

            res.json({
                success: true,
                data: workloadAnalysis
            });
        } catch (error) {
            console.error('Lỗi phân tích workload:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Lỗi phân tích workload'
            });
        }
    }

    // Gợi ý cải thiện năng suất
    async getProductivityRecommendations(req, res) {
        try {
            const userId = req.user.uid;
            const { focus = 'all' } = req.query;

            const insights = await AIService.generateProductivityInsights(userId);
            
            let recommendations = [];

            // Lọc theo focus area
            if (focus === 'all' || focus === 'time-management') {
                recommendations.push(...insights.filter(i => i.type === 'optimization'));
            }
            if (focus === 'all' || focus === 'focus') {
                recommendations.push(...insights.filter(i => i.type === 'productivity'));
            }
            if (focus === 'all' || focus === 'scheduling') {
                recommendations.push(...insights.filter(i => i.type === 'scheduling'));
            }

            // Thêm gợi ý chung
            if (focus === 'all') {
                recommendations.push({
                    type: 'recommendation',
                    insight: 'Sử dụng kỹ thuật Pomodoro để tăng hiệu suất tập trung',
                    priority: 'medium'
                });
                recommendations.push({
                    type: 'recommendation',
                    insight: 'Lập kế hoạch cho ngày tiếp theo vào cuối ngày hôm nay',
                    priority: 'low'
                });
            }

            // Sắp xếp theo độ ưu tiên
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            recommendations.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);

            res.json({
                success: true,
                data: recommendations
            });
        } catch (error) {
            console.error('Lỗi lấy gợi ý năng suất:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Lỗi lấy gợi ý năng suất'
            });
        }
    }
}

exports.suggestTasks = async (req, res) => {
    try {
        const userId = req.user.uid;
        const schedule = await AIService.generateTaskSchedule(userId);
        // Trả về các gợi ý task (nếu có)
        res.json({
            success: true,
            suggestions: schedule.suggestions || [],
            schedule: schedule.schedule || []
        });
    } catch (error) {
        console.error('Lỗi gợi ý task:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi gợi ý task'
        });
    }
};

exports.getPerformance = async (req, res) => {
    try {
        const userId = req.user.uid;
        const Task = require('../models/Task');
        const tasks = await Task.find({ userId });
        // Thống kê tổng hợp
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === 'completed').length;
        const overdueTasks = tasks.filter(t => t.status !== 'completed' && t.dueDate < new Date()).length;
        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        // Gợi ý AI
        const aiSuggestions = AIService.analyzePerformance(tasks);
        res.json({
            success: true,
            stats: {
                totalTasks,
                completedTasks,
                overdueTasks,
                completionRate: Math.round(completionRate * 100) / 100
            },
            suggestions: aiSuggestions
        });
    } catch (error) {
        console.error('Lỗi phân tích hiệu suất:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi phân tích hiệu suất'
        });
    }
};

exports.getReminders = async (req, res) => {
    try {
        const userId = req.user.uid;
        const Task = require('../models/Task');
        const now = new Date();
        const soon = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24h tới
        // Task sắp đến hạn (trong 24h tới, chưa completed)
        const dueSoon = await Task.find({
            userId,
            status: { $ne: 'completed' },
            dueDate: { $gte: now, $lte: soon }
        }).lean({ virtuals: true });
        // Task quá hạn
        const overdue = await Task.find({
            userId,
            status: { $ne: 'completed' },
            dueDate: { $lt: now }
        }).lean({ virtuals: true });
        // Task ưu tiên cao (high priority, chưa completed)
        const highPriority = await Task.find({
            userId,
            status: { $ne: 'completed' },
            priority: 'high'
        }).lean({ virtuals: true });
        res.json({
            success: true,
            reminders: {
                dueSoon,
                overdue,
                highPriority
            }
        });
    } catch (error) {
        console.error('Lỗi nhắc nhở thông minh:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi nhắc nhở thông minh'
        });
    }
};

exports.getSummary = async (req, res) => {
    try {
        const userId = req.user.uid;
        const Task = require('../models/Task');
        const { type = 'day' } = req.query; // 'day' hoặc 'week'
        const now = new Date();
        let start, end;
        if (type === 'week') {
            // Đầu tuần (thứ 2)
            start = new Date(now);
            start.setDate(now.getDate() - now.getDay() + 1);
            start.setHours(0, 0, 0, 0);
            end = new Date(start);
            end.setDate(start.getDate() + 6);
            end.setHours(23, 59, 59, 999);
        } else {
            // Mặc định: ngày hôm nay
            start = new Date(now);
            start.setHours(0, 0, 0, 0);
            end = new Date(now);
            end.setHours(23, 59, 59, 999);
        }
        // Task cần làm (chưa completed, trong khoảng thời gian)
        const todo = await Task.find({
            userId,
            status: { $ne: 'completed' },
            dueDate: { $gte: start, $lte: end }
        }).lean({ virtuals: true });
        // Task đã hoàn thành (trong khoảng thời gian)
        const done = await Task.find({
            userId,
            status: 'completed',
            completedAt: { $gte: start, $lte: end }
        }).lean({ virtuals: true });
        // Task quá hạn (chưa completed, deadline < now)
        const overdue = await Task.find({
            userId,
            status: { $ne: 'completed' },
            dueDate: { $lt: now }
        }).lean({ virtuals: true });
        res.json({
            success: true,
            summary: {
                type,
                todo,
                done,
                overdue
            }
        });
    } catch (error) {
        console.error('Lỗi tóm tắt công việc:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi tóm tắt công việc'
        });
    }
};

exports.analyzeTask = async (req, res) => {
    try {
        const { title, description, dueDate } = req.body;
        const suggestions = [];
        if (!title || title.trim().length < 5) {
            suggestions.push('Tiêu đề task quá ngắn hoặc chưa rõ ràng.');
        }
        if (!description || description.trim().length < 10) {
            suggestions.push('Nên bổ sung mô tả chi tiết cho task.');
        }
        if (!dueDate) {
            suggestions.push('Task chưa có deadline. Nên đặt ngày hoàn thành cụ thể.');
        } else if (new Date(dueDate) < new Date()) {
            suggestions.push('Deadline đã ở trong quá khứ. Hãy kiểm tra lại ngày hết hạn.');
        }
        if (suggestions.length === 0) {
            suggestions.push('Task đã đầy đủ thông tin cơ bản.');
        }
        res.json({
            success: true,
            suggestions
        });
    } catch (error) {
        console.error('Lỗi phân tích nội dung task:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi phân tích nội dung task'
        });
    }
};

export default new AIController(); 