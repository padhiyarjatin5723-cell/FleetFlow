import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware.js";

import {
  getDashboardSummary,
  getRecentTrips,
  getUpcomingMaintenance,
  getLicenseExpiryAlerts,
  getVehicleStatus,
  getDriverStatus,
  getMonthlyExpense,
  getRecentActivity,
} from "./dashboard.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/summary", getDashboardSummary);
router.get("/recent-trips", getRecentTrips);
router.get("/upcoming-maintenance", getUpcomingMaintenance);
router.get("/maintenance-alerts", getUpcomingMaintenance);
router.get("/license-expiry-alerts", getLicenseExpiryAlerts);
router.get("/vehicle-status", getVehicleStatus);
router.get("/driver-status", getDriverStatus);
router.get("/monthly-expense", getMonthlyExpense);
router.get("/recent-activity", getRecentActivity);

export default router;
