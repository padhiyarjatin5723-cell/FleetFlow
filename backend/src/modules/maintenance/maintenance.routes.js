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

router.post("/", authMiddleware, roleMiddleware("ADMIN"), createMaintenance);

router.get("/", authMiddleware, getAllMaintenances);
router.get("/:id", authMiddleware, getMaintenanceById);

router.put("/:id", authMiddleware, roleMiddleware("ADMIN"), updateMaintenance);
router.patch(
  "/:id/complete",
  authMiddleware,
  roleMiddleware("ADMIN"),
  completeMaintenance
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN"),
  deleteMaintenance
);

export default router;
