import { Router } from "express";

import authMiddleware from "../../middleware/auth.middleware.js";
import roleMiddleware from "../../middleware/role.middleware.js";

import {
  createVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
} from "./vehicle.controller.js";

const router = Router();

router.post(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN"),
  createVehicle
);

router.get(
  "/",
  authMiddleware,
  getAllVehicles
);

router.get(
  "/:id",
  authMiddleware,
  getVehicleById
);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN"),
  updateVehicle
);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN"),
  deleteVehicle
);

export default router;