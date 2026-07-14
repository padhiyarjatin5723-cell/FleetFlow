import axios from "../api/axios";

const getVehicles = () => axios.get("/vehicles");

const getVehicle = (id) => axios.get(`/vehicles/${id}`);

const createVehicle = (data) => axios.post("/vehicles", data);

const updateVehicle = (id, data) =>
  axios.put(`/vehicles/${id}`, data);

const deleteVehicle = (id) =>
  axios.delete(`/vehicles/${id}`);

const getAvailableVehicles = () => axios.get("/vehicles/available");

export default {
  getVehicles,
  getAvailableVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
};