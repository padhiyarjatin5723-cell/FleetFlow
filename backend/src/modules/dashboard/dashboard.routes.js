import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware.js";

import {
  getDashboardSummary,
  getRecentTrips,
  getUpcomingMaintenance,
  getVehicleStatus,
  getDriverStatus,
  getMonthlyExpense,
} from "./dashboard.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/summary", getDashboardSummary);
router.get("/recent-trips", getRecentTrips);
router.get("/upcoming-maintenance", getUpcomingMaintenance);
router.get("/vehicle-status", getVehicleStatus);
router.get("/driver-status", getDriverStatus);
router.get("/monthly-expense", getMonthlyExpense);

export default router;