import React, { useEffect } from "react";
import { ConfigProvider, App as AntdApp } from "antd";
import type { AppProps } from "next/app";
import theme from "../themes/themeConfig";
import { useRouter } from "next/router";
import { useUserLoginStore } from "@/stores/userLoginStore";
import Cookies from "js-cookie";

import "../styles/globals.css";

// Set CSP nonce to be used by Ant Design and style-loader
const runtimeCookieNonce = typeof window !== "undefined" ? Cookies.get("nonce") : undefined;
const nonce = runtimeCookieNonce || process.env.NEXT_PUBLIC_CSP_NONCE || process.env.CSP_NONCE || "DEVSCAN123";
if (typeof window !== "undefined") {
  // Ensure style-loader attaches nonce to <style> tags in dev
  (window as any).__webpack_nonce__ = nonce;
}

const App = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();
  const userLoginStore = useUserLoginStore();

  // Ambil user dari cookie HttpOnly via backend (tanpa jwt-decode di frontend)
  useEffect(() => {
    if (router.pathname.toLowerCase().includes("dashboard")) {
      (async () => {
        try {
          const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
          const res = await fetch(`${apiBase}/api/v1/auth/me`, {
            credentials: "include",
          });
          if (res.ok) {
            const json = await res.json();
            const user = (json && (json.data ?? json.values)) ?? undefined;
            userLoginStore.user = user as any;
            console.log("auth/me user", user);
          } else {
            console.log("auth/me failed", res.status);
          }
        } catch (err) {
          console.log("auth/me error", err);
        }
      })();
    }
  }, [router.pathname]);

  return (
    <ConfigProvider theme={theme} nonce={nonce}>
      <div>
        <AntdApp>
          <Component {...pageProps} />
        </AntdApp>
      </div>
    </ConfigProvider>
  );
};

export default App;
