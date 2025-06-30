import { Router } from "express";
import TaskController from "../controllers/taskController.js";
import { authenticateToken, checkTaskOwnership } from "../middleware/auth.js";
import { validateTask, validateTaskUpdate, validateTaskSearch } from "../middleware/validation.js";

const router = Router();

// Tất cả routes đều cần xác thực
router.use(authenticateToken);

// Task CRUD
router.post("/", validateTask, TaskController.createTask);
router.get("/", validateTaskSearch, TaskController.getTasks);
router.get("/stats", TaskController.getTaskStats);
router.get("/overdue", TaskController.getOverdueTasks);
router.get("/date/:date", TaskController.getTasksByDate);

// Task với ID
router.get("/:taskId", checkTaskOwnership, TaskController.getTask);
router.put("/:taskId", checkTaskOwnership, validateTaskUpdate, TaskController.updateTask);
router.delete("/:taskId", checkTaskOwnership, TaskController.deleteTask);

// Task status và notes
router.patch("/:taskId/status", checkTaskOwnership, TaskController.updateTaskStatus);
router.patch("/:taskId/notes", checkTaskOwnership, TaskController.addTaskNote);

// Reorder tasks
router.post("/reorder", TaskController.reorderTasks);

export default router; 