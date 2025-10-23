import React from "react";
import dynamic from "next/dynamic";

// Lazy load hook page to keep pages light
const PagePengisianLaporan = dynamic(() => import("@/hooks/dashboard/user/laporan-limbah/PagePengisianLaporan"), { ssr: false });

const PengisianLaporanPage: React.FC = () => {
  return <PagePengisianLaporan />;
};

export default PengisianLaporanPage;