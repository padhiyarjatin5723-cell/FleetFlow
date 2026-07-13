import * as auditLogRepository from "./auditLog.repository.js";

export const createAuditLog = async (data) => {
  return await auditLogRepository.createAuditLog(data);
};

export const getAuditLogs = async () => {
  return await auditLogRepository.getAuditLogs();
};

export const getAuditLogById = async (id) => {
  return await auditLogRepository.getAuditLogById(id);
};

export const updateAuditLog = async (id, data) => {
  return await auditLogRepository.updateAuditLog(id, data);
};

export const deleteAuditLog = async (id) => {
  return await auditLogRepository.deleteAuditLog(id);
};