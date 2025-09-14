import MainLayout from "@/components/MainLayout";
import FormPengajuanTransporter from "@/components/formpuskesmas/pengajuantransport/FormPengajuanTransporter";
import React from "react";

const PagePengajuanTransporter = () => {
  return (
    <MainLayout title="Pengajuan Transporter">
      <h2 style={{ textAlign: "center" }}>Form Pengajuan Transporter</h2>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <FormPengajuanTransporter />
      </div>
    </MainLayout>
  );
};

export default PagePengajuanTransporter;
