import { Router } from "express";
import UserController from "../controllers/userController.js";
import { authenticateToken } from "../middleware/auth.js";
import { validateUserPreferences } from "../middleware/validation.js";

const router = Router();

// Tất cả routes đều cần xác thực
router.use(authenticateToken);

// User profile
router.post("/profile", UserController.createOrUpdateUser);
router.get("/profile", UserController.getUserProfile);
router.patch("/profile", UserController.updateUserInfo);
router.delete("/profile", UserController.deleteUserAccount);

// Preferences
router.get("/preferences", UserController.getUserPreferences);
router.patch("/preferences", validateUserPreferences, UserController.updateUserPreferences);

// Firebase info
router.get("/firebase", UserController.getFirebaseUser);

// Stats
router.get("/stats", UserController.getUserStats);

// Auth status
router.get("/auth-status", UserController.checkAuthStatus);

export default router; 