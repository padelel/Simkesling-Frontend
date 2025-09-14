import { create } from "zustand";
import { MUser } from "../models/MTambahAkun";
import cloneDeep from "clone-deep";

const tmpTambahAkun = {
  id_user: 0,
  username: "",
  nama_user: "",
  level: "",
  noreg_tempat: "",
  tipe_tempat: "",
  nama_tempat: "",
  alamat_tempat: "",
  id_kelurahan: 0,
  id_kecamatan: 0,
  kelurahan: "",
  kecamatan: "",
  notlp: "",
  nohp: "",
  email: "",
  izin_ipal: "",
  izin_tps: "",
  status_user: "",
  statusactive_user: "",
  user_created: "",
  user_updated: "",
  uid: "",
  created_at: "",
  updated_at: "",
  link_manifest: "",
  link_logbook: "",
  link_lab_ipal: "",
  link_lab_lain: "",
  link_dokumen_lingkungan_rs: "",
  link_swa_pantau: "",
  link_ujilab_cair: "",

  link_izin_transporter: "",
  link_mou_transporter: "",
  link_lab_limbah_cair: "",
  link_izin_ipal: "",
  link_izin_tps: "",
  link_ukl: "",
  link_upl: "",
  kapasitas_ipal: "",
};
export const useTambahAkunStore = create<MUser>((set) => ({
  ...tmpTambahAkun,
  simpenBentaran: (payload: MUser) => {
    // kosongin dulu semua
    set(cloneDeep(tmpTambahAkun));

    // set ulang datanya dari payload
    set({ ...payload });
  },
}));

export const useBearStore = create((set) => ({
  bears: 0,
  increasePopulation: () =>
    set((state: { bears: number }) => ({ bears: state.bears + 1 })),
  removeAllBears: () => set({ bears: 0 }),
}));
