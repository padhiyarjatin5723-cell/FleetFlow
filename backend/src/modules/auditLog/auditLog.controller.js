import * as auditLogService from "./auditLog.service.js";

export const createAuditLog = async (req, res, next) => {
  try {
    const auditLog = await auditLogService.createAuditLog(req.body);

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Audit log created successfully",
      data: auditLog,
    });
  } catch (error) {
    next(error);
  }
};

export const getAuditLogs = async (req, res, next) => {
  try {
    const auditLogs = await auditLogService.getAuditLogs();

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Audit logs fetched successfully",
      data: auditLogs,
    });
  } catch (error) {
    next(error);
  }
};

export const getAuditLogById = async (req, res, next) => {
  try {
    const auditLog = await auditLogService.getAuditLogById(req.params.id);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Audit log fetched successfully",
      data: auditLog,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAuditLog = async (req, res, next) => {
  try {
    const auditLog = await auditLogService.updateAuditLog(
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Audit log updated successfully",
      data: auditLog,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAuditLog = async (req, res, next) => {
  try {
    await auditLogService.deleteAuditLog(req.params.id);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Audit log deleted successfully",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};