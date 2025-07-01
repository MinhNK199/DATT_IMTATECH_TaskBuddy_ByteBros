import mongoose from "mongoose";
import admin from "firebase-admin";

// Khởi tạo Firebase Admin SDK
const initializeFirebase = () => {
    try {
        // Kiểm tra xem đã có Firebase credentials chưa
        if (!process.env.FIREBASE_PROJECT_ID || 
            !process.env.FIREBASE_CLIENT_EMAIL || 
            !process.env.FIREBASE_PRIVATE_KEY) {
            console.log("⚠️  Firebase credentials chưa được cấu hình. Một số tính năng xác thực có thể không hoạt động.");
            return null;
        }

        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
                }),
                databaseURL: process.env.FIREBASE_DATABASE_URL
            });
        }
        console.log("Firebase Admin SDK đã được khởi tạo ✅");
        return admin;
    } catch (error) {
        console.log("⚠️  Lỗi khởi tạo Firebase Admin SDK:", error.message);
        console.log("⚠️  Một số tính năng xác thực có thể không hoạt động.");
        return null;
    }
};

// Kết nối MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/taskbuddy');
        console.log("Kết nối MongoDB thành công ✅");
        
        // Khởi tạo Firebase (không bắt buộc)
        initializeFirebase();
    } catch (error) {
        console.log("❌ Lỗi kết nối database:", error.message);
        process.exit(1);
    }
};

export default connectDB;
export { admin };