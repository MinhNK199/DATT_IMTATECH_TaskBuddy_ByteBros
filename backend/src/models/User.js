import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    uid: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    displayName: {
        type: String,
        required: true
    },
    photoURL: {
        type: String,
        default: null
    },
    provider: {
        type: String,
        enum: ['email', 'google'],
        default: 'email'
    },
    preferences: {
        theme: {
            type: String,
            enum: ['light', 'dark'],
            default: 'light'
        },
        notifications: {
            type: Boolean,
            default: true
        },
        aiSuggestions: {
            type: Boolean,
            default: true
        }
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

// Index để tối ưu tìm kiếm
userSchema.index({ email: 1 });
userSchema.index({ uid: 1 });

const User = mongoose.model('User', userSchema);

export default User; 