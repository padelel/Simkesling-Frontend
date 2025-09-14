import MainLayout from "@/components/MainLayout";
import FormValidasiTransporter from "@/components/admin/validasi/FormValidasiTansporter";
import React from "react";

const PagePengajuanTransporter = () => {
  return (
    <MainLayout title="Validasi Transporter">
      <h2 style={{ textAlign: "center" }}>Form Validasi Transporter</h2>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <FormValidasiTransporter />
      </div>
    </MainLayout>
  );
};

export default PagePengajuanTransporter;
