import axios from "../api/axios";

const getFuelLogs = () => axios.get("/fuel");

const getFuelLog = (id) => axios.get(`/fuel/${id}`);

const createFuelLog = (data) => axios.post("/fuel", data);

const updateFuelLog = (id, data) => axios.put(`/fuel/${id}`, data);

const deleteFuelLog = (id) => axios.delete(`/fuel/${id}`);

export default {
  getFuelLogs,
  getFuelLog,
  createFuelLog,
  updateFuelLog,
  deleteFuelLog,
};
