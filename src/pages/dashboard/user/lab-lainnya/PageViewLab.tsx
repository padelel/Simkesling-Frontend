import MainLayout from "@/components/MainLayout";
import FormViewLaporan from "@/components/admin/laporan/FormViewLaporan";
import React from "react";

const PageViewLab = () => {
  return (
    <MainLayout title="Form Laporan Pemeriksaan Lab Lainnya">
      <h2 style={{ textAlign: "center" }}>Manajemen Laporan Pemeriksaan Lab Lainnya</h2>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <FormViewLaporan />
      </div>
    </MainLayout>
  );
};

export default PageViewLab;