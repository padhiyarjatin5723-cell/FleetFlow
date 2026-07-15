import * as notificationRepository from "./notification.repository.js";
import ApiError from "../../utils/ApiError.js";

export const createNotification = async (data) => {
  return await notificationRepository.createNotification(data);
};

export const getNotifications = async (userId) => {
  return await notificationRepository.getNotifications(userId);
};

export const getNotificationById = async (id, userId) => {
  const notification = await notificationRepository.getNotificationById(id, userId);

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  return notification;
};

export const updateNotification = async (id, userId, data) => {
  await getNotificationById(id, userId);
  return await notificationRepository.updateNotification(id, data);
};

export const deleteNotification = async (id, userId) => {
  await getNotificationById(id, userId);
  return await notificationRepository.deleteNotification(id);
};
