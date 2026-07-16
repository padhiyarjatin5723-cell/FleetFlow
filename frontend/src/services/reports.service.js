import axios from "../api/axios";

const getMonthlyReport = () => axios.get("/reports/monthly");
const getVehicleReport = (id) => axios.get(`/reports/vehicle/${id}`);
const getDriverReport = (id) => axios.get(`/reports/driver/${id}`);
const getExpenseReport = () => axios.get("/reports/expenses");
const getMaintenanceReport = () => axios.get("/reports/maintenance");
const exportReport = () => axios.get("/reports/export", { responseType: "blob" });

export default {
  getMonthlyReport,
  getVehicleReport,
  getDriverReport,
  getExpenseReport,
  getMaintenanceReport,
  exportReport,
};
