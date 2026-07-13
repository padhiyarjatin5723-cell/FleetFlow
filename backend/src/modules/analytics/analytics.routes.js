import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware.js";
import {
  getCostPerKm,
  getFuelEfficiency,
  getVehicleUtilization,
  getDriverPerformance,
  getRoi,
} from "./analytics.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/cost-per-km", getCostPerKm);
router.get("/fuel-efficiency", getFuelEfficiency);
router.get("/vehicle-utilization", getVehicleUtilization);
router.get("/driver-performance", getDriverPerformance);
router.get("/roi", getRoi);

export default router;
