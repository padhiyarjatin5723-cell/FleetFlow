import driverRepository from "./driver.repository.js";
import ApiError from "../../utils/ApiError.js";

class DriverService {
  async createDriver(data) {
    const emailExists = await driverRepository.findDriverByEmail(data.email);

    if (emailExists) {
      throw new ApiError(409, "Email already exists");
    }

    const phoneExists = await driverRepository.findDriverByPhone(data.phone);

    if (phoneExists) {
      throw new ApiError(409, "Phone number already exists");
    }

    const licenseExists = await driverRepository.findDriverByLicense(
      data.licenseNumber
    );

    if (licenseExists) {
      throw new ApiError(409, "License number already exists");
    }

    return await driverRepository.createDriver({
      employeeCode: data.employeeCode,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      licenseNumber: data.licenseNumber,
      licenseExpiry: data.licenseExpiry,
      experienceYears: data.experienceYears,
      status: data.status,
      joiningDate: data.joiningDate,
      address: data.address,
      emergencyContact: data.emergencyContact,
    });
  }

  async getAllDrivers() {
    return await driverRepository.getAllDrivers();
  }

  async getDriverById(id) {
    const driver = await driverRepository.getDriverById(id);

    if (!driver || driver.deletedAt) {
      throw new ApiError(404, "Driver not found");
    }

    return driver;
  }

  async updateDriver(id, data) {
    await this.getDriverById(id);

    return await driverRepository.updateDriver(id, data);
  }

  async deleteDriver(id) {
    await this.getDriverById(id);

    await driverRepository.deleteDriver(id);

    return {
      message: "Driver deleted successfully",
    };
  }
}

export default new DriverService();