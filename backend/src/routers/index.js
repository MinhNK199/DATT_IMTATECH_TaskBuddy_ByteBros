import { Router } from "express";
import taskRoutes from "./taskRoutes.js";
import aiRoutes from "./aiRoutes.js";
import reportRoutes from "./reportRoutes.js";
import userRoutes from "./userRoutes.js";

const router = Router();

router.use("/tasks", taskRoutes);
router.use("/ai", aiRoutes);
router.use("/reports", reportRoutes);
router.use("/users", userRoutes);

export default router;