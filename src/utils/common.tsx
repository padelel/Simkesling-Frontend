import { useGlobalStore } from "@/stores/globalStore";
import apifile from "./HttpRequestFile";

export const parsingDate = (datenya: any) => {
  let rtr = "";
  try {
    // 2023-08-30T15:06:52.000000Z
    const date = new Date(datenya);
    
    // Array nama hari dalam bahasa Indonesia
    const namaHari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    
    // Array nama bulan dalam bahasa Indonesia
    const namaBulan = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    
    const hari = namaHari[date.getDay()];
    const tanggal = date.getDate();
    const bulan = namaBulan[date.getMonth()];
    const tahun = date.getFullYear();
    const jam = date.getHours().toString().padStart(2, '0');
    const menit = date.getMinutes().toString().padStart(2, '0');
    const detik = date.getSeconds().toString().padStart(2, '0');
    
    rtr = `${hari}, ${tanggal} ${bulan} ${tahun} ${jam}:${menit}:${detik}`;
  } catch (e) {
    rtr = "";
  }
  return rtr;
};

// Mengembalikan nama bulan Indonesia dari angka 1-12
export const namaBulanId = (bulanAngka: number): string => {
  const namaBulan = [
    "", // placeholder untuk index 0
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  const idx = Number(bulanAngka) || 0;
  return namaBulan[idx] ?? "";
};
