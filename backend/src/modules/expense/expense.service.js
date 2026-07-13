import expenseRepository from "./expense.repository.js";
import ApiError from "../../utils/ApiError.js";
import prisma from "../../config/prisma.js";

class ExpenseService {
  async createExpense(data) {
    const trip = await prisma.trip.findFirst({
      where: {
        id: data.tripId,
        deletedAt: null,
      },
    });

    if (!trip) {
      throw new ApiError(404, "Trip not found");
    }

    if (trip.status !== "COMPLETED") {
      throw new ApiError(422, "Expenses can only be logged for completed trips");
    }

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

    if (data.tripId) {
      const trip = await prisma.trip.findFirst({
        where: {
          id: data.tripId,
          deletedAt: null,
        },
      });

      if (!trip) {
        throw new ApiError(404, "Trip not found");
      }

      if (trip.status !== "COMPLETED") {
        throw new ApiError(
          422,
          "Expenses can only be logged for completed trips"
        );
      }
    }

    return await expenseRepository.updateExpense(id, data);
  }

  async deleteExpense(id) {
    await this.getExpenseById(id);
    return await expenseRepository.deleteExpense(id);
  }
}

export default new ExpenseService();
