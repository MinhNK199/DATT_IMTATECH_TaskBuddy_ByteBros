import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    description: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    category: {
        type: String,
        enum: ['personal', 'work', 'study'],
        default: 'personal'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['not_started', 'in_progress', 'completed'],
        default: 'not_started'
    },
    dueDate: {
        type: Date,
        required: true
    },
    completedAt: {
        type: Date,
        default: null
    },
    estimatedHours: {
        type: Number,
        min: 0,
        max: 24,
        default: 1
    },
    actualHours: {
        type: Number,
        min: 0,
        default: 0
    },
    tags: [{
        type: String,
        trim: true
    }],
    attachments: [{
        name: String,
        url: String,
        type: String
    }],
    notes: {
        type: String,
        trim: true,
        maxlength: 500
    },
    aiSuggestions: [{
        suggestion: String,
        type: {
            type: String,
            enum: ['schedule', 'priority', 'break', 'optimization']
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    order: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index để tối ưu tìm kiếm và sắp xếp
taskSchema.index({ userId: 1, status: 1 });
taskSchema.index({ userId: 1, dueDate: 1 });
taskSchema.index({ userId: 1, category: 1 });
taskSchema.index({ userId: 1, priority: 1 });
taskSchema.index({ userId: 1, order: 1 });

// Virtual field để tính toán trạng thái
taskSchema.virtual('isOverdue').get(function() {
    if (this.status === 'completed') return false;
    return this.dueDate < new Date();
});

// Virtual field để tính toán tiến độ
taskSchema.virtual('progress').get(function() {
    if (this.status === 'completed') return 100;
    if (this.status === 'in_progress') return 50;
    return 0;
});

// Middleware để cập nhật completedAt
taskSchema.pre('save', function(next) {
    if (this.status === 'completed' && !this.completedAt) {
        this.completedAt = new Date();
    } else if (this.status !== 'completed') {
        this.completedAt = null;
    }
    next();
});

const Task = mongoose.model('Task', taskSchema);

export default Task; 