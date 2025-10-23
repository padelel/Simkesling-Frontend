export interface MUser {
  user?: User;
  token?: string;

  prosesLogin?: Function;
  prosesLogout?: Function;
}

export interface User {
  id_user?: number;
  username?: string;
  nama_user?: string;
  level?: string;
  noreg_tempat?: string;
  tipe_tempat?: string;
  nama_tempat?: string;
  alamat_tempat?: string;
  id_kelurahan?: number;
  id_kecamatan?: number;
  kelurahan?: string;
  kecamatan?: string;
  notlp?: string;
  nohp?: string;
  email?: string;
  izin_ipal?: string;
  izin_tps?: string;
  status_user?: string;
  statusactive_user?: string;
  user_created?: string;
  user_updated?: string;
  uid?: string;
  created_at?: string;
  updated_at?: string;
  link_manifest: string;
  link_logbook: string;
  link_lab_ipal: string;
  link_lab_lain: string;
  link_dokumen_lingkungan_rs: string;
  link_rincian_teknis?: string;
  link_izin_transporter: string;
  link_mou_transporter: string;
  link_swa_pantau: string;
  link_lab_limbah_cair: string;
  link_izin_ipal: string;
  link_izin_tps: string;
  link_ukl: string;
  link_upl: string;
  link1: string;
  link2: string;
  link3: string;
  kapasitas_ipal: string;
  kapasitas_ipal_option: string;
  link_input_izin_ipal: string;
  link_input_izin_tps: string;
  link_input_dokumen_lingkungan_rs: string;
}
