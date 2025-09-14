import { create } from "zustand";
import { MUser } from "../models/MUser";
import cloneDeep from "clone-deep";
import api from "@/utils/HttpRequest";
import jwt_decode from "jwt-decode";
// import { Cookie } from "next/font/google";
import Cookies from "js-cookie";
import Notif from "@/utils/Notif";
import { useRouter } from "next/router";
import { AxiosError } from "axios";
const tmpUserLogin = {
  user: {
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
    link_izin_transporter: "",
    link_mou_transporter: "",
    link_swa_pantau: "",
    link_lab_limbah_cair: "",
    link_izin_ipal: "",
    link_izin_tps: "",
    link_ukl: "",
    link_upl: "",
    link1: "",
    link2: "",
    link3: "",
    kapasitas_ipal: "",
    link_input_izin_ipal: "",
    link_input_izin_tps: "",
    link_input_dokumen_lingkungan_rs: "",
  },
  token: "",
};

export const useUserLoginStore = create<MUser>((set) => ({
  ...tmpUserLogin,
  userLogin: (payload: MUser) => {
    // kosongin dulu semua
    set(cloneDeep(tmpUserLogin));

    // set ulang datanya dari payload
    set({ ...payload });
  },
  prosesLogin: async (form_username: string, form_password: string) => {
    //   let dari_form_username = "puskesmas001";
    //   let dari_form_password = "123";

    let dataForm = new FormData();
    dataForm.append("username", form_username);
    dataForm.append("password", form_password);

    try {
      let resp = await api.post("/login", dataForm);
      const dataUser = resp.data.data as MUser;
      const token = dataUser.token ?? "";
      const user = dataUser.user;
      const decodedToken: any = jwt_decode(token);
      localStorage.setItem("token", token);
      Cookies.set("username", form_username, { expires: 1 });
      Cookies.set("nama_user", user?.nama_user ?? "", { expires: 1 });
      Cookies.set("token", token, { expires: 1 });
      Notif("success", "Success Login.!");
      return user;
    } catch (e: any) {
      let msg = e.toString();
      if (e instanceof AxiosError) {
        console.error("-- prosesLogin Axios --");

        // return null;
        // if (e && e.response?.data) {
        // }
        msg = e.response?.data.message.toString();
      }
      console.error("-- prosesLogin --");
      console.error(e);
      Notif("error", "Gagal Login.!", msg);
      return null;
    }
  },
  prosesLogout: async () => {
    await localStorage.removeItem("token");
    await localStorage.removeItem("user");
    await Cookies.remove("username");
    await Cookies.remove("token");
    await Cookies.remove("nama_user");
    await Notif("success", "Success Logout.!");
  },
}));
