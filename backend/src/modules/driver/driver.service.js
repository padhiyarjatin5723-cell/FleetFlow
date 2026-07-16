import driverRepository from "./driver.repository.js";
import ApiError from "../../utils/ApiError.js";
import prisma from "../../config/prisma.js";

const isExpired = (date) => new Date(date) < new Date();

class DriverService {
  async createDriver(data) {
    const emailExists = data.email
      ? await driverRepository.findDriverByEmail(data.email)
      : null;

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

    if (isExpired(data.licenseExpiry)) {
      throw new ApiError(422, "License expiry must be a future date");
    }

    return await driverRepository.createDriver({
      employeeCode: data.employeeCode,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      licenseNumber: data.licenseNumber,
      licenseExpiry: data.licenseExpiry,
      experienceYears: data.experienceYears,
      status: data.status || "AVAILABLE",
      joiningDate: data.joiningDate,
      address: data.address,
      emergencyContact: data.emergencyContact,
    });
  }

  async getAllDrivers(filters = {}) {
    return await driverRepository.getAllDrivers(filters);
  }

  async getAvailableDrivers() {
    return await driverRepository.getAllDrivers({
      status: "AVAILABLE",
      licenseValidOnly: true,
    }).then((drivers) =>
      drivers.filter((driver) => !isExpired(driver.licenseExpiry))
    );
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

    if (data.licenseExpiry && isExpired(data.licenseExpiry)) {
      throw new ApiError(422, "License expiry must be a future date");
    }

    if (data.status) {
      const { status, ...profileData } = data;
      const updatedDriver =
        Object.keys(profileData).length > 0
          ? await driverRepository.updateDriver(id, profileData)
          : await this.getDriverById(id);

      if (status !== updatedDriver.status) {
        return await this.updateDriverStatus(id, status);
      }

      return updatedDriver;
    }

    return await driverRepository.updateDriver(id, data);
  }

  async updateDriverStatus(id, status, reason) {
    const driver = await this.getDriverById(id);

    if (!["AVAILABLE", "ON_LEAVE", "SUSPENDED"].includes(status)) {
      throw new ApiError(
        422,
        "Driver status can only be manually changed to AVAILABLE, ON_LEAVE, or SUSPENDED"
      );
    }

    if (status === "AVAILABLE" && isExpired(driver.licenseExpiry)) {
      throw new ApiError(
        422,
        "Driver cannot be made available with an expired license"
      );
    }

    if (status === "SUSPENDED" && !reason) {
      throw new ApiError(400, "Suspension reason is required");
    }

    if (driver.status === "ON_TRIP" && status !== "SUSPENDED") {
      throw new ApiError(
        422,
        "Driver on an active trip cannot be manually changed"
      );
    }

    return await prisma.$transaction(async (tx) => {
      const updatedDriver = await tx.driver.update({
        where: {
          id,
        },
        data: {
          status,
        },
      });

      if (driver.status === "ON_TRIP" && status === "SUSPENDED") {
        const admins = await tx.user.findMany({
          where: {
            role: {
              name: "ADMIN",
            },
            deletedAt: null,
          },
          select: {
            id: true,
          },
        });

        await tx.notification.createMany({
          data: admins.map((admin) => ({
            userId: admin.id,
            title: "Driver suspended during active trip",
            message: `${driver.fullName} was suspended. Reason: ${reason}`,
            type: "WARNING",
          })),
        });
      }

      return updatedDriver;
    });
  }

  async deleteDriver(id) {
    await this.getDriverById(id);

    const activeTrip = await prisma.trip.findFirst({
      where: {
        driverId: id,
        status: {
          in: ["ASSIGNED", "IN_PROGRESS"],
        },
        deletedAt: null,
      },
    });

    if (activeTrip) {
      throw new ApiError(
        409,
        "Driver cannot be deleted while an active trip exists"
      );
    }

    await driverRepository.deleteDriver(id);

    return {
      message: "Driver deleted successfully",
    };
  }

  async getDriverTrips(id) {
    await this.getDriverById(id);

    return await prisma.trip.findMany({
      where: {
        driverId: id,
        deletedAt: null,
      },
      include: {
        vehicle: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}

export default new DriverService();
