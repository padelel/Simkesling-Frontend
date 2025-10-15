import MainLayout from "@/components/MainLayout";
import FormLaporanLabSimple from "@/components/lab/FormLaporanLabSimple";
import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useLaporanLabStore } from "@/stores/laporanLabStore";

const PageTambahLab = () => {
  const router = useRouter();
  const laporanLabStore = useLaporanLabStore();
  const { action } = router.query;

  useEffect(() => {
    // Check if this is edit mode and if edit data exists in store
    if (action === 'edit' && !laporanLabStore.id_laporan_lab) {
      // If no edit data found on refresh, redirect to index page
      router.push('/dashboard/user/lab-lainnya');
      return;
    }
  }, [action, laporanLabStore.id_laporan_lab, router]);

  return (
    <MainLayout title="Form Laporan Pemeriksaan Lab Lainnya">
      <FormLaporanLabSimple />
    </MainLayout>
  );
};

export default PageTambahLab;