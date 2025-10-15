import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import MainLayout from '@/components/MainLayout';
import FormViewLaporanLab from '@/components/admin/laporan/FormViewLaporanLab';

const ViewLaporan: React.FC = () => {
  const router = useRouter();
  const [selectedPeriode, setSelectedPeriode] = useState<number | undefined>(undefined);
  const [selectedTahun, setSelectedTahun] = useState<number | undefined>(undefined);

  console.log('🔍 ViewLaporan component rendered');

  // Read periode and tahun from URL parameters
  useEffect(() => {
    if (router.isReady) {
      const { periode, tahun } = router.query;
      
      if (periode) {
        const periodeNum = parseInt(periode as string);
        if (!isNaN(periodeNum)) {
          setSelectedPeriode(periodeNum);
        }
      }
      
      if (tahun) {
        const tahunNum = parseInt(tahun as string);
        if (!isNaN(tahunNum)) {
          setSelectedTahun(tahunNum);
        }
      }
    }
  }, [router.isReady, router.query]);

  return (
    <MainLayout>
      <FormViewLaporanLab 
        selectedPeriode={selectedPeriode}
        selectedTahun={selectedTahun}
      />
    </MainLayout>
  );
};

export default ViewLaporan;