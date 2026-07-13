import * as notificationService from "./notification.service.js";

export const createNotification = async (req, res, next) => {
  try {
    const notification = await notificationService.createNotification(req.body);

    res.status(201).json({
      success: true,
      statusCode: 201,
      message: "Notification created successfully",
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationService.getNotifications();

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Notifications fetched successfully",
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

export const getNotificationById = async (req, res, next) => {
  try {
    const notification = await notificationService.getNotificationById(
      req.params.id
    );

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Notification fetched successfully",
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

export const updateNotification = async (req, res, next) => {
  try {
    const notification = await notificationService.updateNotification(
      req.params.id,
      req.body
    );

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Notification updated successfully",
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    await notificationService.deleteNotification(req.params.id);

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: "Notification deleted successfully",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};