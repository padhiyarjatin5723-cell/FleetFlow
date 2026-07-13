import prisma from "../../config/prisma.js";

export const createAuditLog = (data) => {
  return prisma.auditLog.create({
    data,
  });
};

export const getAuditLogs = () => {
  return prisma.auditLog.findMany({
    include: {
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getAuditLogById = (id) => {
  return prisma.auditLog.findUnique({
    where: { id },
    include: {
      user: true,
    },
  });
};

export const updateAuditLog = (id, data) => {
  return prisma.auditLog.update({
    where: { id },
    data,
  });
};

export const deleteAuditLog = (id) => {
  return prisma.auditLog.delete({
    where: { id },
  });
};