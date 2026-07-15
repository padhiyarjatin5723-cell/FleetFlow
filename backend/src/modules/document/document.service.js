import * as repository from "./document.repository.js";
import prisma from "../../config/prisma.js";
import ApiError from "../../utils/ApiError.js";

const assertOwnerExists = async ({ vehicleId, driverId }) => {
  if (!vehicleId && !driverId) {
    throw new ApiError(422, "Document must be linked to a vehicle or driver");
  }

  if (vehicleId) {
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        deletedAt: null,
      },
    });

    if (!vehicle) {
      throw new ApiError(404, "Vehicle not found");
    }
  }

  if (driverId) {
    const driver = await prisma.driver.findFirst({
      where: {
        id: driverId,
        deletedAt: null,
      },
    });

    if (!driver) {
      throw new ApiError(404, "Driver not found");
    }
  }
};

export const createDocument = async (data) => {
  await assertOwnerExists(data);
  return repository.createDocument(data);
};

export const getAllDocuments = async () => {
  return repository.getAllDocuments();
};

export const getDocumentById = async (id) => {
  const document = await repository.getDocumentById(id);

  if (!document) {
    throw new ApiError(404, "Document not found");
  }

  return document;
};

export const updateDocument = async (id, data) => {
  await getDocumentById(id);

  if (data.vehicleId || data.driverId) {
    await assertOwnerExists(data);
  }

  return repository.updateDocument(id, data);
};

export const deleteDocument = async (id) => {
  await getDocumentById(id);
  return repository.deleteDocument(id);
};
