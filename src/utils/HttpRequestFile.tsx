import axios from "axios";
import Notif from "./Notif";
// Create an instance of Axios with custom configurations
const apifile = axios.create({
  // baseURL: 'http://localhost:8000/api',
  baseURL: "http://localhost:8000/api/v1", // Your API base URL
  // baseURL: "http://192.168.128.190:8009", // Your API base URL
  // baseURL: "http://localhost:8009", // Your API base URL
  // baseURL: "http://192.168.250.190:8009", // Your API base URL
  // baseURL: "http://192.168.228.190:8009/", //
  // baseURL: "http://192.168.1.19:8009/", //
  // baseURL: "https://be-simkesling.lalapan-depok.com",
  timeout: 30000, // Request timeout in milliseconds
  headers: {
    // "Content-Type": "application/json",
    // "Content-Type": "multipart/form-data",
    // responseType: "blob",
    // Accept:
    //   "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
  },
});

// Request interceptor
apifile.interceptors.request.use(
  async (config: any) => {
    // if () {
    //   value = localStorage.getItem("favoriteNumber") || "";
    // }
    // Add any request transformations here, such as adding headers or modifying data
    // let token = await localStorage.getItem("token");
    // if (token !== null && typeof window !== "undefined") {
    //   config.headers.Authorization = `${token}`;
    // }
    // console.log(config)
    return config;
  },
  (error: any) => {
    // Handle request errors
    return Promise.reject(error);
  }
);

// Response interceptor
apifile.interceptors.response.use(
  (response: any) => {
    // Add any response transformations here, such as modifying response data
    return response;
  },
  (error: any) => {
    console.error("-- errorHttpReqFile --");
    console.error(error);
    console.error(error.message);
    console.error("-- [END] errorHttpReqFile --");
    Notif("warning", "Something Wrong.!", error.message.toString());
    // Handle response errors
    return Promise.reject(error);
  }
);

export default apifile;
