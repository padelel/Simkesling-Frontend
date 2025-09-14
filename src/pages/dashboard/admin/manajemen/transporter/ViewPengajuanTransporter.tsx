import MainLayout from "@/components/MainLayout";
import FormViewTransporter from "@/components/admin/transporter/FormViewTransporter";
import React from "react";

const ViewPengajuanTransporter = () => {
  return (
    <MainLayout title="Pengajuan Transporter">
      <h2 style={{ textAlign: "center" }}>Detail Transporter</h2>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <FormViewTransporter />
      </div>
    </MainLayout>
  );
};

export default ViewPengajuanTransporter;
