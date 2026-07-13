import { Router } from "express";

import authRoutes from "../modules/auth/auth.routes.js";
import vehicleRoutes from "../modules/vehicle/index.js";
import driverRoutes from "../modules/driver/driver.routes.js";
import tripRoutes from "../modules/trip/index.js";
import maintenanceRoutes from "../modules/maintenance/index.js";
import fuelRoutes from "../modules/fuel/index.js";
import expenseRoutes from "../modules/expense/index.js";
import documentRoutes from "../modules/document/index.js";
import notificationRoutes from "../modules/notification/index.js";
import dashboardRoutes from "../modules/dashboard/index.js";
import auditLogRoutes from "../modules/auditLog/index.js";
import analyticsRoutes from "../modules/analytics/index.js";
import reportsRoutes from "../modules/reports/index.js";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "FleetFlow API Running",
  });
});

// Auth Routes
router.use("/auth", authRoutes);

// Vehicle Routes
router.use("/vehicles", vehicleRoutes);

router.use("/drivers", driverRoutes);

router.use("/trips", tripRoutes);

router.use("/maintenance", maintenanceRoutes);

router.use("/fuel", fuelRoutes);

router.use("/expenses", expenseRoutes);

router.use("/documents", documentRoutes);

router.use("/notifications", notificationRoutes);

router.use("/audit-logs", auditLogRoutes);

router.use("/dashboard", dashboardRoutes);

router.use("/analytics", analyticsRoutes);

router.use("/reports", reportsRoutes);

export default router;
