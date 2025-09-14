export interface MPengajuanTransporter {
  id_transporter_tmp?: number;
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
  status_transporter_tmp?: string;
  statusactive_transporter_tmp?: string;
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
  id_transporter_tmp_mou?: number;
  id_transporter_tmp?: string;
  id_user?: string;
  norut?: string;
  keterangan?: string;
  file1?: string;
  file2?: null;
  file3?: null;
  tgl_mulai?: Date;
  tgl_akhir?: Date;
  status_transporter_tmp_mou?: string;
  statusactive_transporter_tmp_mou?: string;
  user_created?: string;
  user_updated?: string;
  uid?: string;
  created_at?: Date;
  updated_at?: Date;
  link_input?: string;
  tipe?: string;
}
