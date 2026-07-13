import axios from "../api/axios";

const getVehicles = () => axios.get("/vehicles");

const getVehicle = (id) => axios.get(`/vehicles/${id}`);

const createVehicle = (data) => axios.post("/vehicles", data);

const updateVehicle = (id, data) =>
  axios.put(`/vehicles/${id}`, data);

const deleteVehicle = (id) =>
  axios.delete(`/vehicles/${id}`);

export default {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
};