import prisma from "../../config/prisma.js";

export const createNotification = (data) => {
  return prisma.notification.create({
    data,
  });
};

export const getNotifications = (userId) => {
  return prisma.notification.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getNotificationById = (id, userId) => {
  return prisma.notification.findFirst({
    where: { id, userId },
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
