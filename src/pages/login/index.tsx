import HeaderLanding from "@/components/header/HeaderLanding";
import FormLogin from "@/components/login/FormLogin";
import { useGlobalStore } from "@/stores/globalStore";
import { Space, Spin } from "antd";
import React from "react";

const LoginPage = () => {
  const globalStore = useGlobalStore();
  return (
    <>
      <Space direction="vertical" size="large" style={{ display: "flex" }}>
        <HeaderLanding />
        <Spin spinning={globalStore.isloading}>
          <FormLogin />;
        </Spin>
      </Space>
    </>
  );
};

export default LoginPage;
