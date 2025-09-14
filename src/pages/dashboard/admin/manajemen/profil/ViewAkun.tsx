import MainLayout from "@/components/MainLayout";
import FormViewAkun from "@/components/admin/profil/FormViewAkun";
import React from "react";

const ViewAkun = () => {
  return (
    <MainLayout title="Form Puskesmas / Rumah Sakit">
      <h2 style={{ textAlign: "center" }}>Form Puskesmas / Rumah Sakit</h2>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <FormViewAkun />
      </div>
    </MainLayout>
  );
};

export default ViewAkun;
