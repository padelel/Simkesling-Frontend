import React from "react";
import { Button, Form, Input } from "antd";
import { LoginOutlined } from "@ant-design/icons";
import { useUserLoginStore } from "@/stores/userLoginStore";
import { useRouter } from "next/router";
import { useGlobalStore } from "@/stores/globalStore";
import { useNotification } from "@/utils/Notif";
// Tidak perlu import axios atau useApiWithNotification jika sudah ditangani oleh store

const FormLogin = () => {
  const userLogin = useUserLoginStore();
  const globalStore = useGlobalStore();
  const router = useRouter();
  const { showNotification, contextHolder } = useNotification();

  const onFinish = async (values: any) => {
    if (globalStore.setLoading) {
      globalStore.setLoading(true);
    }
    
    try {
      // LANGSUNG JALANKAN PROSES LOGIN JWT
      // Panggilan ke /sanctum/csrf-cookie telah dihapus karena tidak diperlukan.
      const usernya = await userLogin.prosesLogin(
        values.form_username,
        values.form_password
      );

      if (usernya) {
        // Jika berhasil, tampilkan notifikasi sukses
        showNotification("success", "Success Login.!");

        // Proses redirect setelah login berhasil
        let url = "/dashboard/user";
        if (usernya.level == "1") {
          url = "/dashboard/admin";
        }
        await router.push(url);
      } else {
        // Jika store mengembalikan null, tampilkan notifikasi gagal tanpa melempar error
        showNotification("error", "Gagal Login.!", "Username atau password salah.");
      }

    } catch (error: any) {
      const msg = (error?.message || "Username atau password salah.").toString();
      showNotification("error", "Gagal Login.!", msg);
      console.error("Terjadi kesalahan saat login:", error);
    } finally {
      if (globalStore.setLoading) {
        globalStore.setLoading(false);
      }
    }
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <>
    {contextHolder}
    <Form
      name="basic"
      layout="vertical"
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
    >
      <Form.Item
        label="Username"
        name="form_username"
        rules={[{ required: true, message: "Please input your username!" }]}
      >
        <Input placeholder="Masukan Username" />
      </Form.Item>

      <Form.Item
        label="Password"
        name="form_password"
        rules={[{ required: true, message: "Please input your password!" }]}
      >
        <Input.Password placeholder="Masukan Password" />
      </Form.Item>

      <Form.Item>
        <Button
          size="large"
          block
          icon={<LoginOutlined />}
          type="primary"
          htmlType="submit"
        >
          Login
        </Button>
      </Form.Item>
    </Form>
    </>
  );
};

export default FormLogin;