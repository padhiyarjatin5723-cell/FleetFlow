import * as repository from "./document.repository.js";

export const createDocument = async (data) => {
  return repository.createDocument(data);
};

export const getAllDocuments = async () => {
  return repository.getAllDocuments();
};

export const getDocumentById = async (id) => {
  return repository.getDocumentById(id);
};

export const updateDocument = async (id, data) => {
  return repository.updateDocument(id, data);
};

export const deleteDocument = async (id) => {
  return repository.deleteDocument(id);
};