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

type NotificationType = "success" | "info" | "warning" | "error";

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
