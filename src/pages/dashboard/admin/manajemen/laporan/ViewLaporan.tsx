import MainLayout from "@/components/MainLayout";
import FormViewLaporan from "@/components/admin/laporan/FormViewLaporan";
import React from "react";

const ViewLaporan = () => {
  return (
    <MainLayout title="Form Laporan Limbah">
<h2 className="text-center">Manajemen Laporan</h2>
<div className="flex-center">
        <FormViewLaporan />
      </div>
    </MainLayout>
  );
};

export default ViewLaporan;
