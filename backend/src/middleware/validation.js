import Joi from "joi";

// Schema validation cho Task
export const validateTask = (req, res, next) => {
    const schema = Joi.object({
        title: Joi.string().required().min(1).max(200).messages({
            'string.empty': 'Tiêu đề không được để trống',
            'string.max': 'Tiêu đề không được vượt quá 200 ký tự'
        }),
        description: Joi.string().optional().max(1000).messages({
            'string.max': 'Mô tả không được vượt quá 1000 ký tự'
        }),
        category: Joi.string().valid('personal', 'work', 'study').default('personal'),
        priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
        status: Joi.string().valid('not_started', 'in_progress', 'completed').default('not_started'),
        dueDate: Joi.date().required().greater('now').messages({
            'date.greater': 'Thời hạn phải lớn hơn thời gian hiện tại'
        }),
        estimatedHours: Joi.number().min(0).max(24).default(1),
        tags: Joi.array().items(Joi.string().trim()),
        notes: Joi.string().optional().max(500)
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        });
    }

    next();
};

// Schema validation cho cập nhật Task
export const validateTaskUpdate = (req, res, next) => {
    const schema = Joi.object({
        title: Joi.string().optional().min(1).max(200),
        description: Joi.string().optional().max(1000),
        category: Joi.string().valid('personal', 'work', 'study'),
        priority: Joi.string().valid('low', 'medium', 'high'),
        status: Joi.string().valid('not_started', 'in_progress', 'completed'),
        dueDate: Joi.date().optional(),
        estimatedHours: Joi.number().min(0).max(24),
        actualHours: Joi.number().min(0),
        tags: Joi.array().items(Joi.string().trim()),
        notes: Joi.string().optional().max(500),
        order: Joi.number().min(0)
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        });
    }

    next();
};

// Schema validation cho tìm kiếm Task
export const validateTaskSearch = (req, res, next) => {
    const schema = Joi.object({
        keyword: Joi.string().optional().trim(),
        status: Joi.string().valid('not_started', 'in_progress', 'completed'),
        category: Joi.string().valid('personal', 'work', 'study'),
        priority: Joi.string().valid('low', 'medium', 'high'),
        startDate: Joi.date().optional(),
        endDate: Joi.date().optional(),
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        sortBy: Joi.string().valid('dueDate', 'priority', 'createdAt', 'title').default('dueDate'),
        sortOrder: Joi.string().valid('asc', 'desc').default('asc')
    });

    const { error } = schema.validate(req.query);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        });
    }

    next();
};

// Schema validation cho Report
export const validateReport = (req, res, next) => {
    const schema = Joi.object({
        type: Joi.string().valid('weekly', 'monthly', 'custom').required(),
        startDate: Joi.date().required(),
        endDate: Joi.date().required().greater(Joi.ref('startDate')).messages({
            'date.greater': 'Ngày kết thúc phải lớn hơn ngày bắt đầu'
        })
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        });
    }

    next();
};

// Schema validation cho User preferences
export const validateUserPreferences = (req, res, next) => {
    const schema = Joi.object({
        theme: Joi.string().valid('light', 'dark'),
        notifications: Joi.boolean(),
        aiSuggestions: Joi.boolean()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message
        });
    }

    next();
}; 