import MainLayout from "@/components/MainLayout";
import FormViewLaporanLabUser from "@/components/user/lab/FormViewLaporanLabUser";
import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { message } from "antd";

const PageViewLab = () => {
  const router = useRouter();
  const { id } = router.query;

  useEffect(() => {
    // Validate that ID parameter exists
    if (router.isReady && !id) {
      message.error('ID laporan tidak ditemukan dalam URL');
      // Optionally redirect back to the list page
      // router.push('/dashboard/user/lab-lainnya');
    }
  }, [router.isReady, id, router]);

  return (
    <MainLayout title="Detail Laporan Pemeriksaan Lab Lainnya">
<h2 className="text-center">Detail Laporan Pemeriksaan Lab Lainnya</h2>
<div className="flex-center">
        <FormViewLaporanLabUser />
      </div>
    </MainLayout>
  );
};

export default PageViewLab;