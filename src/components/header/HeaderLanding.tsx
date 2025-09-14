import React from "react";
import { Layout, Menu, Button, Image } from "antd";
import Link from "next/link";

const { Header } = Layout;

const HeaderLanding = () => {
  return (
    <Layout className="layout">
      <Header
        style={{
          display: "flex",
          justifyContent: "space-between",
          background: "white",
          padding: 0,
        }}
      >
        <div>
          <Link href="/">
            <Image
              preview={false}
              width={60}
              height="auto"
              src="/icon-navbar/kotadepok.png"
              alt="icon-depok"
            />
          </Link>
        </div>
        <div>
          <Image
            preview={false}
            height={60}
            src="/icon-navbar/smart-city.png"
            alt="icon-depok"
          />
        </div>
      </Header>
    </Layout>
  );
};

export default HeaderLanding;
