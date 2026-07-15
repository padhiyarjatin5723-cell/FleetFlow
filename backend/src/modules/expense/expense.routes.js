import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware.js";
import roleMiddleware from "../../middleware/role.middleware.js";

import {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
} from "./expense.controller.js";

const router = Router();
const financeManagers = ["ADMIN", "FLEET_MANAGER", "FINANCIAL_ANALYST"];

router.use(authMiddleware);

router.post("/", roleMiddleware(...financeManagers), createExpense);

router.get("/", getAllExpenses);

router.get("/:id", getExpenseById);

router.put("/:id", roleMiddleware(...financeManagers), updateExpense);

router.delete("/:id", roleMiddleware(...financeManagers), deleteExpense);

export default router;
