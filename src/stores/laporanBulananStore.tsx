import { create } from "zustand";
import { MLaporanBulanan } from "../models/MLaporanBulanan";
import cloneDeep from "clone-deep";

const tmpLaporanBulanan = {
  id_laporan_bulanan: 0,
  id_limbah_cair: 0, // Add id_limbah_cair field for limbah cair data
  id_transporter: "",
  id_user: "",
  nama_transporter: "",
  nama_pemusnah: "",
  metode_pemusnah: "",
  berat_limbah_total: "",
  punya_penyimpanan_tps: "",
  ukuran_penyimpanan_tps: "",
  punya_pemusnahan_sendiri: "",
  ukuran_pemusnahan_sendiri: "",
  limbah_b3_covid: "",
  limbah_b3_noncovid: "",
  limbah_cair_b3: "",
  kapasitas_ipal: "",
  memenuhi_syarat: "",
  catatan: "",
  periode: "",
  periode_nama: "",
  tahun: "",
  status_laporan_bulanan: "",
  statusactive_laporan_bulanan: "",
  user_created: "",
  user_updated: "",
  uid: "",
  created_at: "",
  updated_at: "",
  b3padat: [],
  file_manifest: [],
  file_logbook: [],

  // berat_limbah_total: "",
  // limbah_b3_covid: "",
  // limbah_b3_noncovid: "",
  // limbah_cair_b3: "",
  // catatan: "",
  link_input_manifest: "",
  link_input_logbook: "",
  link_input_lab_ipal: "",
  link_input_lab_lain: "",
  link_input_dokumen_lingkungan_rs: "",
  link_input_swa_pantau: "",
  link_input_ujilab_cair: "",
  limbah_b3_nonmedis: "",
  limbah_b3_medis: "",
  limbah_jarum: "",
  limbah_sludge_ipal: "",
  limbah_padat_infeksius: "",
  limbah_cair_b3: "", // Field untuk limbah cair B3
};

export const useLaporanBulananStore = create<MLaporanBulanan>((set) => ({
  ...tmpLaporanBulanan,
  simpenSementara: (payload: MLaporanBulanan) => {
    // kosongin dulu semua
    set(cloneDeep(tmpLaporanBulanan));

    // set ulang datanya dari payload
    set({ ...payload });
  },
}));
