import * as auditLogRepository from "./auditLog.repository.js";
import ApiError from "../../utils/ApiError.js";

export const createAuditLog = async (data) => {
  return await auditLogRepository.createAuditLog(data);
};

export const getAuditLogs = async () => {
  return await auditLogRepository.getAuditLogs();
};

export const getAuditLogById = async (id) => {
  const auditLog = await auditLogRepository.getAuditLogById(id);

  if (!auditLog) {
    throw new ApiError(404, "Audit log not found");
  }

  return auditLog;
};

export const updateAuditLog = async (id, data) => {
  await getAuditLogById(id);
  return await auditLogRepository.updateAuditLog(id, data);
};

export const deleteAuditLog = async (id) => {
  await getAuditLogById(id);
  return await auditLogRepository.deleteAuditLog(id);
};
