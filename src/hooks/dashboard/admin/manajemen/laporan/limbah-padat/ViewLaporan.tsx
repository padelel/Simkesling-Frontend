import MainLayout from "@/components/MainLayout";
import FormViewLaporan from "@/components/admin/laporan/FormViewLaporan";
import React from "react";

const ViewLaporanLimbahPadat = () => {
  return (
    <MainLayout title="Form Laporan Limbah Padat">
      <h2 style={{ textAlign: "center" }}>Manajemen Laporan Limbah Padat</h2>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <FormViewLaporan />
      </div>
    </MainLayout>
  );
};

export default ViewLaporanLimbahPadat;