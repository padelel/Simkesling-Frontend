import MainLayout from "@/components/MainLayout";
import FormViewAkun from "@/components/admin/profil/FormViewAkun";
import React from "react";

const ViewAkun = () => {
  return (
    <MainLayout title="Form Puskesmas / Rumah Sakit">
<h2 className="text-center">Form Puskesmas / Rumah Sakit</h2>
<div className="flex-center">
        <FormViewAkun />
      </div>
    </MainLayout>
  );
};

export default ViewAkun;
