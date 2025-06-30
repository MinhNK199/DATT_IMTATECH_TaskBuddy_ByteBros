import Task from '../models/Task.js';
import Report from '../models/Report.js';
import moment from 'moment';
import PDFDocument from 'pdfkit';

class ReportService {
    // Tạo báo cáo tổng hợp
    async generateReport(userId, type, startDate, endDate) {
        try {
            const tasks = await Task.find({
                userId,
                createdAt: { $gte: startDate, $lte: endDate }
            });

            const statistics = this.calculateStatistics(tasks);
            const categoryBreakdown = this.calculateCategoryBreakdown(tasks);
            const priorityBreakdown = this.calculatePriorityBreakdown(tasks);
            const dailyProgress = this.calculateDailyProgress(tasks, startDate, endDate);

            // Tạo AI insights
            const aiInsights = await this.generateAIInsights(tasks, statistics);
            const recommendations = this.generateRecommendations(statistics, categoryBreakdown, priorityBreakdown);

            // Lưu báo cáo vào database
            const report = new Report({
                userId,
                type,
                period: { startDate, endDate },
                statistics,
                categoryBreakdown,
                priorityBreakdown,
                dailyProgress,
                aiInsights,
                recommendations
            });

            await report.save();

            return report;
        } catch (error) {
            console.error('Lỗi tạo báo cáo:', error);
            throw new Error('Không thể tạo báo cáo');
        }
    }

    // Tính toán thống kê tổng hợp
    calculateStatistics(tasks) {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(task => task.status === 'completed').length;
        const inProgressTasks = tasks.filter(task => task.status === 'in_progress').length;
        const overdueTasks = tasks.filter(task => 
            task.status !== 'completed' && moment(task.dueDate).isBefore(moment())
        ).length;

        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        
        const totalEstimatedHours = tasks.reduce((sum, task) => sum + (task.estimatedHours || 1), 0);
        const totalActualHours = tasks.reduce((sum, task) => sum + (task.actualHours || 0), 0);
        
        const efficiency = totalEstimatedHours > 0 ? (totalActualHours / totalEstimatedHours) * 100 : 0;

        return {
            totalTasks,
            completedTasks,
            inProgressTasks,
            overdueTasks,
            completionRate: Math.round(completionRate * 100) / 100,
            totalEstimatedHours,
            totalActualHours,
            efficiency: Math.round(efficiency * 100) / 100
        };
    }

    // Tính toán breakdown theo category
    calculateCategoryBreakdown(tasks) {
        const categories = ['personal', 'work', 'study'];
        const breakdown = [];

        categories.forEach(category => {
            const categoryTasks = tasks.filter(task => task.category === category);
            const total = categoryTasks.length;
            const completed = categoryTasks.filter(task => task.status === 'completed').length;
            const completionRate = total > 0 ? (completed / total) * 100 : 0;

            breakdown.push({
                category,
                total,
                completed,
                completionRate: Math.round(completionRate * 100) / 100
            });
        });

        return breakdown;
    }

    // Tính toán breakdown theo priority
    calculatePriorityBreakdown(tasks) {
        const priorities = ['low', 'medium', 'high'];
        const breakdown = [];

        priorities.forEach(priority => {
            const priorityTasks = tasks.filter(task => task.priority === priority);
            const total = priorityTasks.length;
            const completed = priorityTasks.filter(task => task.status === 'completed').length;
            const completionRate = total > 0 ? (completed / total) * 100 : 0;

            breakdown.push({
                priority,
                total,
                completed,
                completionRate: Math.round(completionRate * 100) / 100
            });
        });

        return breakdown;
    }

    // Tính toán tiến độ hàng ngày
    calculateDailyProgress(tasks, startDate, endDate) {
        const dailyProgress = [];
        const currentDate = moment(startDate);
        const endMoment = moment(endDate);

        while (currentDate.isSameOrBefore(endMoment)) {
            const dateStr = currentDate.format('YYYY-MM-DD');
            const dayTasks = tasks.filter(task => 
                moment(task.createdAt).format('YYYY-MM-DD') === dateStr
            );

            const total = dayTasks.length;
            const completed = dayTasks.filter(task => task.status === 'completed').length;
            const inProgress = dayTasks.filter(task => task.status === 'in_progress').length;

            dailyProgress.push({
                date: currentDate.toDate(),
                total,
                completed,
                inProgress
            });

            currentDate.add(1, 'day');
        }

        return dailyProgress;
    }

    // Tạo AI insights
    async generateAIInsights(tasks, statistics) {
        const insights = [];

        // Insight về tỷ lệ hoàn thành
        if (statistics.completionRate < 70) {
            insights.push({
                type: 'productivity',
                insight: `Tỷ lệ hoàn thành task thấp (${statistics.completionRate}%). Cần cải thiện khả năng tập trung.`,
                priority: 'high'
            });
        } else if (statistics.completionRate > 90) {
            insights.push({
                type: 'productivity',
                insight: `Tỷ lệ hoàn thành task xuất sắc (${statistics.completionRate}%)! Hãy duy trì hiệu suất này.`,
                priority: 'low'
            });
        }

        // Insight về task quá hạn
        if (statistics.overdueTasks > 0) {
            insights.push({
                type: 'scheduling',
                insight: `Có ${statistics.overdueTasks} task quá hạn. Cần cải thiện khả năng ước tính thời gian.`,
                priority: 'high'
            });
        }

        // Insight về hiệu suất thời gian
        if (statistics.efficiency > 120) {
            insights.push({
                type: 'optimization',
                insight: 'Thời gian thực tế vượt quá ước tính nhiều. Cần cải thiện khả năng lập kế hoạch.',
                priority: 'medium'
            });
        } else if (statistics.efficiency < 80) {
            insights.push({
                type: 'optimization',
                insight: 'Hoàn thành task nhanh hơn dự kiến. Có thể tăng thêm khối lượng công việc.',
                priority: 'low'
            });
        }

        return insights;
    }

