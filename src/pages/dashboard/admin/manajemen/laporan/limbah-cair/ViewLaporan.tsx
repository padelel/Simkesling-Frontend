import MainLayout from "@/components/MainLayout";
import FormViewLaporanCair from "@/components/admin/laporan/FormViewLaporanCair";
import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { message } from "antd";

const ViewLaporanLimbahCair = () => {
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (router.isReady && !id) {
      message.error("ID laporan tidak ditemukan dalam URL");
    }
  }, [router.isReady, id]);

  return (
    <MainLayout title="Detail Laporan Limbah Cair">
      <h2 style={{ textAlign: "center" }}>Detail Laporan Limbah Cair</h2>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <FormViewLaporanCair />
      </div>
    </MainLayout>
  );
};

export default ViewLaporanLimbahCair;