import prisma from "../config/prisma.js";

const toJsonValue = (value) => {
  if (value === undefined || value === null) return undefined;
  return JSON.parse(JSON.stringify(value));
};

export const writeAuditLog = async ({
  userId,
  action,
  entityType,
  entityId,
  oldData,
  newData,
  ipAddress,
}) => {
  if (!action || !entityType) return null;

  return prisma.auditLog.create({
    data: {
      userId: userId || null,
      action,
      entityType,
      entityId: entityId || null,
      oldData: toJsonValue(oldData),
      newData: toJsonValue(newData),
      ipAddress: ipAddress || null,
    },
  });
};
