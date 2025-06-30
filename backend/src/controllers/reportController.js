import ReportService from '../services/reportService.js';
import Report from '../models/Report.js';

class ReportController {
    // Tạo báo cáo mới
    async createReport(req, res) {
        try {
            const userId = req.user.uid;
            const { type, startDate, endDate } = req.body;

            const report = await ReportService.generateReport(
                userId,
                type,
                new Date(startDate),
                new Date(endDate)
            );

            res.status(201).json({
                success: true,
                message: 'Tạo báo cáo thành công',
                data: report
            });
        } catch (error) {
            console.error('Lỗi tạo báo cáo:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Lỗi tạo báo cáo'
            });
        }
    }

    // Lấy danh sách báo cáo
    async getReports(req, res) {
        try {
            const userId = req.user.uid;
            const { page = 1, limit = 10, type } = req.query;

            const query = { userId };
            if (type) query.type = type;

            const skip = (page - 1) * limit;

            const reports = await Report.find(query)
                .sort({ generatedAt: -1 })
                .skip(skip)
                .limit(parseInt(limit));

            const total = await Report.countDocuments(query);

            res.json({
                success: true,
                data: reports,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Lỗi lấy danh sách báo cáo:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    }

    // Lấy chi tiết báo cáo
    async getReport(req, res) {
        try {
            const report = req.report;
            res.json({
                success: true,
                data: report
            });
        } catch (error) {
            console.error('Lỗi lấy chi tiết báo cáo:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    }

    // Tạo PDF báo cáo
    async generatePDFReport(req, res) {
        try {
            const { reportId } = req.params;
            const userId = req.user.uid;

            // Kiểm tra quyền truy cập
            const report = await Report.findOne({ _id: reportId, userId });
            if (!report) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy báo cáo'
                });
            }

            const pdfBuffer = await ReportService.generatePDFReport(reportId);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=report-${reportId}.pdf`);
            res.send(pdfBuffer);
        } catch (error) {
            console.error('Lỗi tạo PDF báo cáo:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Lỗi tạo PDF báo cáo'
            });
        }
    }

    // Lấy dữ liệu dashboard
    async getDashboardData(req, res) {
        try {
            const userId = req.user.uid;
            const dashboardData = await ReportService.getDashboardData(userId);

            res.json({
                success: true,
                data: dashboardData
            });
        } catch (error) {
            console.error('Lỗi lấy dữ liệu dashboard:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Lỗi lấy dữ liệu dashboard'
            });
        }
    }

    // Tạo báo cáo nhanh (tuần/tháng hiện tại)
    async generateQuickReport(req, res) {
        try {
            const userId = req.user.uid;
            const { type = 'weekly' } = req.query;

            let startDate, endDate;
            const now = new Date();

            if (type === 'weekly') {
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
                endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 6);
            } else if (type === 'monthly') {
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            } else {
                return res.status(400).json({
                    success: false,
                    message: 'Loại báo cáo không hợp lệ'
                });
            }

            const report = await ReportService.generateReport(userId, type, startDate, endDate);

            res.json({
                success: true,
                message: 'Tạo báo cáo nhanh thành công',
                data: report
            });
        } catch (error) {
            console.error('Lỗi tạo báo cáo nhanh:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Lỗi tạo báo cáo nhanh'
            });
        }
    }

    // Lấy thống kê tổng hợp
    async getOverallStats(req, res) {
        try {
            const userId = req.user.uid;
            const { period = 30 } = req.query;

            const startDate = new Date();
            startDate.setDate(startDate.getDate() - parseInt(period));

            const report = await ReportService.generateReport(
                userId,
                'custom',
                startDate,
                new Date()
            );

            res.json({
                success: true,
                data: {
                    statistics: report.statistics,
                    categoryBreakdown: report.categoryBreakdown,
                    priorityBreakdown: report.priorityBreakdown,
                    aiInsights: report.aiInsights,
                    recommendations: report.recommendations
                }
            });
        } catch (error) {
            console.error('Lỗi lấy thống kê tổng hợp:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Lỗi lấy thống kê tổng hợp'
            });
        }
    }

    // Xóa báo cáo
    async deleteReport(req, res) {
        try {
            const report = req.report;
            await Report.findByIdAndDelete(report._id);

            res.json({
                success: true,
                message: 'Xóa báo cáo thành công'
            });
        } catch (error) {
            console.error('Lỗi xóa báo cáo:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    }

    // Lấy báo cáo theo khoảng thời gian
    async getReportsByPeriod(req, res) {
        try {
            const userId = req.user.uid;
            const { startDate, endDate, type } = req.query;

            const query = { userId };
            if (startDate && endDate) {
                query['period.startDate'] = { $gte: new Date(startDate) };
                query['period.endDate'] = { $lte: new Date(endDate) };
            }
            if (type) query.type = type;

            const reports = await Report.find(query)
                .sort({ generatedAt: -1 })
                .limit(20);

            res.json({
                success: true,
                data: reports
            });
        } catch (error) {
            console.error('Lỗi lấy báo cáo theo khoảng thời gian:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    }
}

export default new ReportController(); 