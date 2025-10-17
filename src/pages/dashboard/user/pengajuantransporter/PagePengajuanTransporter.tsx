import MainLayout from "@/components/MainLayout";
import styles from "./index.module.css";
import FormPengajuanTransporter from "@/components/formpuskesmas/pengajuantransport/FormPengajuanTransporter";
import router from "next/router";
import React from "react";

const PagePengajuanTransporter = () => {
  let labelTitle = "Pengajuan Transporter";
  if (typeof window !== "undefined" && router.query.origin === "transporter") {
    labelTitle = "Form Transporter";
  }

  return (
    <MainLayout title="Pengajuan Transporter">
      <h2 className={styles.titleCenter}>Form Pengajuan Transporter</h2>
      <div className={styles.centerContainer}>
        <FormPengajuanTransporter />
      </div>
    </MainLayout>
  );
};

export default PagePengajuanTransporter;
