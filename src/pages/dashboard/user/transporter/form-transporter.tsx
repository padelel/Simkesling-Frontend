import MainLayout from "@/components/MainLayout";
import FormTransporter from "@/components/formpuskesmas/transporter/FormTransporter";
import router from "next/router";
import React from "react";

const PagePengajuanTransporter = () => {
  return (
    <MainLayout title={"Transporter"}>
      <h2 style={{ textAlign: "center" }}>{"Form Transporter"}</h2>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <FormTransporter />
      </div>
    </MainLayout>
  );
};

export default PagePengajuanTransporter;
