import { Router } from "express";
import {
  createFuel,
  getAllFuel,
  getFuelById,
  updateFuel,
  deleteFuel,
} from "./fuel.controller.js";

import authMiddleware from "../../middleware/auth.middleware.js";
import roleMiddleware from "../../middleware/role.middleware.js";

const router = Router();
const financeManagers = ["ADMIN", "FLEET_MANAGER", "FINANCIAL_ANALYST"];

router.use(authMiddleware);

router.post("/", roleMiddleware(...financeManagers), createFuel);

router.get("/", getAllFuel);

router.get("/:id", getFuelById);

router.put("/:id", roleMiddleware(...financeManagers), updateFuel);

router.delete("/:id", roleMiddleware(...financeManagers), deleteFuel);

export default router;
