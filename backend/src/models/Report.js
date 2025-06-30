import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['weekly', 'monthly', 'custom'],
        required: true
    },
    period: {
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        }
    },
    statistics: {
        totalTasks: {
            type: Number,
            default: 0
        },
        completedTasks: {
            type: Number,
            default: 0
        },
        inProgressTasks: {
            type: Number,
            default: 0
        },
        overdueTasks: {
            type: Number,
            default: 0
        },
        completionRate: {
            type: Number,
            default: 0
        },
        totalEstimatedHours: {
            type: Number,
            default: 0
        },
        totalActualHours: {
            type: Number,
            default: 0
        },
        efficiency: {
            type: Number,
            default: 0
        }
    },
    categoryBreakdown: [{
        category: {
            type: String,
            enum: ['personal', 'work', 'study']
        },
        total: Number,
        completed: Number,
        completionRate: Number
    }],
    priorityBreakdown: [{
        priority: {
            type: String,
            enum: ['low', 'medium', 'high']
        },
        total: Number,
        completed: Number,
        completionRate: Number
    }],
    dailyProgress: [{
        date: Date,
        total: Number,
        completed: Number,
        inProgress: Number
    }],
    aiInsights: [{
        insight: String,
        type: {
            type: String,
            enum: ['productivity', 'scheduling', 'optimization', 'recommendation']
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high']
        }
    }],
    recommendations: [{
        title: String,
        description: String,
        action: String,
        impact: {
            type: String,
            enum: ['low', 'medium', 'high']
        }
    }],
    generatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index để tối ưu tìm kiếm
reportSchema.index({ userId: 1, type: 1 });
reportSchema.index({ userId: 1, 'period.startDate': 1, 'period.endDate': 1 });

const Report = mongoose.model('Report', reportSchema);

export default Report; 