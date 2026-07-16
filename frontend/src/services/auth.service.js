import axios from "../api/axios";

export const login = (data) => {
  return axios.post("/auth/login", data);
};

export const register = (data) => {
  return axios.post("/auth/register", data);
};

export const getRoles = () => {
  return axios.get("/auth/roles");
};

export const me = () => {
  return axios.get("/auth/me");
};

export const requestPasswordReset = (data) => {
  return axios.post("/auth/forgot-password", data);
};

export const resetPassword = (data) => {
  return axios.post("/auth/reset-password", data);
};

export const changePassword = (data) => {
  return axios.post("/auth/change-password", data);
};