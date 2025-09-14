import MainLayout from "@/components/MainLayout";
import FormTransporter from "@/components/formpuskesmas/transporter/FormTransporter";
import ViewTransporter from "@/components/formpuskesmas/transporter/ViewTransporter";
import router from "next/router";
import React from "react";

const PageViewTransporter = () => {
  return (
    <MainLayout title={"View Transporter"}>
      <h2 style={{ textAlign: "center" }}>{"View Transporter"}</h2>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <ViewTransporter />
      </div>
    </MainLayout>
  );
};

export default PageViewTransporter;
