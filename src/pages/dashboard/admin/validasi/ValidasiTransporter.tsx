import MainLayout from "@/components/MainLayout";
import FormValidasiTransporter from "@/components/admin/validasi/FormValidasiTansporter";
import React from "react";

const PagePengajuanTransporter = () => {
  return (
    <MainLayout title="Validasi Transporter">
      <h2 className="text-center">Form Validasi Transporter</h2>
      <div className="flex-center">
        <FormValidasiTransporter />
      </div>
    </MainLayout>
  );
};

export default PagePengajuanTransporter;
