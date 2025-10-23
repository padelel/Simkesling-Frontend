import axios from "axios";

// Base URL file dari env (fallback ke domain produksi publik)
const fileBase = process.env.NEXT_PUBLIC_FILE_BASE_URL || "https://be-simkesling.lalapan-depok.com";

const apifile = axios.create({
  baseURL: fileBase,
  // baseURL: "https://be-simkesling.lalapan-depok.com",
  timeout: 30000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

apifile.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("File request error:", error);
    return Promise.reject(error);
  }
);

export default apifile;
