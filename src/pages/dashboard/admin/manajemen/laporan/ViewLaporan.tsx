import MainLayout from "@/components/MainLayout";
import FormViewLaporan from "@/components/admin/laporan/FormViewLaporan";
import React from "react";

const ViewLaporan = () => {
  return (
    <MainLayout title="Form Laporan Limbah">
      <h2 style={{ textAlign: "center" }}>Manajemen Laporan</h2>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <FormViewLaporan />
      </div>
    </MainLayout>
  );
};

export default ViewLaporan;
