import expenseService from "./expense.service.js";
import asyncHandler from "../../utils/asyncHandler.js";
import ApiResponse from "../../utils/ApiResponse.js";

export const createExpense = asyncHandler(async (req, res) => {
  const expense = await expenseService.createExpense(req.body);

  return res
    .status(201)
    .json(new ApiResponse(201, expense, "Expense created successfully"));
});

export const getAllExpenses = asyncHandler(async (req, res) => {
  const expenses = await expenseService.getAllExpenses();

  return res
    .status(200)
    .json(new ApiResponse(200, expenses, "Expenses fetched successfully"));
});

export const getExpenseById = asyncHandler(async (req, res) => {
  const expense = await expenseService.getExpenseById(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, expense, "Expense fetched successfully"));
});

export const updateExpense = asyncHandler(async (req, res) => {
  const expense = await expenseService.updateExpense(req.params.id, req.body);

  return res
    .status(200)
    .json(new ApiResponse(200, expense, "Expense updated successfully"));
});

export const deleteExpense = asyncHandler(async (req, res) => {
  await expenseService.deleteExpense(req.params.id);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Expense deleted successfully"));
});