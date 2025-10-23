import MainLayout from "@/components/MainLayout";
import FormPengajuanLimbahCair from "@/components/formpuskesmas/pengajuanLimbah/FormPengajuanLimbahCair";
import React from "react";

const PageTambahLimbah = () => {
  return (
    <MainLayout title="Form Laporan Limbah Cair">
      <FormPengajuanLimbahCair />
    </MainLayout>
  );
};

export default PageTambahLimbah;