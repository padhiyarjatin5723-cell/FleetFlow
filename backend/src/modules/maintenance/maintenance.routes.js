import { Router } from "express";

import authMiddleware from "../../middleware/auth.middleware.js";
import roleMiddleware from "../../middleware/role.middleware.js";

import {
  createMaintenance,
  getAllMaintenances,
  getMaintenanceById,
  updateMaintenance,
  completeMaintenance,
  deleteMaintenance,
} from "./maintenance.controller.js";

const router = Router();
const maintenanceManagers = ["ADMIN", "FLEET_MANAGER"];

router.post("/", authMiddleware, roleMiddleware(...maintenanceManagers), createMaintenance);

router.get("/", authMiddleware, getAllMaintenances);
router.get("/:id", authMiddleware, getMaintenanceById);

router.put("/:id", authMiddleware, roleMiddleware(...maintenanceManagers), updateMaintenance);
router.patch(
  "/:id/complete",
  authMiddleware,
  roleMiddleware(...maintenanceManagers),
  completeMaintenance
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware(...maintenanceManagers),
  deleteMaintenance
);

export default router;
