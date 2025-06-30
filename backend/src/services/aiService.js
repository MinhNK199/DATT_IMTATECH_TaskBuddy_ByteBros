import Task from '../models/Task.js';
import moment from 'moment';

class AIService {
    // Gợi ý lộ trình công việc tối ưu
    async generateTaskSchedule(userId) {
        try {
            // Lấy tất cả task chưa hoàn thành
            const tasks = await Task.find({
                userId,
                status: { $ne: 'completed' }
            }).sort({ dueDate: 1, priority: -1 });

            if (tasks.length === 0) {
                return {
                    suggestions: [],
                    message: 'Không có task nào cần sắp xếp'
                };
            }

            const suggestions = [];
            const schedule = [];
            let totalHours = 0;
            const maxDailyHours = 8; // Giả sử làm việc 8h/ngày

            // Phân tích và sắp xếp task theo độ ưu tiên
            const prioritizedTasks = this.prioritizeTasks(tasks);
            
            // Tạo lộ trình hàng ngày
            let currentDate = moment().startOf('day');
            let dailyHours = 0;

            for (const task of prioritizedTasks) {
                const taskHours = task.estimatedHours || 1;
                
                // Kiểm tra nếu task quá hạn
                if (moment(task.dueDate).isBefore(currentDate)) {
                    suggestions.push({
                        type: 'priority',
                        suggestion: `Task "${task.title}" đã quá hạn. Cần ưu tiên hoàn thành ngay.`,
                        priority: 'high'
                    });
                }

                // Kiểm tra nếu vượt quá giờ làm việc hàng ngày
                if (dailyHours + taskHours > maxDailyHours) {
                    suggestions.push({
                        type: 'schedule',
                        suggestion: `Ngày ${currentDate.format('DD/MM/YYYY')} có thể quá tải. Cân nhắc chuyển task "${task.title}" sang ngày khác.`,
                        priority: 'medium'
                    });
                    
                    // Chuyển sang ngày tiếp theo
                    currentDate.add(1, 'day');
                    dailyHours = 0;
                }

                schedule.push({
                    taskId: task._id,
                    title: task.title,
                    date: currentDate.format('YYYY-MM-DD'),
                    hours: taskHours,
                    priority: task.priority
                });

                dailyHours += taskHours;
                totalHours += taskHours;
            }

            // Phân tích hiệu suất và đưa ra gợi ý
            const performanceSuggestions = this.analyzePerformance(tasks);
            suggestions.push(...performanceSuggestions);

            // Gợi ý nghỉ ngơi
            if (totalHours > 40) { // Nếu tổng thời gian > 40h/tuần
                suggestions.push({
                    type: 'break',
                    suggestion: 'Lịch trình khá dày đặc. Cân nhắc thêm thời gian nghỉ ngơi để tránh kiệt sức.',
                    priority: 'medium'
                });
            }

            return {
                schedule,
                suggestions,
                totalHours,
                estimatedDays: Math.ceil(totalHours / maxDailyHours)
            };
        } catch (error) {
            console.error('Lỗi tạo lộ trình AI:', error);
            throw new Error('Không thể tạo lộ trình công việc');
        }
    }

    // Sắp xếp task theo độ ưu tiên
    prioritizeTasks(tasks) {
        return tasks.sort((a, b) => {
            // Điểm ưu tiên dựa trên deadline và priority
            const aScore = this.calculatePriorityScore(a);
            const bScore = this.calculatePriorityScore(b);
            return bScore - aScore;
        });
    }

    // Tính điểm ưu tiên cho task
    calculatePriorityScore(task) {
        const now = moment();
        const dueDate = moment(task.dueDate);
        const daysUntilDue = dueDate.diff(now, 'days');
        
        // Điểm priority
        const priorityScores = { high: 3, medium: 2, low: 1 };
        const priorityScore = priorityScores[task.priority] || 2;
        
        // Điểm urgency (càng gần deadline càng cao)
        const urgencyScore = Math.max(0, 10 - daysUntilDue);
        
        // Điểm category (work > study > personal)
        const categoryScores = { work: 3, study: 2, personal: 1 };
        const categoryScore = categoryScores[task.category] || 1;
        
        return priorityScore + urgencyScore + categoryScore;
    }

