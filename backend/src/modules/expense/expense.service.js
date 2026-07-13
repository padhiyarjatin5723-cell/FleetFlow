import expenseRepository from "./expense.repository.js";
import ApiError from "../../utils/ApiError.js";

class ExpenseService {
  async createExpense(data) {
    return await expenseRepository.createExpense(data);
  }

  async getAllExpenses() {
    return await expenseRepository.getAllExpenses();
  }

  async getExpenseById(id) {
    const expense = await expenseRepository.getExpenseById(id);

    if (!expense) {
      throw new ApiError(404, "Expense not found");
    }

    return expense;
  }

  async updateExpense(id, data) {
    await this.getExpenseById(id);
    return await expenseRepository.updateExpense(id, data);
  }

  async deleteExpense(id) {
    await this.getExpenseById(id);
    return await expenseRepository.deleteExpense(id);
  }
}

export default new ExpenseService();