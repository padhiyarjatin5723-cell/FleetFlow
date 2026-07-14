import axios from "../api/axios";

const getMaintenances = () => axios.get("/maintenance");

const getMaintenance = (id) => axios.get(`/maintenance/${id}`);

const createMaintenance = (data) => axios.post("/maintenance", data);

const updateMaintenance = (id, data) => axios.put(`/maintenance/${id}`, data);

const completeMaintenance = (id, data) => axios.patch(`/maintenance/${id}/complete`, data);

const deleteMaintenance = (id) => axios.delete(`/maintenance/${id}`);

export default {
  getMaintenances,
  getMaintenance,
  createMaintenance,
  updateMaintenance,
  completeMaintenance,
  deleteMaintenance,
};
