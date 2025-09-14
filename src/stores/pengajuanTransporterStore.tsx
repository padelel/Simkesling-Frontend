import { create } from "zustand";
import { MPengajuanTransporter } from "../models/MPengajuanTransporter";
import cloneDeep from "clone-deep";

const tmpPengajuanTransporter = {
  id_transporter_tmp: 0,
  id_user: "",
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
  status_transporter_tmp: "",
  statusactive_transporter_tmp: "",
  user_created: "",
  user_updated: "",
  uid: "",
  link_input: "",
  tipe: "",
  created_at: undefined,
  updated_at: undefined,
  files: [],
  noizin: "",
  nama_pemusnah: "",
  metode_pemusnah: "",
  link_input_izin: "",
};

interface PengajuanTransporterStore extends Omit<MPengajuanTransporter, 'simpenSementara'> {
  simpenSementara: (payload: MPengajuanTransporter) => void;
}

export const usePengajuanTransporterStore = create<PengajuanTransporterStore>(
  (set) => ({
    ...tmpPengajuanTransporter,
    simpenSementara: (payload: MPengajuanTransporter) => {
      // kosongin dulu semua
      set(cloneDeep(tmpPengajuanTransporter));

      // set ulang datanya dari payload
      set({ ...payload });
    },
  })
);

export const useBearStore = create((set) => ({
  bears: 0,
  increasePopulation: () =>
    set((state: { bears: number }) => ({ bears: state.bears + 1 })),
  removeAllBears: () => set({ bears: 0 }),
}));

// {
//                 "id_transporter_tmp": 2,
//                 "id_user": "0",
//                 "npwp_transporter": "01234567890",
//                 "nama_transporter": "PT Pemusnah Saja",
//                 "alamat_transporter": "Jl. Nama Orang No 7",
//                 "id_kelurahan": "1",
//                 "id_kecamatan": "1",
//                 "kelurahan": "Abadi Jaya (Abadijaya)",
//                 "kecamatan": "Sukmajaya",
//                 "notlp": "081234567890",
//                 "nohp": "081234567890",
//                 "email": "siapa@gmail.com",
//                 "catatan": "",
//                 "status_transporter_tmp": "1",
//                 "statusactive_transporter_tmp": "1",
//                 "user_created": "",
//                 "user_updated": "",
//                 "uid": "595c89ad-398b-43dc-83e0-9ea2c9830710",
//                 "created_at": "2023-08-23T02:53:35.000000Z",
//                 "updated_at": "2023-08-23T02:53:35.000000Z",
//                 "files": [
//                     {
//                         "id_transporter_tmp_mou": 3,
//                         "id_transporter_tmp": "2",
//                         "id_user": "0",
//                         "norut": "1",
//                         "keterangan": "-",
//                         "file1": "/FILING_USER/File_0_xxx-xxxx-xxx/MOU/FILE_2_0_1_.jpg",
//                         "file2": null,
//                         "file3": null,
//                         "tgl_mulai": "2023-08-18 02:53:35",
//                         "tgl_akhir": "2023-08-18 02:53:35",
//                         "status_transporter_tmp_mou": "1",
//                         "statusactive_transporter_tmp_mou": "1",
//                         "user_created": "",
//                         "user_updated": "",
//                         "uid": "f343d348-6e0a-42bc-b461-a771a9b06de4",
//                         "created_at": "2023-08-23T02:53:35.000000Z",
//                         "updated_at": "2023-08-23T02:53:35.000000Z"
//                     }
//                 ]
//             }
