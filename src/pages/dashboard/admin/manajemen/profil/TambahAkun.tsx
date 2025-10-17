import MainLayout from "@/components/MainLayout";
import FormTambahAkun from "@/components/admin/profil/FormTambahAkun";
import React from "react";

const TambahAkun = () => {
  return (
    <MainLayout title="Form Puskesmas / Rumah Sakit">
<h2 className="text-center">Form Puskesmas / Rumah Sakit</h2>
<div className="flex-center">
        <FormTambahAkun />
      </div>
    </MainLayout>
  );
};

export default TambahAkun;
