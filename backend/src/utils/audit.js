import prisma from "../config/prisma.js";

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
      oldData: oldData || undefined,
      newData: newData || undefined,
      ipAddress: ipAddress || null,
    },
  });
};
