export interface ResponseLaporanRekapitulasi {
  success: boolean;
  code: number;
  message: string;
  data: MLaporanRekapitulasi;
  timestamp: number;
  timezone: Timezone;
}
export interface Timezone {
  timezone_type: number;
  timezone: string;
}
export interface MLaporanRekapitulasi {
  total_seluruh_limbah: number;
  total_seluruh_limbah_b3: number;
  total_seluruh_limbah_covid: number;
  total_seluruh_limbah_noncovid: number;
  total_seluruh_limbah_b3_nonmedis: number;
  total_seluruh_limbah_b3_medis: number;
  total_seluruh_limbah_jarum: number;
  total_seluruh_limbah_sludge_ipal: number;
  tahun: string;
  users: userAtas[];
  laporan: Laporan[];
}

export interface userAtas {
  id_user: number;
  username: string;
  nama_user: string;
  level: number;
  noreg_tempat: string;
  tipe_tempat: string;
  nama_tempat: string;
  alamat_tempat: string;
  id_kelurahan: number;
  id_kecamatan: number;
  kelurahan: string;
  kecamatan: string;
  notlp: string;
  nohp: string;
  email: string;
  izin_ipal: string;
  izin_tps: string;
  status_user: number;
  statusactive_user: number;
  user_created: string;
  user_updated: string;
  uid: string;
  created_at: string;
  updated_at: string;
  limbah: number;
  limbah_b3: number;
  limbah_noncovid: number;
  limbah_covid: number;
}

export interface Laporan {
  periode: number;
  periode_nama: string;
  total_limbah: number;
  total_limbah_b3: number;
  total_limbah_covid: number;
  total_limbah_noncovid: number;
  total_limbah_b3_nonmedis: number;
  total_limbah_b3_medis: number;
  total_limbah_jarum: number;
  total_limbah_sludge_ipal: number;
  users: User[];
}

export interface User {
  id_user: number;
  username: string;
  nama_user: string | null;
  level: number;
  noreg_tempat: null | string;
  tipe_tempat: string;
  nama_tempat: null | string;
  alamat_tempat: string | null;
  id_kelurahan: number | null;
  id_kecamatan: number | null;
  kelurahan: string;
  kecamatan: string;
  notlp: null | string;
  nohp: null | string;
  email: string | null;
  izin_ipal: null | string;
  izin_tps: null | string;
  status_user: number;
  statusactive_user: number;
  user_created: string;
  user_updated: string | null;
  uid: string;
  created_at: string;
  updated_at: string | null;
  limbah: Limbah | null;
  limbah_b3: number;
  limbah_noncovid: number;
  limbah_covid: number;
  limbah_b3_nonmedis: number;
  limbah_b3_medis: number;
  limbah_jarum: number;
  limbah_sludge_ipal: number;
}

export interface Limbah {
  id_laporan_bulanan: number;
  id_transporter: number;
  id_user: number;
  nama_transporter: string;
  nama_pemusnah: string;
  metode_pemusnah: string;
  berat_limbah_total: string;
  punya_penyimpanan_tps: number;
  ukuran_penyimpanan_tps: null | string;
  punya_pemusnahan_sendiri: number;
  ukuran_pemusnahan_sendiri: null | string;
  limbah_b3_covid: string;
  limbah_b3_noncovid: string;
  debit_limbah_cair: string;
  kapasitas_ipal: string;
  memenuhi_syarat: number;
  catatan: string;
  periode: number;
  periode_nama: string;
  tahun: number;
  status_laporan_bulanan: number;
  statusactive_laporan_bulanan: number;
  user_created: string;
  user_updated: string | null;
  uid: string;
  created_at: Date;
  updated_at: Date;
  link_input_manifest: string;
  link_input_logbook: string;
  link_input_lab_ipal: string;
  link_input_lab_lain: string;
  link_input_dokumen_lingkungan_rs: string;
  link_input_swa_pantau: string;
  link_input_ujilab_cair: string;
  limbah_b3_nonmedis: string;
  limbah_b3_medis: string;
  limbah_jarum: string;
  limbah_sludge_ipal: string;
}
