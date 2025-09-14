export interface MLaporanBulanan {
  id_laporan_bulanan?: number;
  id_transporter?: string;
  id_user?: string;
  nama_transporter?: string;
  nama_pemusnah?: string;
  metode_pemusnah?: string;
  berat_limbah_total?: string;
  punya_penyimpanan_tps?: string;
  ukuran_penyimpanan_tps?: string;
  punya_pemusnahan_sendiri?: string;
  ukuran_pemusnahan_sendiri?: string;
  limbah_b3_covid?: string;
  limbah_b3_noncovid?: string;
  debit_limbah_cair?: string;
  kapasitas_ipal?: string;
  memenuhi_syarat?: string;
  catatan?: string;
  periode?: string;
  periode_nama?: string;
  tahun?: string;
  status_laporan_bulanan?: string;
  statusactive_laporan_bulanan?: string;
  user_created?: string;
  user_updated?: string;
  uid?: string;
  created_at?: string;
  updated_at?: string;
  b3padat?: B3Padat[];
  file_manifest?: File[];
  file_logbook?: File[];
  // berat_limbah_total: "";
  // limbah_b3_covid: "";
  // limbah_b3_noncovid: "";
  // debit_limbah_cair: "";
  // catatan: "";
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
  limbah_padat_infeksius: string;

  simpenSementara?: Function;
}

export interface B3Padat {
  id_laporan_bulanan_b3padat?: number;
  id_laporan_bulanan?: string;
  id_user?: string;
  norut?: string;
  kategori?: string;
  catatan?: string;
  total?: string;
  status_laporan_bulanan_b3padat?: string;
  statusactive_laporan_bulanan_b3padat?: string;
  user_created?: string;
  user_updated?: string;
  uid?: string;
  created_at?: string;
  updated_at?: string;
}

export interface File {
  id_laporan_bulanan_file?: number;
  id_laporan_bulanan?: string;
  id_user?: string;
  norut?: string;
  tipe_file?: string;
  file1?: string;
  file2?: string;
  file3?: string;
  status_laporan_bulanan_file?: string;
  statusactive_laporan_bulanan_file?: string;
  user_created?: string;
  user_updated?: string;
  uid?: string;
  created_at?: string;
  updated_at?: string;
}

//   {
//                 "id_laporan_bulanan": 1,
//                 "id_transporter": "1",
//                 "id_user": "2",
//                 "nama_transporter": "Transporter 1",
//                 "nama_pemusnah": "test",
//                 "metode_pemusnah": "test",
//                 "berat_limbah_total": "1",
//                 "punya_penyimpanan_tps": "1",
//                 "ukuran_penyimpanan_tps": "1",
//                 "punya_pemusnahan_sendiri": "1",
//                 "ukuran_pemusnahan_sendiri": "13",
//                 "limbah_b3_covid": "1",
//                 "limbah_b3_noncovid": "1",
//                 "debit_limbah_cair": "asdasd",
//                 "kapasitas_ipal": "12",
//                 "memenuhi_syarat": "1",
//                 "catatan": "asdasd",
//                 "periode": "3",
//                 "periode_nama": "Maret",
//                 "tahun": "2023",
//                 "status_laporan_bulanan": "1",
//                 "statusactive_laporan_bulanan": "1",
//                 "user_created": "puskesmas001",
//                 "user_updated": "",
//                 "uid": "5b942520-a334-489e-8c55-1efd08cb8248",
//                 "created_at": "2023-0as8-27T03:30:13.000000Z",
//                 "updated_at": "2023-0as8-27T03:30:13.000000Z",
//                 "b3padat": [
//                     {
//                         "id_laporan_bulanan_b3padat": 1,
//                         "id_laporan_bulanan": "1",
//                         "id_user": "2",
//                         "norut": "1",
//                         "kategori": "sadasd",
//                         "catatan": "asdasd",
//                         "total": "asdasd",
//                         "status_laporan_bulanan_b3padat": "1",
//                         "statusactive_laporan_bulanan_b3padat": "1",
//                         "user_created": "puskesmas001",
//                         "user_updated": "",
//                         "uid": "723bfeed-24c5-4f4a-ab4a-04448e1da05d",
//                         "created_at": "2023-08-as27T03:30:13.000000Z",
//                         "updated_at": "2023-08-27asT03:30:13.000000Z"
//                     }
//                 ],
// 	"file_manifest": [
//                     {
//                         "id_laporan_bulanan_file": 1,
//                         "id_laporan_bulanan": "1",
//                         "id_user": "2",
//                         "norut": "1",
//                         "tipe_file": "manifest",
//                         "file1": "/FILING_USER/File_2_c8e1704e-15b0-48c2-ab60-5d93cf3ce15a/MANIFEST/FILE_MANIFEST_1_2_1_.png",
//                         "file2": "",
//                         "file3": "",
//                         "status_laporan_bulanan_file": "1",
//                         "statusactive_laporan_bulanan_file": "1",
//                         "user_created": "puskesmas001",
//                         "user_updated": "",
//                         "uid": "98c55739-d512-4995-9e91-a2858285b7e9",
//                         "created_at": "2023s-08asdd-b27T03:30:13.000000Z",
//                         "updated_at": "2023s-08asd-27T03:30:13.000000Z"
//                     }
//                 ],
// 		"file_logbook": [
//                     {
//                         "id_laporan_bulanan_file": 3,
//                         "id_laporan_bulanan": "1",
//                         "id_user": "2",
//                         "norut": "1",
//                         "tipe_file": "logbook",
//                         "file1": "/FILING_USER/File_2_c8e1704e-15b0-48c2-ab60-5d93cf3ce15a/LOGBOOK/FILE_LOGBOOK_1_2_1_.jpg",
//                         "file2": "",
//                         "file3": "",
//                         "status_laporan_bulanan_file": "1",
//                         "statusactive_laporan_bulanan_file": "1",
//                         "user_created": "puskesmas001",
//                         "user_updated": "",
//                         "uid": "cd6a29ec-9a81-4210-b622-75b2f54d88cb",
//                         "created_at": "2023-08-27nT03:30:13.000000Z",
//                         "updated_at": "2023-08p-27T03:30:13.000000Z"
//                     }
//                 ]

// }
