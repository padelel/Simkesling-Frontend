import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import MainLayout from '@/components/MainLayout';
import FormViewLaporanLab from '@/components/admin/laporan/FormViewLaporanLab';

const ViewLaporan: React.FC = () => {
  const router = useRouter();
  const [selectedPeriode, setSelectedPeriode] = useState<number | undefined>(undefined);
  const [selectedTahun, setSelectedTahun] = useState<number | undefined>(undefined);
  const [selectedIdLaporan, setSelectedIdLaporan] = useState<number | undefined>(undefined);

  console.log('🔍 ViewLaporan component rendered');

  const monthNameToNumber = (val: any): number | undefined => {
    if (val === null || val === undefined) return undefined;
    if (typeof val === 'number') return val;
    const str = String(val).trim().toLowerCase();
    const asNum = parseInt(str, 10);
    if (!isNaN(asNum)) return asNum;
    const map: Record<string, number> = {
      'januari': 1,
      'februari': 2,
      'maret': 3,
      'april': 4,
      'mei': 5,
      'juni': 6,
      'juli': 7,
      'agustus': 8,
      'september': 9,
      'oktober': 10,
      'november': 11,
      'desember': 12,
    };
    return map[str];
  };

  // Read periode, tahun, and id_laporan_lab from URL parameters
  useEffect(() => {
    if (router.isReady) {
      const { periode, tahun, id_laporan_lab } = router.query;
      
      if (periode) {
        const periodeNum = monthNameToNumber(periode as string);
        if (periodeNum && !isNaN(periodeNum)) {
          setSelectedPeriode(periodeNum);
        }
      }
      
      if (tahun) {
        const tahunNum = parseInt(tahun as string);
        if (!isNaN(tahunNum)) {
          setSelectedTahun(tahunNum);
        }
      }

      if (id_laporan_lab) {
        const idNum = parseInt(id_laporan_lab as string);
        if (!isNaN(idNum)) {
          setSelectedIdLaporan(idNum);
        }
      }
    }
  }, [router.isReady, router.query]);

  return (
    <MainLayout>
      <FormViewLaporanLab 
        selectedPeriode={selectedPeriode}
        selectedTahun={selectedTahun}
        selectedIdLaporan={selectedIdLaporan}
      />
    </MainLayout>
  );
};

export default ViewLaporan;