import axios from "../api/axios";

const getDrivers = () => axios.get("/drivers");

const getDriver = (id) => axios.get(`/drivers/${id}`);

const createDriver = (data) => axios.post("/drivers", data);

const updateDriver = (id, data) => axios.put(`/drivers/${id}`, data);

const deleteDriver = (id) => axios.delete(`/drivers/${id}`);

export default {
  getDrivers,
  getDriver,
  createDriver,
  updateDriver,
  deleteDriver,
};
