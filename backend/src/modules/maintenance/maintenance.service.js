import maintenanceRepository from "./maintenance.repository.js";
import ApiError from "../../utils/ApiError.js";

class MaintenanceService {
  async createMaintenance(data) {
    return await maintenanceRepository.createMaintenance(data);
  }

  async getAllMaintenances() {
    return await maintenanceRepository.getAllMaintenances();
  }

  async getMaintenanceById(id) {
    const maintenance =
      await maintenanceRepository.getMaintenanceById(id);

    if (!maintenance) {
      throw new ApiError(404, "Maintenance record not found");
    }

    return maintenance;
  }

  async updateMaintenance(id, data) {
    await this.getMaintenanceById(id);

    return await maintenanceRepository.updateMaintenance(
      id,
      data
    );
  }

  async deleteMaintenance(id) {
    await this.getMaintenanceById(id);

    await maintenanceRepository.deleteMaintenance(id);

    return {
      message: "Maintenance deleted successfully",
    };
  }
}

export default new MaintenanceService();