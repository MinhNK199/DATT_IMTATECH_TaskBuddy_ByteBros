import express from "express";
import TaskController from "../controllers/taskController.js";
import { authenticateToken, checkTaskOwnership } from "../middleware/auth.js";
import { validateTask } from "../middleware/validation.js";

const router = express.Router();

// Demo endpoint không cần auth
router.get("/demo", (req, res) => {
    res.json({
        success: true,
        message: "Tasks API demo endpoint",
        note: "Các endpoint khác cần Firebase authentication token",
        availableEndpoints: {
            "GET /tasks": "Lấy danh sách task (cần auth)",
            "POST /tasks": "Tạo task mới (cần auth)",
            "GET /tasks/:id": "Lấy chi tiết task (cần auth)",
            "PUT /tasks/:id": "Cập nhật task (cần auth)",
            "DELETE /tasks/:id": "Xóa task (cần auth)"
        }
    });
});

// Tất cả routes đều cần xác thực
router.use(authenticateToken);

// Task CRUD
router.post("/", validateTask.create, TaskController.createTask);
router.get("/", TaskController.getTasks);
router.get("/stats", TaskController.getTaskStats);
router.get("/overdue", TaskController.getOverdueTasks);
router.get("/date/:date", TaskController.getTasksByDate);

// Task với ID
router.get("/:taskId", checkTaskOwnership, TaskController.getTask);
router.put("/:taskId", checkTaskOwnership, validateTask.update, TaskController.updateTask);
router.delete("/:taskId", checkTaskOwnership, TaskController.deleteTask);

// Task status và notes
router.patch("/:taskId/status", checkTaskOwnership, TaskController.updateTaskStatus);
router.patch("/:taskId/notes", checkTaskOwnership, TaskController.addTaskNote);

// Reorder tasks
router.post("/reorder", TaskController.reorderTasks);

export default router; 