import Joi from "joi";

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

// Validation schemas
const authSchemas = {
    register: Joi.object({
        email: Joi.string().email().required().messages({
            'string.email': 'Email không hợp lệ',
            'any.required': 'Email là bắt buộc'
        }),
        password: Joi.string().min(6).required().messages({
            'string.min': 'Mật khẩu phải có ít nhất 6 ký tự',
            'any.required': 'Mật khẩu là bắt buộc'
        }),
        displayName: Joi.string().min(2).max(50).required().messages({
            'string.min': 'Tên hiển thị phải có ít nhất 2 ký tự',
            'string.max': 'Tên hiển thị không được quá 50 ký tự',
            'any.required': 'Tên hiển thị là bắt buộc'
        })
    }),

    login: Joi.object({
        email: Joi.string().email().required().messages({
            'string.email': 'Email không hợp lệ',
            'any.required': 'Email là bắt buộc'
        }),
        password: Joi.string().required().messages({
            'any.required': 'Mật khẩu là bắt buộc'
        })
    }),

    googleLogin: Joi.object({
        idToken: Joi.string().required().messages({
            'any.required': 'Google ID token là bắt buộc'
        })
    }),

    refreshToken: Joi.object({
        refreshToken: Joi.string().required().messages({
            'any.required': 'Refresh token là bắt buộc'
        })
    })
};

const taskSchemas = {
    create: Joi.object({
        title: Joi.string().min(1).max(100).required().messages({
            'string.min': 'Tiêu đề không được để trống',
            'string.max': 'Tiêu đề không được quá 100 ký tự',
            'any.required': 'Tiêu đề là bắt buộc'
        }),
        description: Joi.string().max(500).optional().messages({
            'string.max': 'Mô tả không được quá 500 ký tự'
        }),
        priority: Joi.string().valid('low', 'medium', 'high').default('medium').messages({
            'any.only': 'Độ ưu tiên phải là low, medium hoặc high'
        }),
        dueDate: Joi.date().iso().optional().messages({
            'date.format': 'Ngày hết hạn phải có định dạng ISO'
        }),
        category: Joi.string().max(50).optional().messages({
            'string.max': 'Danh mục không được quá 50 ký tự'
        }),
        tags: Joi.array().items(Joi.string().max(20)).max(10).optional().messages({
            'array.max': 'Tối đa 10 tags',
            'string.max': 'Mỗi tag không được quá 20 ký tự'
        })
    }),

    update: Joi.object({
        title: Joi.string().min(1).max(100).optional().messages({
            'string.min': 'Tiêu đề không được để trống',
            'string.max': 'Tiêu đề không được quá 100 ký tự'
        }),
        description: Joi.string().max(500).optional().messages({
            'string.max': 'Mô tả không được quá 500 ký tự'
        }),
        priority: Joi.string().valid('low', 'medium', 'high').optional().messages({
            'any.only': 'Độ ưu tiên phải là low, medium hoặc high'
        }),
        dueDate: Joi.date().iso().optional().messages({
            'date.format': 'Ngày hết hạn phải có định dạng ISO'
        }),
        category: Joi.string().max(50).optional().messages({
            'string.max': 'Danh mục không được quá 50 ký tự'
        }),
        tags: Joi.array().items(Joi.string().max(20)).max(10).optional().messages({
            'array.max': 'Tối đa 10 tags',
            'string.max': 'Mỗi tag không được quá 20 ký tự'
        }),
        status: Joi.string().valid('pending', 'in_progress', 'completed', 'cancelled').optional().messages({
            'any.only': 'Trạng thái phải là pending, in_progress, completed hoặc cancelled'
        })
    })
};

const reportSchemas = {
    generate: Joi.object({
        startDate: Joi.date().iso().required().messages({
            'date.format': 'Ngày bắt đầu phải có định dạng ISO',
            'any.required': 'Ngày bắt đầu là bắt buộc'
        }),
        endDate: Joi.date().iso().min(Joi.ref('startDate')).required().messages({
            'date.format': 'Ngày kết thúc phải có định dạng ISO',
            'date.min': 'Ngày kết thúc phải sau ngày bắt đầu',
            'any.required': 'Ngày kết thúc là bắt buộc'
        }),
        type: Joi.string().valid('daily', 'weekly', 'monthly', 'custom').default('custom').messages({
            'any.only': 'Loại báo cáo phải là daily, weekly, monthly hoặc custom'
        }),
        categories: Joi.array().items(Joi.string()).optional().messages({
            'array.base': 'Danh mục phải là một mảng'
        })
    })
};

// Validation middleware
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Dữ liệu không hợp lệ',
                errors: error.details.map(detail => detail.message)
            });
        }
        next();
    };
};

// Export validation functions
export const validateAuth = {
    register: validate(authSchemas.register),
    login: validate(authSchemas.login),
    googleLogin: validate(authSchemas.googleLogin),
    refreshToken: validate(authSchemas.refreshToken)
};

export const validateTask = {
    create: validate(taskSchemas.create),
    update: validate(taskSchemas.update)
};

export const validateReport = {
    generate: validate(reportSchemas.generate)
}; 