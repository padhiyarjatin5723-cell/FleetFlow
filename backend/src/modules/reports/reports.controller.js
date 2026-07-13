import * as reportsService from "./reports.service.js";

const send = (res, message, data) => {
  res.status(200).json({
    success: true,
    statusCode: 200,
    message,
    data,
  });
};

export const getMonthlyReport = async (req, res, next) => {
  try {
    send(
      res,
      "Monthly report fetched successfully",
      await reportsService.getMonthlyReport(req.query)
    );
  } catch (error) {
    next(error);
  }
};

export const getVehicleReport = async (req, res, next) => {
  try {
    send(
      res,
      "Vehicle report fetched successfully",
      await reportsService.getVehicleReport(req.params.id, req.query)
    );
  } catch (error) {
    next(error);
  }
};

export const getDriverReport = async (req, res, next) => {
  try {
    send(
      res,
      "Driver report fetched successfully",
      await reportsService.getDriverReport(req.params.id)
    );
  } catch (error) {
    next(error);
  }
};

export const getExpenseReport = async (req, res, next) => {
  try {
    send(
      res,
      "Expense report fetched successfully",
      await reportsService.getExpenseReport(req.query)
    );
  } catch (error) {
    next(error);
  }
};

export const getMaintenanceReport = async (req, res, next) => {
  try {
    send(
      res,
      "Maintenance report fetched successfully",
      await reportsService.getMaintenanceReport(req.query)
    );
  } catch (error) {
    next(error);
  }
};

export const exportReport = async (req, res, next) => {
  try {
    const reportType = req.query.reportType || "monthly";
    const format = req.query.format || "csv";

    if (format !== "csv") {
      return res.status(400).json({
        success: false,
        message: "Only CSV export is currently supported",
      });
    }

    const data =
      reportType === "expenses"
        ? await reportsService.getExpenseReport(req.query)
        : reportType === "maintenance"
          ? await reportsService.getMaintenanceReport(req.query)
          : await reportsService.getMonthlyReport(req.query);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="fleetflow-${reportType}-report.csv"`
    );
    res.status(200).send(reportsService.toCsv(data));
  } catch (error) {
    next(error);
  }
};
