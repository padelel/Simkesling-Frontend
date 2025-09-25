import MainLayout from "@/components/MainLayout";
import FormViewLaporanCair from "@/components/admin/laporan/FormViewLaporanCair";
import React from "react";

const ViewLaporanLimbahCair = () => {
  return (
    <MainLayout title="Form Laporan Limbah Cair">
      <h2 style={{ textAlign: "center" }}>Manajemen Laporan Limbah Cair</h2>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <FormViewLaporanCair />
      </div>
    </MainLayout>
  );
};

export default ViewLaporanLimbahCair;