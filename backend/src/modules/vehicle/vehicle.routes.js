import { Router } from "express";

import authMiddleware from "../../middleware/auth.middleware.js";
import roleMiddleware from "../../middleware/role.middleware.js";

import {
  createVehicle,
  getAllVehicles,
  getAvailableVehicles,
  getVehicleById,
  updateVehicle,
  updateVehicleStatus,
  deleteVehicle,
  getVehicleHistory,
} from "./vehicle.controller.js";

const router = Router();
const vehicleManagers = ["ADMIN", "FLEET_MANAGER"];

router.post("/", authMiddleware, roleMiddleware(...vehicleManagers), createVehicle);

router.get("/", authMiddleware, getAllVehicles);
router.get("/available", authMiddleware, getAvailableVehicles);
router.get("/:id/history", authMiddleware, getVehicleHistory);
router.get("/:id", authMiddleware, getVehicleById);

router.put("/:id", authMiddleware, roleMiddleware(...vehicleManagers), updateVehicle);
router.patch(
  "/:id/status",
  authMiddleware,
  roleMiddleware(...vehicleManagers),
  updateVehicleStatus
);

router.delete("/:id", authMiddleware, roleMiddleware("ADMIN"), deleteVehicle);

export default router;
