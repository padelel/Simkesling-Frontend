import { useGlobalStore } from "@/stores/globalStore";
import axios, { AxiosRequestConfig } from "axios"; // Import AxiosRequestConfig
import { useNotification } from "./Notif";
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

  // Request interceptor - Dikosongkan karena tidak perlu set header manual
  apiWithNotification.interceptors.request.use(
    (config: any) => {
      return config;
    },
    (error: any) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor dengan notification hooks
  apiWithNotification.interceptors.response.use(
    (response: any) => {
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

// Request interceptor untuk api default (dikosongkan)
api.interceptors.request.use(
  (config: any) => {
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// Response interceptor untuk api default
api.interceptors.response.use(
  (response: any) => {
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