    // Tạo recommendations
    generateRecommendations(statistics, categoryBreakdown, priorityBreakdown) {
        const recommendations = [];

        // Recommendation về cân bằng category
        const maxCategory = categoryBreakdown.reduce((a, b) => 
            a.total > b.total ? a : b
        );
        const minCategory = categoryBreakdown.reduce((a, b) => 
            a.total < b.total ? a : b
        );

        if (maxCategory.total > minCategory.total * 2 && minCategory.total > 0) {
            recommendations.push({
                title: 'Cân bằng công việc',
                description: `Tăng cường task thuộc category "${minCategory.category}" để cân bằng cuộc sống.`,
                action: 'Thêm task mới',
                impact: 'medium'
            });
        }

        // Recommendation về priority
        const highPriorityTasks = priorityBreakdown.find(p => p.priority === 'high');
        if (highPriorityTasks && highPriorityTasks.completionRate < 80) {
            recommendations.push({
                title: 'Cải thiện ưu tiên',
                description: 'Tỷ lệ hoàn thành task ưu tiên cao thấp. Cần tập trung vào task quan trọng.',
                action: 'Sắp xếp lại priority',
                impact: 'high'
            });
        }

        // Recommendation về thời gian
        if (statistics.totalEstimatedHours > 40) {
            recommendations.push({
                title: 'Quản lý thời gian',
                description: 'Khối lượng công việc lớn. Cân nhắc chia nhỏ task hoặc ủy quyền.',
                action: 'Chia nhỏ task',
                impact: 'medium'
            });
        }

        return recommendations;
    }

    // Tạo PDF report
    async generatePDFReport(reportId) {
        try {
            const report = await Report.findById(reportId);
            if (!report) {
                throw new Error('Không tìm thấy báo cáo');
            }

            const doc = new PDFDocument();
            const chunks = [];

            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => Buffer.concat(chunks));

            // Header
            doc.fontSize(20).text('BÁO CÁO TASKBUDDY', { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).text(`Báo cáo ${report.type} - ${moment(report.period.startDate).format('DD/MM/YYYY')} đến ${moment(report.period.endDate).format('DD/MM/YYYY')}`, { align: 'center' });
            doc.moveDown(2);

            // Thống kê tổng hợp
            doc.fontSize(16).text('THỐNG KÊ TỔNG HỢP');
            doc.moveDown();
            doc.fontSize(10).text(`Tổng số task: ${report.statistics.totalTasks}`);
            doc.text(`Task hoàn thành: ${report.statistics.completedTasks}`);
            doc.text(`Task đang thực hiện: ${report.statistics.inProgressTasks}`);
            doc.text(`Task quá hạn: ${report.statistics.overdueTasks}`);
            doc.text(`Tỷ lệ hoàn thành: ${report.statistics.completionRate}%`);
            doc.moveDown();

            // Breakdown theo category
            doc.fontSize(14).text('PHÂN BỔ THEO DANH MỤC');
            doc.moveDown();
            report.categoryBreakdown.forEach(category => {
                doc.fontSize(10).text(`${category.category}: ${category.total} task (${category.completionRate}% hoàn thành)`);
            });
            doc.moveDown();

            // AI Insights
            if (report.aiInsights.length > 0) {
                doc.fontSize(14).text('GỢI Ý AI');
                doc.moveDown();
                report.aiInsights.forEach(insight => {
                    doc.fontSize(10).text(`• ${insight.insight}`);
                });
                doc.moveDown();
            }

            // Recommendations
            if (report.recommendations.length > 0) {
                doc.fontSize(14).text('KHUYẾN NGHỊ');
                doc.moveDown();
                report.recommendations.forEach(rec => {
                    doc.fontSize(10).text(`• ${rec.title}: ${rec.description}`);
                });
            }

            doc.end();

            return Buffer.concat(chunks);
        } catch (error) {
            console.error('Lỗi tạo PDF report:', error);
            throw new Error('Không thể tạo PDF report');
        }
    }

    // Lấy dashboard data
    async getDashboardData(userId) {
        try {
            const now = moment();
            const startOfWeek = now.clone().startOf('week');
            const startOfMonth = now.clone().startOf('month');

            // Thống kê tuần hiện tại
            const weeklyTasks = await Task.find({
                userId,
                createdAt: { $gte: startOfWeek.toDate() }
            });

            // Thống kê tháng hiện tại
            const monthlyTasks = await Task.find({
                userId,
                createdAt: { $gte: startOfMonth.toDate() }
            });

            // Task quá hạn
            const overdueTasks = await Task.find({
                userId,
                status: { $ne: 'completed' },
                dueDate: { $lt: now.toDate() }
            });

            // Task hôm nay
            const todayTasks = await Task.find({
                userId,
                dueDate: {
                    $gte: now.startOf('day').toDate(),
                    $lte: now.endOf('day').toDate()
                }
            });

            return {
                weekly: this.calculateStatistics(weeklyTasks),
                monthly: this.calculateStatistics(monthlyTasks),
                overdue: overdueTasks.length,
                today: todayTasks.length,
                recentTasks: await Task.find({ userId })
                    .sort({ createdAt: -1 })
                    .limit(5)
                    .select('title status dueDate priority')
            };
        } catch (error) {
            console.error('Lỗi lấy dashboard data:', error);
            throw new Error('Không thể lấy dữ liệu dashboard');
        }
    }
}

export default new ReportService(); 