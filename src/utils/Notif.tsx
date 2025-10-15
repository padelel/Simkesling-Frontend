"use client";
import {
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  Row,
  notification,
  Space,
} from "antd";
import { NotificationInstance } from "antd/es/notification/interface";

type NotificationType = "success" | "info" | "warning" | "error";

// Hook untuk mendapatkan notification instance
export const useNotification = () => {
  const [api, contextHolder] = notification.useNotification();
  
  const showNotification = (
    type: NotificationType,
    message: any = "",
    description: any = "",
    duration: number = 5
  ) => {
    api[type]({
      message,
      description,
      duration,
    });
  };

  return { showNotification, contextHolder };
};

// Fallback untuk backward compatibility (akan deprecated)
const Notif = (
  type: NotificationType,
  message: any = "",
  description: any = "",
  duration: number = 5
) => {
  notification[type]({
    message,
    description,
    duration,
  });
};

export default Notif;
