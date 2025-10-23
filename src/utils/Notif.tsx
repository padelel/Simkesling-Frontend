"use client";
import React from "react";
import {
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  Row,
  notification,
  Space,
  message as antdMessage,
} from "antd";
import { NotificationInstance } from "antd/es/notification/interface";

type NotificationType = "success" | "info" | "warning" | "error";

// Hook untuk mendapatkan notification instance
export const useNotification = () => {
  const [api, contextHolder] = notification.useNotification();
  
  const showNotification = (
    type: NotificationType,
    msg: any = "",
    desc: any = "",
    duration: number = 5
  ) => {
    api[type]({
      message: msg,
      description: desc,
      duration,
    });
    // Fallback tambahan untuk memastikan terlihat di dev overlay
    if (type === "error" || type === "warning") {
      const content = typeof desc !== "undefined" && desc !== "" ? desc : msg;
      // Gunakan API message.open agar bisa menerima ReactNode
      antdMessage.open({
        type,
        content: content as any,
        duration,
      });
    }
  };

  return { showNotification, contextHolder };
};

// Fallback untuk backward compatibility (akan deprecated)
const Notif = (
  type: NotificationType,
  msg: any = "",
  desc: any = "",
  duration: number = 5
) => {
  notification[type]({
    message: msg,
    description: desc,
    duration,
  });
  // Fallback tambahan agar error/warning selalu terlihat
  if (type === "error" || type === "warning") {
    const content = typeof desc !== "undefined" && desc !== "" ? desc : msg;
    // Gunakan API message.open agar bisa menerima ReactNode
    antdMessage.open({
      type,
      content: content as any,
      duration,
    });
  }
};

export default Notif;
