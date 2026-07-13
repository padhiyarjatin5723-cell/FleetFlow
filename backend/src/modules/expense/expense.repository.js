import prisma from "../../config/prisma.js";

class ExpenseRepository {
  async createExpense(data) {
    return await prisma.expense.create({
      data,
    });
  }

  async getAllExpenses() {
    return await prisma.expense.findMany({
      include: {
        trip: true,
      },
    });
  }

  async getExpenseById(id) {
    return await prisma.expense.findUnique({
      where: { id },
      include: {
        trip: true,
      },
    });
  }

  async updateExpense(id, data) {
    return await prisma.expense.update({
      where: { id },
      data,
    });
  }

  async deleteExpense(id) {
    return await prisma.expense.delete({
      where: { id },
    });
  }
}

export default new ExpenseRepository();