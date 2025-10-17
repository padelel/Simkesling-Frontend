import { useGlobalStore } from "@/stores/globalStore";
import axios, { AxiosRequestConfig } from "axios"; // Import AxiosRequestConfig
import { useNotification } from "./Notif";
import Notif from "./Notif";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import React from "react"; // Import React

// Create an instance of Axios with custom configurations
const api = axios.create({
  // --- UBAH BARIS INI UNTUK DEVELOPMENT LOKAL ---
  baseURL: "http://localhost:8000/api/v1", // Ganti ke URL backend lokal Anda
  // baseURL: "https://be-simkesling.lalapan-depok.com/api/v1", 
  timeout: 30000, 
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Helper: deteksi apakah request bersifat mutasi (bukan ambil data)
const isMutatingRequest = (method: string, url: string = "") => {
  const m = (method || "get").toLowerCase();
  const u = (url || "").toLowerCase();
  if (m !== "post" && m !== "put" && m !== "patch" && m !== "delete") return false;
  // Hindari spam untuk endpoint yang berakhiran "data" atau login
  const blockList = ["/data", "/dashboard", "/login"];
  if (blockList.some((b) => u.includes(b))) return false;
  // Prioritaskan endpoint yang mengandung kata aksi berikut
  const allowOps = ["create", "update", "delete", "validasi", "simple-create", "simple-update"];
  return allowOps.some((k) => u.includes(k));
};

// Helper: normalisasi payload respons dan ambil pesan
const extractResponseMessage = (raw: any): { success?: boolean; message?: string } => {
  let body: any = raw;
  try {
    if (typeof raw === "string") {
      try {
        body = JSON.parse(raw);
      } catch {
        body = raw;
      }
    }
  } catch {}

  let success: boolean | undefined = undefined;
  let message: string | undefined = undefined;

  if (body && typeof body === "object") {
    // Pola ResponseBuilder
    if (typeof body.success !== "undefined") success = !!body.success;
    if (typeof body.message === "string") message = body.message;
    // Jika message di bawah data
    if (!message && body.data && typeof body.data.message === "string") message = body.data.message;
  }

  return { success, message };
};

// Hook untuk membuat axios instance dengan notification
export const useApiWithNotification = () => {
  const { showNotification, contextHolder } = useNotification();
  
  const apiWithNotification = axios.create({
    // --- UBAH BARIS INI JUGA ---
    baseURL: "http://localhost:8000/api/v1", // Ganti ke URL backend lokal Anda
    // baseURL: "https://be-simkesling.lalapan-depok.com/api/v1",
    timeout: 30000,
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true,
  });

  // Request interceptor - sisipkan Authorization Bearer jika token tersedia
  apiWithNotification.interceptors.request.use(
    (config: any) => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (token) {
          config.headers = config.headers || {};
          config.headers["Authorization"] = `Bearer ${token}`;
        }
      } catch {}
      return config;
    },
    (error: any) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor dengan notification hooks
  apiWithNotification.interceptors.response.use(
    (response: any) => {
      try {
        const method = response?.config?.method || "get";
        const url = response?.config?.url || "";
        if (isMutatingRequest(method, url)) {
          const { success, message } = extractResponseMessage(response?.data);
          const msg = message || "Berhasil diproses";
          // Tampilkan notifikasi success hanya jika sukses tidak false
          if (success !== false) {
            showNotification("success", "Berhasil", msg);
          }
        }
      } catch {}
      return response;
    },
    (error: any) => {
      console.error(error);
      showNotification("warning", "Something Wrong.!", error.message.toString());
      if (error.response) {
        if (error.response.data) {
            showNotification("error", "Problem: ", error.response.data.message.toString(), 7);
            console.log(error.response.status);
            if (error.response.status == 401) {
              localStorage.removeItem("user");
              Cookies.remove("username");
              Cookies.remove("nama_user");
              window.location.href = "/";
              return Promise.reject(error);
            }
            try {
                if (Object.keys(error.response.data.data).length > 0) {
                  let strmsg = Object.keys(error.response.data.data).map(
                    (val: any) => {
                      let items = error.response.data.data[val];
                      let rtr = (
                        <React.Fragment key={val}>
                          {val}:<br />
                          <ul>
                            {items.map((v: any) => (
                              <li key={v}>{v}</li>
                            ))}
                          </ul>
                        </React.Fragment>
                      );
                      return rtr;
                    }
                  );
                  showNotification("error", "Detail: ", strmsg, 10);
                }
              } catch (e) {}
        }
      }
      return Promise.reject(error);
    }
  );

  return { api: apiWithNotification, contextHolder };
};

// Request interceptor untuk api default: sisipkan Authorization Bearer
api.interceptors.request.use(
  (config: any) => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        config.headers = config.headers || {};
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    } catch {}
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// Response interceptor untuk api default
api.interceptors.response.use(
  (response: any) => {
    try {
      const method = response?.config?.method || "get";
      const url = response?.config?.url || "";
      if (isMutatingRequest(method, url)) {
        const { success, message } = extractResponseMessage(response?.data);
        const msg = message || "Berhasil diproses";
        if (success !== false) {
          // Gunakan fallback Notif (tanpa hook) untuk instance default
          Notif("success", "Berhasil", msg);
        }
      }
    } catch {}
    return response;
  },
  (error: any) => {
    console.error(error);
    if (error.response) {
      if (error.response.data) {
        console.log(error.response.status);
        if (error.response.status == 401) {
          localStorage.removeItem("user");
          Cookies.remove("username");
          Cookies.remove("nama_user");
          window.location.href = "/";
          return Promise.reject(error);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

