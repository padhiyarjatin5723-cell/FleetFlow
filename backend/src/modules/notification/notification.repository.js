import prisma from "../../config/prisma.js";

export const createNotification = (data) => {
  return prisma.notification.create({
    data,
  });
};

export const getNotifications = () => {
  return prisma.notification.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getNotificationById = (id) => {
  return prisma.notification.findUnique({
    where: { id },
  });
};

export const updateNotification = (id, data) => {
  return prisma.notification.update({
    where: { id },
    data,
  });
};

export const deleteNotification = (id) => {
  return prisma.notification.delete({
    where: { id },
  });
};