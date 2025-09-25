import MainLayout from "@/components/MainLayout";
import FormViewLaporan from "@/components/admin/laporan/FormViewLaporan";
import React from "react";

const PageViewLimbah = () => {
  return (
    <MainLayout title="Form Laporan Limbah B3">
      <h2 style={{ textAlign: "center" }}>Manajemen Laporan Limbah B3</h2>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <FormViewLaporan />
      </div>
    </MainLayout>
  );
};

export default PageViewLimbah;
