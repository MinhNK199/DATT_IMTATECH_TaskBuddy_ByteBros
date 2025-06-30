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

export default new AIController(); 