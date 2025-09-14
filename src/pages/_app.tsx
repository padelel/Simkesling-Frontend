import React, { useEffect } from "react";
import { ConfigProvider } from "antd";
import type { AppProps } from "next/app";
import theme from "../themes/themeConfig";
import { useRouter } from "next/router";
import { useUserLoginStore } from "@/stores/userLoginStore";
import jwt_decode from "jwt-decode";
import Cookies from "js-cookie";
import Head from "next/head";
import "../styles/globals.css";

const App = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();
  const userLoginStore = useUserLoginStore();

  // jika ke refresh & masih sukses login set semua data dari token ke userStore state
  useEffect(() => {
    console.log("masuk pak eko");
    if (router.pathname.toLowerCase().includes("dashboard")) {
      let pathnya = router.pathname.split("/");
      if (pathnya.length >= 3) {
        // admin or user
        let pathAccess = pathnya[2];
        if (["admin", "user"].includes(pathAccess)) {
          let token = Cookies.get("token") ?? "";
          let user = jwt_decode(token) ?? undefined;
          userLoginStore.user = user;
          console.log(user);
        }
      }
    }
  }, []);

  return (
    <ConfigProvider theme={theme}>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Component {...pageProps} />
    </ConfigProvider>
  );
};

export default App;
