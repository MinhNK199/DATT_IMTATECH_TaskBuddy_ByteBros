const User = require('../models/User');
const Task = require('../models/Task');
const Report = require('../models/Report');

exports.getOverview = async (req, res) => {
    // TODO: Tổng hợp số liệu: user, task, report, task theo trạng thái, user mới...
    res.json({ message: 'getOverview stub' });
};

exports.getTaskStatistics = async (req, res) => {
    // TODO: Thống kê task theo trạng thái, ngày/tháng
    res.json({ message: 'getTaskStatistics stub' });
};

exports.getTasksByUser = async (req, res) => {
    // TODO: Trả về danh sách user kèm số lượng task
    res.json({ message: 'getTasksByUser stub' });
};

exports.getUsers = async (req, res) => {
    // TODO: Trả về danh sách user (chỉ xem)
    res.json({ message: 'getUsers stub' });
};

exports.getReports = async (req, res) => {
    // TODO: Trả về danh sách báo cáo/feedback
    res.json({ message: 'getReports stub' });
};

exports.getAIAggregate = async (req, res) => {
    try {
        const Task = require('../models/Task');
        // Đếm số lượng task có AI suggestion
        const aiTaskCount = await Task.countDocuments({ aiSuggestions: { $exists: true, $not: { $size: 0 } } });
        // Tổng số suggestion AI đã tạo
        const aiSuggestionAgg = await Task.aggregate([
            { $unwind: '$aiSuggestions' },
            { $group: { _id: null, total: { $sum: 1 } } }
        ]);
        const totalAISuggestions = aiSuggestionAgg[0]?.total || 0;
        // (Có thể mở rộng: đếm số lần gọi API AI nếu lưu log)
        res.json({
            success: true,
            aiTaskCount,
            totalAISuggestions
        });
    } catch (error) {
        console.error('Lỗi thống kê AI:', error);
        res.status(500).json({
            success: false,
            message: 'Lỗi thống kê AI'
        });
    }
}; 