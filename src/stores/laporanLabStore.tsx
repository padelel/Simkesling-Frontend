import { create } from "zustand";
import { MLaporanLab } from "../models/MLaporanLab";
import cloneDeep from "clone-deep";

const tmpLaporanLab: MLaporanLab = {
  id_laporan_lab: 0,
  id_user: "",
  nama_lab: "",
  jenis_pemeriksaan: undefined,
  total_pemeriksaan: 0,
  parameter_uji: "",
  hasil_uji: "",
  metode_analisis: "",
  catatan: "",
  link_sertifikat_lab: "",
  link_hasil_uji: "",
  link_dokumen_pendukung: "",
  periode: "",
  periode_nama: "",
  tahun: "",
  status_laporan_lab: "",
  statusactive_laporan_lab: "",
  user_created: "",
  user_updated: "",
  uid: "",
  created_at: "",
  updated_at: "",
  user: undefined,
};

export const useLaporanLabStore = create<MLaporanLab>((set) => ({
  ...tmpLaporanLab,
  simpenSementara: (payload: MLaporanLab) => {
    // kosongin dulu semua
    set(cloneDeep(tmpLaporanLab));

    // set ulang datanya dari payload
    set({ ...payload });
  },
}));