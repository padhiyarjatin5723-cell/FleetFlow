import axios from "../api/axios";

const getCostPerKm = () => axios.get("/analytics/cost-per-km");
const getFuelEfficiency = () => axios.get("/analytics/fuel-efficiency");
const getVehicleUtilization = () => axios.get("/analytics/vehicle-utilization");
const getDriverPerformance = () => axios.get("/analytics/driver-performance");
const getRoi = () => axios.get("/analytics/roi");

export default {
  getCostPerKm,
  getFuelEfficiency,
  getVehicleUtilization,
  getDriverPerformance,
  getRoi,
};
