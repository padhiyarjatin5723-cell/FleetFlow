import expenseService from "./expense.service.js";
import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { writeAuditLog } from "../../utils/audit.js";
import {
  createExpenseSchema,
  updateExpenseSchema,
} from "./expense.validator.js";

export const createExpense = asyncHandler(async (req, res) => {
  const data = createExpenseSchema.parse(req.body);
  const expense = await expenseService.createExpense(data);
  await writeAuditLog({
    userId: req.user?.id,
    action: "EXPENSE_CREATED",
    entityType: "Expense",
    entityId: expense.id,
    newData: expense,
    ipAddress: req.ip,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Expense created successfully", expense));
});

export const getAllExpenses = asyncHandler(async (req, res) => {
  const expenses = await expenseService.getAllExpenses();

  return res
    .status(200)
    .json(new ApiResponse(200, "Expenses fetched successfully", expenses));
});

export const getExpenseById = asyncHandler(async (req, res) => {
  const expense = await expenseService.getExpenseById(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, "Expense fetched successfully", expense));
});

export const updateExpense = asyncHandler(async (req, res) => {
  const data = updateExpenseSchema.parse(req.body);
  const oldExpense = await expenseService.getExpenseById(req.params.id);
  const expense = await expenseService.updateExpense(req.params.id, data);
  await writeAuditLog({
    userId: req.user?.id,
    action: "EXPENSE_UPDATED",
    entityType: "Expense",
    entityId: expense.id,
    oldData: oldExpense,
    newData: expense,
    ipAddress: req.ip,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Expense updated successfully", expense));
});

export const deleteExpense = asyncHandler(async (req, res) => {
  await expenseService.deleteExpense(req.params.id);
  await writeAuditLog({
    userId: req.user?.id,
    action: "EXPENSE_DELETED",
    entityType: "Expense",
    entityId: req.params.id,
    ipAddress: req.ip,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Expense deleted successfully", null));
});
