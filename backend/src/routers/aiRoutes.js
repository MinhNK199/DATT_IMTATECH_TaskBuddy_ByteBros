import { Router } from "express";
import AIController from "../controllers/aiController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

// Tất cả routes đều cần xác thực
router.use(authenticateToken);

// AI Schedule và Insights
router.get("/schedule", AIController.generateSchedule);
router.get("/insights", AIController.generateProductivityInsights);
router.get("/suggestions", AIController.getOptimizationSuggestions);
router.get("/workload", AIController.analyzeWorkload);
router.get("/recommendations", AIController.getProductivityRecommendations);

export default router; 