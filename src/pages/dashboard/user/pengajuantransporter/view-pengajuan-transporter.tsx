import MainLayout from "@/components/MainLayout";
import ViewPengajuanTransporter from "@/components/formpuskesmas/pengajuantransport/ViewPengajuanTransporter";
import router from "next/router";
import React from "react";

const PageViewPengajuanTransporter = () => {
  return (
    <MainLayout title={"View Pengajuan Transporter"}>
      <h2 style={{ textAlign: "center" }}>{"View Pengajuan Transporter"}</h2>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <ViewPengajuanTransporter />
      </div>
    </MainLayout>
  );
};

export default PageViewPengajuanTransporter;
