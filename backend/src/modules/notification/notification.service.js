import * as notificationRepository from "./notification.repository.js";

export const createNotification = async (data) => {
  return await notificationRepository.createNotification(data);
};

export const getNotifications = async () => {
  return await notificationRepository.getNotifications();
};

export const getNotificationById = async (id) => {
  return await notificationRepository.getNotificationById(id);
};

export const updateNotification = async (id, data) => {
  return await notificationRepository.updateNotification(id, data);
};

export const deleteNotification = async (id) => {
  return await notificationRepository.deleteNotification(id);
};