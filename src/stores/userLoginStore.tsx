import { create } from "zustand";
import { MUser } from "../models/MUser";
import cloneDeep from "clone-deep";
import api from "@/utils/HttpRequest";
// import jwt_decode from "jwt-decode";
// import { Cookie } from "next/font/google";
import Cookies from "js-cookie";
import Notif from "@/utils/Notif";
// import { useRouter } from "next/router";
import { AxiosError } from "axios";

interface UserLoginState {
  user: MUser['user'];
  token: string;
  userLogin: (payload: { user: MUser['user'], token: string }) => void;
  prosesLogin: (form_username?: string, form_password?: string) => Promise<MUser['user'] | null>;
  prosesLogout: () => void;
}

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

export const useUserLoginStore = create<UserLoginState>((set) => ({
  ...tmpUserLogin,
  userLogin: (payload) => {
    set(cloneDeep(tmpUserLogin));
    set({ ...payload });
  },
  prosesLogin: async (form_username, form_password) => {
    // Menggunakan FormData jika backend Anda memerlukannya
    let dataForm = new FormData();
    if(form_username) dataForm.append("username", form_username);
    if(form_password) dataForm.append("password", form_password);

    try {
      // Axios sudah dikonfigurasi dengan withCredentials: true
      const resp = await api.post("/login", dataForm, {
        headers: {
            // Jika menggunakan FormData, biarkan browser mengatur Content-Type
            // 'Content-Type': 'multipart/form-data',
        }
      });

      // --- PERBAIKAN DI SINI ---
      // Respons backend sekarang tidak berisi token, tapi data user
      if (resp.status === 200 && resp.data.data.user) {
        const user = resp.data.data.user as MUser['user'];

        // HAPUS penyimpanan token
        // const token = dataUser.token ?? "";
        // localStorage.setItem("token", token);
        // Cookies.set("token", token, { expires: 1 });

        // TETAP simpan data user di localStorage untuk persistensi UI
        localStorage.setItem("user", JSON.stringify(user));

        // TETAP set cookie non-sensitif untuk kemudahan akses jika perlu
        if(form_username) Cookies.set("username", form_username, { expires: 1 });
        Cookies.set("nama_user", user?.nama_user ?? "", { expires: 1 });
        
        Notif("success", "Success Login.!");
        return user; // Kembalikan objek user
      }
      
      Notif("error", "Gagal Login.!", "Respons server tidak sesuai.");
      return null;

    } catch (e: any) {
      let msg = e.toString();
      if (e instanceof AxiosError && e.response) {
        msg = e.response?.data?.message?.toString() || "Terjadi kesalahan";
      }
      console.error("-- prosesLogin Error --", e);
      Notif("error", "Gagal Login.!", msg);
      return null;
    }
  },
  prosesLogout: async () => {
    // Hapus semua data sesi dari sisi klien
    localStorage.removeItem("token"); // Hapus sisa token lama jika ada
    localStorage.removeItem("user");
    Cookies.remove("username");
    Cookies.remove("token"); // Hapus sisa token lama jika ada
    Cookies.remove("nama_user");
    await Notif("success", "Success Logout.!");
    window.location.href = "/"; // Redirect ke halaman utama
  },
}));