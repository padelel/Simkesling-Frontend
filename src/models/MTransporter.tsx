export interface MTransporter {
  id_transporter?: number;
  id_transporter_tmp?: string;
  id_user?: string;
  npwp_transporter?: string;
  nama_transporter?: string;
  alamat_transporter?: string;
  id_kelurahan?: string;
  id_kecamatan?: string;
  kelurahan?: string;
  kecamatan?: string;
  notlp?: string;
  nohp?: string;
  email?: string;
  catatan?: string;
  status_transporter?: string;
  statusactive_transporter?: string;
  user_created?: string;
  user_updated?: string;
  uid?: string;
  created_at?: string;
  updated_at?: string;
  files?: File[];
  noizin?: string;
  nama_pemusnah?: string;
  metode_pemusnah?: string;
  link_input_izin?: string;

  // add more attribute
  simpenSementara?: Function;
}

export interface File {
  id_transporter_mou?: number;
  id_transporter_tmp?: string;
  id_transporter_tmp_mou?: string;
  id_transporter?: string;
  id_user?: string;
  norut?: string;
  keterangan?: string;
  file1?: string;
  file2?: string;
  file3?: string;
  tgl_mulai?: string;
  tgl_akhir?: string;
  status_transporter_mou?: string;
  statusactive_transporter_mou?: string;
  user_created?: string;
  user_updated?: string;
  uid?: string;
  created_at?: string;
  updated_at?: string;
  link_input?: string;
  tipe?: string;
}
