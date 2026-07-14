import axios from "../api/axios";

const getAuditLogs = () => axios.get("/audit-logs");

export default {
  getAuditLogs,
};
