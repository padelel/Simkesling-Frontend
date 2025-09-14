import { useGlobalStore } from "@/stores/globalStore";
import axios from "axios";
import Notif from "./Notif";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
// Create an instance of Axios with custom configurations
const api = axios.create({
  // baseURL: "https://be-simkesling.lalapan-depok.com/api/v1",
  // baseURL: 'http://localhost:8000/api',
  // baseURL: "http://192.168.1.19:8000/api/v1", // Your API base URL
  // baseURL: "http://192.168.128.190:8000/api/v1", // Your API base URL
  baseURL: "http://localhost:8000/api/v1", // Your API base URL
  // baseURL: "https://be-simkesling.lalapan-depok.com/api/v1", // Your API base URL
  // baseURL: "http://192.168.228.190:8000/api/v1", // Your API base URL
  timeout: 30000, // Request timeout in milliseconds
  headers: {
    // "Content-Type": "application/json",
    "Content-Type": "multipart/form-data",
  },
});

// Request interceptor
api.interceptors.request.use(
  async (config: any) => {
    // if () {
    //   value = localStorage.getItem("favoriteNumber") || "";
    // }
    // Add any request transformations here, such as adding headers or modifying data
    let token = await localStorage.getItem("token");
    if (token !== null && typeof window !== "undefined") {
      config.headers.Authorization = `${token}`;
    }
    // console.log(config)

    return config;
  },
  (error: any) => {
    // Handle request errors
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: any) => {
    // Add any response transformations here, such as modifying response data
    return response;
  },
  (error: any) => {
    console.error(error);
    Notif("warning", "Something Wrong.!", error.message.toString());
    if (error.response) {
      if (error.response.data) {
        Notif("error", "Problem: ", error.response.data.message.toString(), 7);
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
            Notif("error", "Detail: ", strmsg, 10);
          }
        } catch (e) {}
      }
    }
    // alert("Error coy, cek console..!");
    // Handle response errors
    return Promise.reject(error);
  }
);

export default api;
