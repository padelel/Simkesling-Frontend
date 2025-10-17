import MainLayout from "@/components/MainLayout";
import FormViewTransporter from "@/components/admin/transporter/FormViewTransporter";
import React from "react";

const ViewPengajuanTransporter = () => {
  return (
    <MainLayout title="Pengajuan Transporter">
      <h2 className="text-center">Detail Transporter</h2>
      <div className="flex-center">
        <FormViewTransporter />
      </div>
    </MainLayout>
  );
};

export default ViewPengajuanTransporter;
