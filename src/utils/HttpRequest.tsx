import { useGlobalStore } from "@/stores/globalStore";
import axios from "axios";
import { useNotification } from "./Notif";
import Cookies from "js-cookie";
import { useRouter } from "next/router";

// Create an instance of Axios with custom configurations
const api = axios.create({
  // baseURL: "https://be-simkesling.lalapan-depok.com/api/v1",
  // baseURL: 'http://localhost:8000/api',
  // baseURL: "http://192.168.1.19:8000/api/v1", // Your API base URL
  // baseURL: "http://192.168.128.190:8000/api/v1", // Your API base URL
  // baseURL: "http://localhost:8000/api/v1", // Your API base URL
  baseURL: "https://be-simkesling.lalapan-depok.com/api/v1", // Your API base URL
  // baseURL: "http://192.168.228.190:8000/api/v1", // Your API base URL
  timeout: 30000, // Request timeout in milliseconds
  headers: {
    "Content-Type": "application/json",
    // "Content-Type": "multipart/form-data",
  },
});

// Hook untuk membuat axios instance dengan notification
export const useApiWithNotification = () => {
  const { showNotification, contextHolder } = useNotification();
  
  // Create axios instance dengan interceptors yang menggunakan hooks
  const apiWithNotification = axios.create({
    baseURL: "http://localhost:8000/api/v1",
    timeout: 30000,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request interceptor
  apiWithNotification.interceptors.request.use(
    async (config: any) => {
      let token = await localStorage.getItem("token");
      if (token !== null && typeof window !== "undefined") {
        config.headers.Authorization = `Bearer ${token}`;
      }
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
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              Cookies.remove("username");
              Cookies.remove("token");
              Cookies.remove("nama_user");
              window.location.href = "/";
              return Promise.reject(error);
            }
            // console.log("disini ", error.response.data.data);
            try {
              if (Object.keys(error.response.data.data).length > 0) {
                let strmsg = Object.keys(error.response.data.data).map(
                  (val: any) => {
                    let items = error.response.data.data[val];
                    let rtr = (
                      <>
                        {val}:<br />
                        <ul>
                          {items.map((v: any, k: any) => (
                            <li key={v}>{v}</li>
                          ))}
                        </ul>
                      </>
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

// Request interceptor untuk api default (backward compatibility)
api.interceptors.request.use(
  async (config: any) => {
    let token = await localStorage.getItem("token");
    if (token !== null && typeof window !== "undefined") {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// Response interceptor untuk api default (backward compatibility)
api.interceptors.response.use(
  (response: any) => {
    return response;
  },
  (error: any) => {
    console.error(error);
    // Fallback ke static function untuk backward compatibility
    if (error.response) {
      if (error.response.data) {
        console.log(error.response.status);
        if (error.response.status == 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          Cookies.remove("username");
          Cookies.remove("token");
          Cookies.remove("nama_user");
          window.location.href = "/";
          return Promise.reject(error);
        }
      }
    }
    // alert("Error coy, cek console..!");
    return Promise.reject(error);
  }
);

export default api;
