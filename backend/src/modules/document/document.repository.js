import prisma from "../../config/prisma.js";

export const createDocument = (data) => {
  return prisma.document.create({
    data,
  });
};

export const getAllDocuments = () => {
  return prisma.document.findMany({
    include: {
      vehicle: true,
      driver: true,
    },
  });
};

export const getDocumentById = (id) => {
  return prisma.document.findUnique({
    where: { id },
    include: {
      vehicle: true,
      driver: true,
    },
  });
};

export const updateDocument = (id, data) => {
  return prisma.document.update({
    where: { id },
    data,
  });
};

export const deleteDocument = (id) => {
  return prisma.document.delete({
    where: { id },
  });
};