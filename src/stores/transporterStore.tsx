import { create } from "zustand";
import { MTransporter } from "../models/MTransporter";
import cloneDeep from "clone-deep";

// Define the type for your state and actions
// type TransporterStore = {
//   id_transporter: number;
//   id_transporter_tmp: string;
//   // ... (other properties)
//   files: any[]; // Adjust this to the actual type if possible
//   simpenSementara: (payload: MTransporter) => void;
// };

const tmpTransporter = {
  id_transporter: 0,
  id_transporter_tmp: "",
  id_user: "",
  npwp_transporter: "",
  nama_transporter: "",
  alamat_transporter: "",
  id_kelurahan: "",
  id_kecamatan: "",
  kelurahan: "",
  kecamatan: "",
  notlp: "",
  nohp: "",
  email: "",
  catatan: "",
  status_transporter: "",
  statusactive_transporter: "",
  user_created: "",
  user_updated: "",
  uid: "",
  created_at: "",
  updated_at: "",
  noizin: "",
  nama_pemusnah: "",
  metode_pemusnah: "",
  link_input_izin: "",
  files: [],
};

export const useTransporterStore = create<MTransporter>((set) => ({
  ...tmpTransporter,
  simpenSementara: (payload: MTransporter) => {
    // kosongin dulu semua
    set(cloneDeep(tmpTransporter));

    // set ulang datanya dari payload
    set({ ...payload });
  },
}));

// {
//     "id_transporter": 3,
//     "id_transporter_tmp": "30",
//     "id_user": "6",
//     "npwp_transporter": "23123",
//     "nama_transporter": "PT Pemusnah Jaya",
//     "alamat_transporter": "-",
//     "id_kelurahan": "21",
//     "id_kecamatan": "4",
//     "kelurahan": "Mampang",
//     "kecamatan": "Pancoran Mas",
//     "notlp": "-",
//     "nohp": "-",
//     "email": "-",
//     "catatan": "",
//     "status_transporter": "2",
//     "statusactive_transporter": "1",
//     "user_created": "rsa",
//     "user_updated": "",
//     "uid": "8d5df0b7-f2a6-4911-82b2-b0a2c602604a",
//     "created_at": "20x23-08-29T12:53:52.000000Z",
//     "updated_at": "2023x-08-29T12:53:52.000000Z",
//     "files": [
//         {
//             "id_transporter_mou": 3,
//             "id_transporter_tmp": "30",
//             "id_transporter_tmp_mou": "38",
//             "id_transporter": "3",
//             "id_user": "6",
//             "norut": "1",
//             "keterangan": "-",
//             "file1": "/FILING_USER/File_6_bf3b3054-79e2-46cc-8a66-2ef3ecd62485/MOU/FILE_30_6_1_.jpg",
//             "file2": "null",
//             "file3": "null",
//             "tgl_mulai": "2023x-08-01 12:51:50",
//             "tgl_akhir": "2023x-09-30 12:51:50",
//             "status_transporter_mou": "1",
//             "statusactive_transporter_mou": "1",
//             "user_created": "rsa",
//             "user_updated": "null",
//             "uid": "8717cfeb-4bc3-4a33-b7f2-d2ca71c1c617",
//             "created_at": "x2023-08-29T12:53:52.000000Z",
//             "updated_at": "2x023-08-29T12:53:52.000000Z"
//         }
//     ]
// }
