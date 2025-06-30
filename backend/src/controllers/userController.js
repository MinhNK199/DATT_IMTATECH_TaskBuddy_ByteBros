import User from '../models/User.js';
import { admin } from '../config/database.js';

class UserController {
    // Tạo hoặc cập nhật user profile
    async createOrUpdateUser(req, res) {
        try {
            const { uid, email, displayName, photoURL, provider } = req.body;

            // Kiểm tra user đã tồn tại
            let user = await User.findOne({ uid });

            if (user) {
                // Cập nhật thông tin user
                user.email = email;
                user.displayName = displayName;
                user.photoURL = photoURL;
                user.provider = provider;
                user.updatedAt = new Date();
            } else {
                // Tạo user mới
                user = new User({
                    uid,
                    email,
                    displayName,
                    photoURL,
                    provider
                });
            }

            await user.save();

            res.status(201).json({
                success: true,
                message: user.updatedAt ? 'Cập nhật profile thành công' : 'Tạo profile thành công',
                data: user
            });
        } catch (error) {
            console.error('Lỗi tạo/cập nhật user:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    }

    // Lấy thông tin user profile
    async getUserProfile(req, res) {
        try {
            const userId = req.user.uid;
            const user = await User.findOne({ uid: userId });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy user profile'
                });
            }

            res.json({
                success: true,
                data: user
            });
        } catch (error) {
            console.error('Lỗi lấy user profile:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    }

    // Cập nhật user preferences
    async updateUserPreferences(req, res) {
        try {
            const userId = req.user.uid;
            const { theme, notifications, aiSuggestions } = req.body;

            const user = await User.findOne({ uid: userId });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy user'
                });
            }

            // Cập nhật preferences
            if (theme !== undefined) user.preferences.theme = theme;
            if (notifications !== undefined) user.preferences.notifications = notifications;
            if (aiSuggestions !== undefined) user.preferences.aiSuggestions = aiSuggestions;

            user.updatedAt = new Date();
            await user.save();

            res.json({
                success: true,
                message: 'Cập nhật preferences thành công',
                data: user.preferences
            });
        } catch (error) {
            console.error('Lỗi cập nhật preferences:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    }

    // Lấy user preferences
    async getUserPreferences(req, res) {
        try {
            const userId = req.user.uid;
            const user = await User.findOne({ uid: userId }).select('preferences');

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy user'
                });
            }

            res.json({
                success: true,
                data: user.preferences
            });
        } catch (error) {
            console.error('Lỗi lấy preferences:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    }

    // Xóa user account
    async deleteUserAccount(req, res) {
        try {
            const userId = req.user.uid;

            // Xóa user từ database
            await User.findOneAndDelete({ uid: userId });

            // Xóa user từ Firebase Auth (nếu có quyền)
            try {
                await admin.auth().deleteUser(userId);
            } catch (firebaseError) {
                console.warn('Không thể xóa user từ Firebase Auth:', firebaseError.message);
            }

            res.json({
                success: true,
                message: 'Xóa tài khoản thành công'
            });
        } catch (error) {
            console.error('Lỗi xóa user account:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    }

    // Lấy thông tin user từ Firebase
    async getFirebaseUser(req, res) {
        try {
            const userId = req.user.uid;

            const firebaseUser = await admin.auth().getUser(userId);

            res.json({
                success: true,
                data: {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName,
                    photoURL: firebaseUser.photoURL,
                    emailVerified: firebaseUser.emailVerified,
                    providerData: firebaseUser.providerData
                }
            });
        } catch (error) {
            console.error('Lỗi lấy thông tin Firebase user:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    }

    // Cập nhật thông tin user
    async updateUserInfo(req, res) {
        try {
            const userId = req.user.uid;
            const { displayName, photoURL } = req.body;

            const user = await User.findOne({ uid: userId });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy user'
                });
            }

            // Cập nhật thông tin
            if (displayName) user.displayName = displayName;
            if (photoURL) user.photoURL = photoURL;

            user.updatedAt = new Date();
            await user.save();

            // Cập nhật Firebase Auth (nếu có quyền)
            try {
                await admin.auth().updateUser(userId, {
                    displayName: user.displayName,
                    photoURL: user.photoURL
                });
            } catch (firebaseError) {
                console.warn('Không thể cập nhật Firebase Auth:', firebaseError.message);
            }

            res.json({
                success: true,
                message: 'Cập nhật thông tin thành công',
                data: user
            });
        } catch (error) {
            console.error('Lỗi cập nhật thông tin user:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    }

    // Lấy thống kê user
    async getUserStats(req, res) {
        try {
            const userId = req.user.uid;
            const user = await User.findOne({ uid: userId });

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Không tìm thấy user'
                });
            }

            // Tính toán thống kê cơ bản
            const stats = {
                memberSince: user.createdAt,
                lastActive: user.updatedAt,
                preferences: user.preferences,
                totalDays: Math.floor((new Date() - user.createdAt) / (1000 * 60 * 60 * 24))
            };

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            console.error('Lỗi lấy thống kê user:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    }

    // Kiểm tra trạng thái đăng nhập
    async checkAuthStatus(req, res) {
        try {
            const userId = req.user.uid;
            const user = await User.findOne({ uid: userId });

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User chưa được tạo profile'
                });
            }

            res.json({
                success: true,
                data: {
                    isAuthenticated: true,
                    user: {
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName,
                        photoURL: user.photoURL,
                        preferences: user.preferences
                    }
                }
            });
        } catch (error) {
            console.error('Lỗi kiểm tra trạng thái auth:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    }
}

export default new UserController(); 