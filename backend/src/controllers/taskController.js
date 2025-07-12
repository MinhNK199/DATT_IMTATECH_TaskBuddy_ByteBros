import Task from '../models/Task.js';
import AIService from '../services/aiService.js';

class TaskController {
    // Tạo task mới
    async createTask(req, res) {
        try {
            const { title, description, category, priority, status, dueDate, estimatedHours, tags, notes } = req.body;
            const userId = req.user.uid;

            const task = new Task({
                userId,
                title,
                description,
                category,
                priority,
                status,
                dueDate,
                estimatedHours,
                tags,
                notes
            });

            await task.save();

            // Tạo AI gợi ý nếu có
            if (req.body.generateAI) {
                const aiSchedule = await AIService.generateTaskSchedule(userId);
                task.aiSuggestions = aiSchedule.suggestions.slice(0, 3); // Lấy 3 gợi ý đầu tiên
                await task.save();
            }

            res.status(201).json({
                success: true,
                message: 'Tạo task thành công',
                data: task
            });
        } catch (error) {
            console.error('Lỗi tạo task:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    }

    // Lấy danh sách task
    async getTasks(req, res) {
        try {
            const userId = req.user.uid;
            const { 
                keyword, status, category, priority, startDate, endDate,
                page = 1, limit = 10, sortBy = 'dueDate', sortOrder = 'asc'
            } = req.query;

            // Xây dựng query
            const query = { userId };
            
            if (keyword) {
                query.$or = [
                    { title: { $regex: keyword, $options: 'i' } },
                    { description: { $regex: keyword, $options: 'i' } },
                    { tags: { $in: [new RegExp(keyword, 'i')] } }
                ];
            }

            if (status) query.status = status;
            if (category) query.category = category;
            if (priority) query.priority = priority;
            if (startDate || endDate) {
                query.dueDate = {};
                if (startDate) query.dueDate.$gte = new Date(startDate);
                if (endDate) query.dueDate.$lte = new Date(endDate);
            }

            // Tính pagination
            const skip = (page - 1) * limit;
            const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

            // Sử dụng lean({ virtuals: true }) để trả về virtual fields
            const tasks = await Task.find(query)
                .sort(sort)
                .skip(skip)
                .limit(parseInt(limit))
                .lean({ virtuals: true });

            const total = await Task.countDocuments(query);

            res.json({
                success: true,
                data: tasks,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            console.error('Lỗi lấy danh sách task:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    }

    // Lấy chi tiết task
    async getTask(req, res) {
        try {
            const task = req.task;
            res.json({
                success: true,
                data: task
            });
        } catch (error) {
            console.error('Lỗi lấy chi tiết task:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    }

    // Cập nhật task
    async updateTask(req, res) {
        try {
            const task = req.task;
            const updateData = req.body;

            // Cập nhật task
            Object.assign(task, updateData);
            await task.save();

            res.json({
                success: true,
                message: 'Cập nhật task thành công',
                data: task
            });
        } catch (error) {
            console.error('Lỗi cập nhật task:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    }

    // Xóa task
    async deleteTask(req, res) {
        try {
            const task = req.task;
            await Task.findByIdAndDelete(task._id);

            res.json({
                success: true,
                message: 'Xóa task thành công'
            });
        } catch (error) {
            console.error('Lỗi xóa task:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    }

    // Cập nhật trạng thái task
    async updateTaskStatus(req, res) {
        try {
            const task = req.task;
            const { status, actualHours } = req.body;

            task.status = status;
            if (actualHours !== undefined) {
                task.actualHours = actualHours;
            }

            await task.save();

            res.json({
                success: true,
                message: 'Cập nhật trạng thái task thành công',
                data: task
            });
        } catch (error) {
            console.error('Lỗi cập nhật trạng thái task:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    }

    // Sắp xếp lại thứ tự task
    async reorderTasks(req, res) {
        try {
            const userId = req.user.uid;
            const { taskOrders } = req.body; // [{ taskId, order }]

            const updatePromises = taskOrders.map(({ taskId, order }) =>
                Task.findOneAndUpdate(
                    { _id: taskId, userId },
                    { order },
                    { new: true }
                )
            );

            await Promise.all(updatePromises);

            res.json({
                success: true,
                message: 'Sắp xếp lại task thành công'
            });
        } catch (error) {
            console.error('Lỗi sắp xếp task:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    }

    // Lấy task theo thời gian
    async getTasksByDate(req, res) {
        try {
            const userId = req.user.uid;
            const { date } = req.params;

            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            // Sử dụng lean({ virtuals: true }) để trả về virtual fields
            const tasks = await Task.find({
                userId,
                dueDate: {
                    $gte: startOfDay,
                    $lte: endOfDay
                }
            }).sort({ priority: -1, order: 1 }).lean({ virtuals: true });

            res.json({
                success: true,
                data: tasks
            });
        } catch (error) {
            console.error('Lỗi lấy task theo ngày:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    }

    // Lấy task quá hạn
    async getOverdueTasks(req, res) {
        try {
            const userId = req.user.uid;

            // Sử dụng lean({ virtuals: true }) để trả về virtual fields
            const tasks = await Task.find({
                userId,
                status: { $ne: 'completed' },
                dueDate: { $lt: new Date() }
            }).sort({ dueDate: 1 }).lean({ virtuals: true });

            res.json({
                success: true,
                data: tasks
            });
        } catch (error) {
            console.error('Lỗi lấy task quá hạn:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    }

    // Thêm ghi chú cho task
    async addTaskNote(req, res) {
        try {
            const task = req.task;
            const { note } = req.body;

            task.notes = note;
            await task.save();

            res.json({
                success: true,
                message: 'Thêm ghi chú thành công',
                data: task
            });
        } catch (error) {
            console.error('Lỗi thêm ghi chú:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    }

    // Lấy thống kê task
    async getTaskStats(req, res) {
        try {
            const userId = req.user.uid;

            const stats = await Task.aggregate([
                { $match: { userId } },
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        completed: {
                            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                        },
                        inProgress: {
                            $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
                        },
                        notStarted: {
                            $sum: { $cond: [{ $eq: ['$status', 'not_started'] }, 1, 0] }
                        },
                        overdue: {
                            $sum: {
                                $cond: [
                                    {
                                        $and: [
                                            { $ne: ['$status', 'completed'] },
                                            { $lt: ['$dueDate', new Date()] }
                                        ]
                                    },
                                    1,
                                    0
                                ]
                            }
                        }
                    }
                }
            ]);

            const categoryStats = await Task.aggregate([
                { $match: { userId } },
                {
                    $group: {
                        _id: '$category',
                        count: { $sum: 1 },
                        completed: {
                            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                        }
                    }
                }
            ]);

            const priorityStats = await Task.aggregate([
                { $match: { userId } },
                {
                    $group: {
                        _id: '$priority',
                        count: { $sum: 1 },
                        completed: {
                            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
                        }
                    }
                }
            ]);

            res.json({
                success: true,
                data: {
                    overview: stats[0] || {
                        total: 0,
                        completed: 0,
                        inProgress: 0,
                        notStarted: 0,
                        overdue: 0
                    },
                    byCategory: categoryStats,
                    byPriority: priorityStats
                }
            });
        } catch (error) {
            console.error('Lỗi lấy thống kê task:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    }
}

export default new TaskController(); 