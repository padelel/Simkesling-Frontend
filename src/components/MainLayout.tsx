import {
  UploadOutlined,
  UserOutlined,
  DashboardOutlined,
  VideoCameraOutlined,
  CarOutlined,
  OrderedListOutlined,
  BarChartOutlined,
  ProfileOutlined,
  LogoutOutlined,
  HomeOutlined,
  SafetyCertificateOutlined,
  TableOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Spin, theme, Typography } from "antd";
import React, { ReactNode, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { useUserLoginStore } from "@/stores/userLoginStore";
import { useGlobalStore } from "@/stores/globalStore";
import cookie from "js-cookie";
import jwt_decode from "jwt-decode";
import Link from "next/link";

const { Title } = Typography;
interface MainLayoutProps {
  children: ReactNode;
  title?: string;
}

const { Header, Content, Footer, Sider } = Layout;

const MainLayout: React.FC<MainLayoutProps> = ({ children, title }) => {
  const {
    token: { colorBgContainer },
  } = theme.useToken();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const userLoginStore = useUserLoginStore();
  const globalStore = useGlobalStore();

  const [items, setItems] = useState<any[]>([]);

  const tmpItems = [
    {
      icon: <DashboardOutlined />,
      label: "Dashboard",
      path: "/dashboard/user",
      level: "user",
    },
    {
      icon: <CarOutlined />,
      label: "Pengajuan Transporter",
      path: "/dashboard/user/pengajuantransporter",
      level: "user",
    },
    {
      icon: <OrderedListOutlined />,
      label: "List Transporter",
      path: "/dashboard/user/transporter",
      level: "user",
    },
    {
      icon: <BarChartOutlined />,
      label: "Laporan Limbah",
      path: "/dashboard/user/limbah",
      level: "user",
    },
    {
      icon: <ProfileOutlined />,
      label: "Profil",
      path: "/dashboard/user/profile",
      level: "user",
    },
    {
      icon: <HomeOutlined />,
      label: "Dashboard",
      path: "/dashboard/admin",
      level: "admin",
    },
    {
      icon: <TableOutlined />,
      label: "Manajemen Puskesmas / Rumah Sakit",
      path: "/dashboard/admin/manajemen/profil",
      level: "admin",
    },
    {
      icon: <TableOutlined />,
      label: "Manajemen Transporter",
      path: "/dashboard/admin/manajemen/transporter",
      level: "admin",
    },
    {
      icon: <SafetyCertificateOutlined />,
      label: "Validasi Pengajuan Transporter",
      path: "/dashboard/admin/validasi",
      level: "admin",
    },
    {
      icon: <TableOutlined />,
      label: "Manajemen Laporan",
      path: "/dashboard/admin/manajemen/laporan",
      level: "admin",
    },
    {
      icon: <TableOutlined />,
      label: "Manajemen Laporan Rekapitulasi",
      path: "/dashboard/admin/manajemen/laporan-rekapitulasi",
      level: "admin",
    },
    {
      icon: <LogoutOutlined />,
      label: "Logout",
      path: "/",
    },
  ].map((item, index) => ({
    key: item.path,
    ...item,
  }));

  const onClickMenu = async (item: any) => {
    const clicked = items.find((_item) => _item.key === item.key);
    if (clicked?.label.toLowerCase() == "logout") {
      if (userLoginStore.prosesLogout) {
        let a = await userLoginStore.prosesLogout();
        router.push(clicked!.path);
      }
    } else {
      router.push(clicked!.path);
    }
  };

  useEffect(() => {
    // const cookieStore = cookies();
    let token = cookie.get("token");
    let user = token ? jwt_decode(token) : null;
    let level = user.level;
    console.log(level);
    console.log(user);
    console.log(token);

    let menu = tmpItems.filter((val) => {
      if (val.level == undefined || val.level == null) return true;
      let cekAdmin = level == "1" && val.level == "admin";
      let cekUser = level != "1" && val.level != "admin";
      console.log("--cekAdmin");
      console.log(cekAdmin);
      console.log("--cekUser");
      console.log(cekUser);
      if (cekAdmin) return true;
      if (cekUser) return true;
      // else return true;
      // return level === "1" && val.level == "admin";
      // return level !== "1" && val.level == "user";
    });

    setItems(menu);
  }, []);

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* STYLING */}
      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
        }
      `}</style>

      <Sider
        breakpoint="lg"
        collapsedWidth="0"
        onBreakpoint={(broken: any) => {
          console.log(broken);
        }}
        width={280}
        collapsible
        collapsed={collapsed}
        onCollapse={(value: any) => setCollapsed(value)}
        style={{ background: colorBgContainer }}>
        <div
          style={{
            justifyContent: "center",
            display: "flex",
            marginTop: "30px",
          }}>
          <Image
            preview={false}
            width={75}
            height={85}
            src="/icon-navbar/kotadepok.png"
            alt="icon-depok"
          />
          {/* <Image
            preview={false}
            src="/icon-navbar/kotadepok.png"
            alt="Logo"
            width={75}
            height={85}
          /> */}
          {/* <Image
            src="/icon-navbar/kotadepok.png"
            alt="Logo"
            width={75}
            height={85}
            priority
          /> */}
          <br />
        </div>
        <h4 style={{ textAlign: "center" }}>
          Sistem Informasi Manajemen Kesehatan Lingkungan
          <br />
          Kota Depok
        </h4>
        <div>
          {/* <h5 style={{ textAlign: "center" }}>
            Puskesmas Pasir Gunung Selatan
          </h5> */}
        </div>
        {/* <Menu
          mode="inline"
          defaultSelectedKeys={[router.pathname]}
          selectedKeys={[router.pathname]}
          items={items}
          onClick={onClickMenu}
        /> */}
        <Menu
          mode="inline"
          defaultSelectedKeys={[router.pathname]}
          selectedKeys={[router.pathname]}
          onClick={onClickMenu}>
          {items.map((item) => (
            <Menu.Item key={item.key}>
              <Link href={item.path} legacyBehavior>
                {/* <a target="_blank" rel="noopener noreferrer">
                </a> */}
                {/* <>
                  {item.icon}
                  <span>{item.label}</span>
                </> */}
                <a>
                  {item.icon}
                  <span>{item.label}</span>
                </a>
              </Link>
            </Menu.Item>
          ))}
        </Menu>
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer }}>
          {/* <div style={{ display: "flex", justifyContent: "center" }}>
            <h2>{title}</h2>
          </div> */}
          <Title level={5}>{title}</Title>
        </Header>
        <Spin spinning={globalStore.isloading}>
          <Content style={{ margin: "10px 8px 0" }}>
            <div
              style={{
                padding: 8,
                background: colorBgContainer,
              }}>
              {/* Lorem ipsum dolor sit amet consectetur adipisicing elit. Officia */}
              {children}
            </div>
          </Content>
        </Spin>
        <Footer style={{ textAlign: "center" }}>SIMKESLING ©2023</Footer>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
