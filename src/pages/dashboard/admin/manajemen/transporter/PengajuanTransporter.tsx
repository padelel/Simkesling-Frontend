import MainLayout from "@/components/MainLayout";
import FormPengajuanTransporter from "@/components/formpuskesmas/pengajuantransport/FormPengajuanTransporter";
import React from "react";

const PagePengajuanTransporter = () => {
  return (
    <MainLayout title="Pengajuan Transporter">
      <h2 className="text-center">Form Pengajuan Transporter</h2>
      <div className="flex-center">
        <FormPengajuanTransporter />
      </div>
    </MainLayout>
  );
};

export default PagePengajuanTransporter;
