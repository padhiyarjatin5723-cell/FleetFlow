import axios from "../api/axios";

const getSummary = async () => {
  return axios.get("/dashboard/summary");
};

export default {
  getSummary,
};