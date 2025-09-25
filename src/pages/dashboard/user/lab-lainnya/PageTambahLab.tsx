import MainLayout from "@/components/MainLayout";
import FormLaporanLabSimple from "@/components/lab/FormLaporanLabSimple";
import React from "react";

const PageTambahLab = () => {
  return (
    <MainLayout title="Form Laporan Pemeriksaan Lab Lainnya">
      <FormLaporanLabSimple />
    </MainLayout>
  );
};

export default PageTambahLab;