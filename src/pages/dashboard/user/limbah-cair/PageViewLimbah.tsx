import MainLayout from "@/components/MainLayout";
import FormViewLaporanCair from "@/components/admin/laporan/FormViewLaporanCair";
import React from "react";

const PageViewLimbah = () => {
  return (
    <MainLayout title="Form Laporan Limbah Cair">
      <h2 className="text-center">Manajemen Laporan Limbah Cair</h2>
      <div className="flex-center">
        <FormViewLaporanCair />
      </div>
    </MainLayout>
  );
};

export default PageViewLimbah;