    // Phân tích hiệu suất và đưa ra gợi ý
    analyzePerformance(tasks) {
        const suggestions = [];
        
        // Phân tích theo category
        const categoryStats = {};
        tasks.forEach(task => {
            if (!categoryStats[task.category]) {
                categoryStats[task.category] = { count: 0, totalHours: 0 };
            }
            categoryStats[task.category].count++;
            categoryStats[task.category].totalHours += task.estimatedHours || 1;
        });

        // Gợi ý cân bằng category
        const categories = Object.keys(categoryStats);
        if (categories.length > 1) {
            const maxCategory = categories.reduce((a, b) => 
                categoryStats[a].count > categoryStats[b].count ? a : b
            );
            const minCategory = categories.reduce((a, b) => 
                categoryStats[a].count < categoryStats[b].count ? a : b
            );
            
            if (categoryStats[maxCategory].count > categoryStats[minCategory].count * 2) {
                suggestions.push({
                    type: 'optimization',
                    suggestion: `Cân nhắc thêm task thuộc category "${minCategory}" để cân bằng công việc.`,
                    priority: 'low'
                });
            }
        }

        // Phân tích deadline
        const overdueTasks = tasks.filter(task => 
            moment(task.dueDate).isBefore(moment())
        );
        
        if (overdueTasks.length > 0) {
            suggestions.push({
                type: 'priority',
                suggestion: `Có ${overdueTasks.length} task quá hạn. Cần ưu tiên hoàn thành các task này trước.`,
                priority: 'high'
            });
        }

        // Phân tích workload
        const totalHours = tasks.reduce((sum, task) => sum + (task.estimatedHours || 1), 0);
        if (totalHours > 50) {
            suggestions.push({
                type: 'optimization',
                suggestion: 'Khối lượng công việc khá lớn. Cân nhắc chia nhỏ task hoặc ủy quyền.',
                priority: 'medium'
            });
        }

        return suggestions;
    }

    // Gợi ý cải thiện năng suất
    async generateProductivityInsights(userId, period = 30) {
        try {
            const startDate = moment().subtract(period, 'days');
            
            const tasks = await Task.find({
                userId,
                createdAt: { $gte: startDate.toDate() }
            });

            const insights = [];
            
            // Tính tỷ lệ hoàn thành
            const completedTasks = tasks.filter(task => task.status === 'completed');
            const completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;
            
            if (completionRate < 70) {
                insights.push({
                    type: 'productivity',
                    insight: `Tỷ lệ hoàn thành task thấp (${completionRate.toFixed(1)}%). Cần cải thiện khả năng tập trung và quản lý thời gian.`,
                    priority: 'high'
                });
            }

            // Phân tích thời gian thực tế vs ước tính
            const tasksWithTime = completedTasks.filter(task => task.actualHours > 0);
            if (tasksWithTime.length > 0) {
                const avgEstimated = tasksWithTime.reduce((sum, task) => sum + (task.estimatedHours || 1), 0) / tasksWithTime.length;
                const avgActual = tasksWithTime.reduce((sum, task) => sum + task.actualHours, 0) / tasksWithTime.length;
                
                if (avgActual > avgEstimated * 1.5) {
                    insights.push({
                        type: 'optimization',
                        insight: 'Thời gian thực tế thường vượt quá ước tính. Cần cải thiện khả năng ước tính thời gian.',
                        priority: 'medium'
                    });
                }
            }

            // Phân tích theo thời gian trong ngày
            const hourlyStats = {};
            completedTasks.forEach(task => {
                const hour = moment(task.completedAt).hour();
                hourlyStats[hour] = (hourlyStats[hour] || 0) + 1;
            });
            
            const peakHour = Object.keys(hourlyStats).reduce((a, b) => 
                hourlyStats[a] > hourlyStats[b] ? a : b
            );
            
            insights.push({
                type: 'recommendation',
                insight: `Bạn hoàn thành nhiều task nhất vào lúc ${peakHour}:00. Cân nhắc sắp xếp task quan trọng vào thời gian này.`,
                priority: 'low'
            });

            return insights;
        } catch (error) {
            console.error('Lỗi tạo insights năng suất:', error);
            throw new Error('Không thể tạo insights năng suất');
        }
    }
}

export default new AIService(); 