import { Router } from "express";
import {
  createFuel,
  getAllFuel,
  getFuelById,
  updateFuel,
  deleteFuel,
} from "./fuel.controller.js";

import validate from "../../middleware/validate.middleware.js";
import {
  createFuelSchema,
  updateFuelSchema,
} from "./fuel.validator.js";

import authMiddleware from "../../middleware/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

router.post("/", validate(createFuelSchema), createFuel);

router.get("/", getAllFuel);

router.get("/:id", getFuelById);

router.put("/:id", validate(updateFuelSchema), updateFuel);

router.delete("/:id", deleteFuel);

export default router;