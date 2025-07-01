import User from '../models/User.js';
import { admin } from '../config/database.js';
import jwt from 'jsonwebtoken';

class AuthController {
    // Đăng ký user mới
    async register(req, res) {
        try {
            const { email, password, displayName } = req.body;

            // Kiểm tra email đã tồn tại chưa
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email đã được sử dụng'
                });
            }

            // Tạo user trong Firebase Auth
            let firebaseUser;
            try {
                firebaseUser = await admin.auth().createUser({
                    email,
                    password,
                    displayName
                });
            } catch (firebaseError) {
                return res.status(400).json({
                    success: false,
                    message: 'Lỗi tạo tài khoản Firebase: ' + firebaseError.message
                });
            }

            // Tạo user trong database
            const user = new User({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName || displayName,
                provider: 'email'
            });

            await user.save();

            // Tạo JWT token
            const token = jwt.sign(
                { uid: user.uid, email: user.email },
                process.env.JWT_SECRET || 'taskbuddy-secret',
                { expiresIn: '7d' }
            );

            res.status(201).json({
                success: true,
                message: 'Đăng ký thành công',
                data: {
                    user: {
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName
                    },
                    token
                }
            });
        } catch (error) {
            console.error('Lỗi đăng ký:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    }

    // Đăng nhập
    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Xác thực với Firebase
            let firebaseUser;
            try {
                // Firebase Admin SDK không hỗ trợ signInWithEmailAndPassword
                // Nên chúng ta sẽ tìm user trong database và tạo custom token
                const user = await User.findOne({ email });
                if (!user) {
                    return res.status(401).json({
                        success: false,
                        message: 'Email hoặc mật khẩu không đúng'
                    });
                }

                // Tạo custom token cho user
                const customToken = await admin.auth().createCustomToken(user.uid);
                
                res.json({
                    success: true,
                    message: 'Đăng nhập thành công',
                    data: {
                        user: {
                            uid: user.uid,
                            email: user.email,
                            displayName: user.displayName
                        },
                        customToken,
                        // Tạo JWT token cho backend
                        token: jwt.sign(
                            { uid: user.uid, email: user.email },
                            process.env.JWT_SECRET || 'taskbuddy-secret',
                            { expiresIn: '7d' }
                        )
                    }
                });
            } catch (firebaseError) {
                return res.status(401).json({
                    success: false,
                    message: 'Email hoặc mật khẩu không đúng'
                });
            }
        } catch (error) {
            console.error('Lỗi đăng nhập:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    }

    // Đăng nhập với Google (OAuth)
    async googleLogin(req, res) {
        try {
            const { idToken } = req.body;

            // Xác thực Google ID token
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            
            // Tìm hoặc tạo user
            let user = await User.findOne({ uid: decodedToken.uid });
            
            if (!user) {
                // Tạo user mới nếu chưa tồn tại
                user = new User({
                    uid: decodedToken.uid,
                    email: decodedToken.email,
                    displayName: decodedToken.name,
                    photoURL: decodedToken.picture,
                    provider: 'google'
                });
                await user.save();
            }

            // Tạo JWT token
            const token = jwt.sign(
                { uid: user.uid, email: user.email },
                process.env.JWT_SECRET || 'taskbuddy-secret',
                { expiresIn: '7d' }
            );

            res.json({
                success: true,
                message: 'Đăng nhập Google thành công',
                data: {
                    user: {
                        uid: user.uid,
                        email: user.email,
                        displayName: user.displayName,
                        photoURL: user.photoURL
                    },
                    token
                }
            });
        } catch (error) {
            console.error('Lỗi đăng nhập Google:', error);
            res.status(401).json({
                success: false,
                message: 'Token Google không hợp lệ'
            });
        }
    }

    // Đăng xuất
    async logout(req, res) {
        try {
            const { uid } = req.user;

            // Revoke refresh tokens trong Firebase (nếu có)
            try {
                await admin.auth().revokeRefreshTokens(uid);
            } catch (firebaseError) {
                console.warn('Không thể revoke Firebase tokens:', firebaseError.message);
            }

            res.json({
                success: true,
                message: 'Đăng xuất thành công'
            });
        } catch (error) {
            console.error('Lỗi đăng xuất:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    }

    // Refresh token
    async refreshToken(req, res) {
        try {
            const { refreshToken } = req.body;

            // Xác thực refresh token
            const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || 'taskbuddy-secret');
            
            // Tìm user
            const user = await User.findOne({ uid: decoded.uid });
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User không tồn tại'
                });
            }

            // Tạo token mới
            const newToken = jwt.sign(
                { uid: user.uid, email: user.email },
                process.env.JWT_SECRET || 'taskbuddy-secret',
                { expiresIn: '7d' }
            );

            res.json({
                success: true,
                message: 'Refresh token thành công',
                data: {
                    token: newToken
                }
            });
        } catch (error) {
            console.error('Lỗi refresh token:', error);
            res.status(401).json({
                success: false,
                message: 'Refresh token không hợp lệ'
            });
        }
    }

    // Kiểm tra trạng thái đăng nhập
    async checkAuth(req, res) {
        try {
            const { uid } = req.user;
            
            const user = await User.findOne({ uid });
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User không tồn tại'
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
            console.error('Lỗi kiểm tra auth:', error);
            res.status(500).json({
                success: false,
                message: 'Lỗi server'
            });
        }
    }
}

export default new AuthController(); 