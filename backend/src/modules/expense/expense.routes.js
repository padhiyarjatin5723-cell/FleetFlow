import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware.js";
import validate from "../../middleware/validate.middleware.js";

import {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
} from "./expense.controller.js";

import {
  createExpenseSchema,
  updateExpenseSchema,
} from "./expense.validator.js";

const router = Router();

router.use(authMiddleware);

router.post("/", validate(createExpenseSchema), createExpense);

router.get("/", getAllExpenses);

router.get("/:id", getExpenseById);

router.put("/:id", validate(updateExpenseSchema), updateExpense);

router.delete("/:id", deleteExpense);

export default router;