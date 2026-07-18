import axios from "../api/axios";

const login = (data) => {
  return axios.post("/auth/login", data);
};

const register = (data) => {
  return axios.post("/auth/register", data);
};

const getRoles = () => {
  return axios.get("/auth/roles");
};

const me = () => {
  return axios.get("/auth/me");
};

const requestPasswordReset = (data) => {
  return axios.post("/auth/forgot-password", data);
};

const resetPassword = (data) => {
  return axios.post("/auth/reset-password", data);
};

const changePassword = (data) => {
  return axios.post("/auth/change-password", data);
};

export { login, register, getRoles, me, requestPasswordReset, resetPassword, changePassword };

export default {
  login,
  register,
  getRoles,
  me,
  requestPasswordReset,
  resetPassword,
  changePassword,
};