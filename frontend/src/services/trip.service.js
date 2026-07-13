import axios from "../api/axios";

const getTrips = () => axios.get("/trips");

const getTrip = (id) => axios.get(`/trips/${id}`);

const createTrip = (data) => axios.post("/trips", data);

const updateTrip = (id, data) => axios.put(`/trips/${id}`, data);

const deleteTrip = (id) => axios.delete(`/trips/${id}`);

export default {
  getTrips,
  getTrip,
  createTrip,
  updateTrip,
  deleteTrip,
};
