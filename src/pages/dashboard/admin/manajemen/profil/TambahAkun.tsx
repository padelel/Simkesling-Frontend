import MainLayout from "@/components/MainLayout";
import FormTambahAkun from "@/components/admin/profil/FormTambahAkun";
import React from "react";

const TambahAkun = () => {
  return (
    <MainLayout title="Form Puskesmas / Rumah Sakit">
      <h2 style={{ textAlign: "center" }}>Form Puskesmas / Rumah Sakit</h2>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <FormTambahAkun />
      </div>
    </MainLayout>
  );
};

export default TambahAkun;
