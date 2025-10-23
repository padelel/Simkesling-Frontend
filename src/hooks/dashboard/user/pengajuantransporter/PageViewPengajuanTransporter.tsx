import MainLayout from "@/components/MainLayout";
import styles from "./index.module.css";
import ViewPengajuanTransporter from "@/components/formpuskesmas/pengajuantransport/ViewPengajuanTransporter";
import router from "next/router";
import React from "react";

const PageViewPengajuanTransporter = () => {
  return (
    <MainLayout title={"View Pengajuan Transporter"}>
      <h2 className={styles.titleCenter}>{"View Pengajuan Transporter"}</h2>
      <div className={styles.centerContainer}>
        <ViewPengajuanTransporter />
      </div>
    </MainLayout>
  );
};

export default PageViewPengajuanTransporter;
