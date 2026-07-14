import axios from "../api/axios";

const getDocuments = () => axios.get("/documents");

const getDocument = (id) => axios.get(`/documents/${id}`);

const createDocument = (data) => axios.post("/documents", data);

const updateDocument = (id, data) => axios.put(`/documents/${id}`, data);

const deleteDocument = (id) => axios.delete(`/documents/${id}`);

export default {
  getDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
};
