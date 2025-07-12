import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import router from "./routers/index.js";
import connectDB from "./config/database.js";

dotenv.config();
const app = express();

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({
        success: true,
        message: "TaskBuddy Backend is running!",
        timestamp: new Date().toISOString()
    });
});

// Test endpoint không cần auth
app.get("/test", (req, res) => {
    res.json({
        success: true,
        message: "API test endpoint - không cần authentication",
        endpoints: {
            health: "/health",
            api: "/api/* (cần authentication)",
            test: "/test"
        }
    });
});

// Routes
app.use("/api", router);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// 404 handler - sửa pattern này
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found"
    });
});

// Connect to database and start server
const startServer = async () => {
    try {
        await connectDB();
        
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
            console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
            console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
            console.log(`🧪 Test Endpoint: http://localhost:${PORT}/test`);
        });
    } catch (error) {
        console.error('❌ Không thể khởi động server:', error);
        process.exit(1);
    }
};

startServer();
