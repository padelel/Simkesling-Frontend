import MainLayout from "@/components/MainLayout";
import FormPengajuanTransporter from "@/components/formpuskesmas/pengajuantransport/FormPengajuanTransporter";
import router from "next/router";
import React from "react";

const PagePengajuanTransporter = () => {
  let labelTitle = "Pengajuan Transporter";
  if (typeof window !== "undefined" && router.query.origin === "transporter") {
    labelTitle = "Form Transporter";
  }

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
