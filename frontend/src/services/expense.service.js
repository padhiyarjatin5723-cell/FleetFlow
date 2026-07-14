import axios from "../api/axios";

const getExpenses = () => axios.get("/expenses");

const getExpense = (id) => axios.get(`/expenses/${id}`);

const createExpense = (data) => axios.post("/expenses", data);

const updateExpense = (id, data) => axios.put(`/expenses/${id}`, data);

const deleteExpense = (id) => axios.delete(`/expenses/${id}`);

export default {
  getExpenses,
  getExpense,
  createExpense,
  updateExpense,
  deleteExpense,
};
