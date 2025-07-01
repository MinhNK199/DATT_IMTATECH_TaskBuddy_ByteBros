import { Router } from "express";
import ReportController from "../controllers/reportController.js";
import { authenticateToken, checkReportOwnership } from "../middleware/auth.js";
import { validateReport } from "../middleware/validation.js";

const router = Router();

// Tất cả routes đều cần xác thực
router.use(authenticateToken);

// CRUD báo cáo
router.post("/", validateReport.generate, ReportController.createReport);
router.get("/", ReportController.getReports);
router.get("/dashboard", ReportController.getDashboardData);
router.get("/quick", ReportController.generateQuickReport);
router.get("/overall", ReportController.getOverallStats);
router.get("/period", ReportController.getReportsByPeriod);

// Báo cáo theo ID
router.get("/:reportId", checkReportOwnership, ReportController.getReport);
router.delete("/:reportId", checkReportOwnership, ReportController.deleteReport);
router.get("/:reportId/pdf", checkReportOwnership, ReportController.generatePDFReport);

export default router; 