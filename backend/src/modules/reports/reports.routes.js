import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware.js";
import {
  getMonthlyReport,
  getVehicleReport,
  getDriverReport,
  getExpenseReport,
  getMaintenanceReport,
  exportReport,
} from "./reports.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/monthly", getMonthlyReport);
router.get("/vehicle/:id", getVehicleReport);
router.get("/driver/:id", getDriverReport);
router.get("/expenses", getExpenseReport);
router.get("/maintenance", getMaintenanceReport);
router.get("/export", exportReport);

export default router;
