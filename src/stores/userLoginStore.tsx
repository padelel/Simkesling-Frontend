import { create } from "zustand";
import { MUser } from "../models/MUser";
import cloneDeep from "clone-deep";
import api from "@/utils/HttpRequest";
// import jwt_decode from "jwt-decode";
// import { Cookie } from "next/font/google";
import Cookies from "js-cookie";
// Hindari pemanggilan Notif statis dari store agar tidak muncul warning dynamic theme
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
    // Kirim sebagai JSON agar cocok dengan default Content-Type: application/json
    const payload = {
      username: form_username ?? "",
      password: form_password ?? "",
    };

    try {
      // Axios sudah dikonfigurasi dengan withCredentials: true
      const resp = await api.post("/login", payload);
      console.debug("[login] resp.status:", resp?.status, "resp.data:", resp?.data);

      // Robust parse: jika body berformat string, coba JSON.parse atau potong bagian JSON
      let body: any = resp?.data ?? {};
      if (typeof body === 'string') {
        try {
          body = JSON.parse(body);
        } catch (err) {
          try {
            const start = body.indexOf('{');
            const end = body.lastIndexOf('}');
            if (start >= 0 && end > start) {
              body = JSON.parse(body.slice(start, end + 1));
            }
          } catch {}
        }
      }

      // Normalisasi struktur response ala ResponseBuilder
      const payloadData = (body?.data && typeof body.data === 'object') ? body.data : body;
      const successFlag = (body?.success === true) || (resp?.status === 200);
      const backendMsg = (body?.message || "").toString();
      console.debug("[login] parsed body keys:", Object.keys(body || {}), "payloadData keys:", Object.keys(payloadData || {}));

      // Respons backend berisi user dan token untuk Bearer auth
      const userCandidate = (payloadData?.user ?? body?.user) as MUser['user'] | undefined;
      const tokenCandidate = (payloadData?.token ?? body?.token) as string | undefined;

      if (successFlag && userCandidate) {
        const user = userCandidate as MUser['user'];
        const token = tokenCandidate || "";

        // Simpan token untuk Authorization Bearer di request selanjutnya
        if (token) {
          localStorage.setItem("token", token);
          Cookies.set("token", token, { expires: 1 });
        }

        // Simpan data user untuk persistensi UI
        localStorage.setItem("user", JSON.stringify(user));

        // Update state store agar komponen lain yang berlangganan store langsung mendapatkan user/token
        try {
          set({ user, token });
        } catch {}

        // Cookie non-sensitif
        if(form_username) Cookies.set("username", form_username, { expires: 1 });
        Cookies.set("nama_user", user?.nama_user ?? "", { expires: 1 });

        // Notifikasi dipindah ke komponen pemanggil (FormLogin) menggunakan useNotification
        // Fallback redirect jika komponen pemanggil tidak melakukan navigasi
        try {
          const target = (user?.level === "1" || user?.level === 1) ? "/dashboard/admin" : "/dashboard/user";
          console.debug("[login] user.level:", user?.level, "target:", target);
        } catch {}
        return user; // Kembalikan objek user
      }

      // Tampilkan peringatan dari store, komponen akan menampilkan notifikasi
      console.warn("[login] gagal, payload tidak berisi user. status:", resp?.status, "success:", successFlag, "msg:", backendMsg, "payload keys:", Object.keys(payloadData || {}));
      return null;

    } catch (e: any) {
      let msg = e.toString();
      if (e instanceof AxiosError && e.response) {
        msg = e.response?.data?.message?.toString() || "Terjadi kesalahan";
      }
      console.error("-- prosesLogin Error --", e);
      return null; // Jangan lempar error agar tidak memicu overlay runtime error
    }
  },
  prosesLogout: async () => {
    // Hapus semua data sesi dari sisi klien
    localStorage.removeItem("token"); // Hapus sisa token lama jika ada
    localStorage.removeItem("user");
    Cookies.remove("username");
    Cookies.remove("token"); // Hapus sisa token lama jika ada
    Cookies.remove("nama_user");
    // Notifikasi logout dipindah ke komponen pemanggil (misalnya MainLayout)
    window.location.href = "/"; // Redirect ke halaman utama
  },
}));