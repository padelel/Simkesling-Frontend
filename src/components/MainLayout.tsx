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
  DownOutlined,
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
      level: "user",
      type: "submenu",
      children: [
        {
          label: "Dashboard Limbah B3",
          path: "/dashboard/user/limbah-padat/dashboard",
          level: "user",
        },
        {
          label: "Dashboard Limbah Cair",
          path: "/dashboard/user/limbah-cair/dashboard",
          level: "user",
        },
        {
          label: "Dashboard Pemeriksaan Lab",
          path: "/dashboard/user/lab-lainnya/dashboard",
          level: "user",
        },
      ],
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
      level: "user",
      type: "submenu",
      children: [
        {
          label: "Laporan Limbah B3",
          path: "/dashboard/user/limbah-padat",
          level: "user",
        },
        {
          label: "Laporan Limbah Cair",
          path: "/dashboard/user/limbah-cair",
          level: "user",
        },
        {
          label: "Laporan Pemeriksaan Lab Lainnya",
          path: "/dashboard/user/lab-lainnya",
          level: "user",
        },
      ],
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
      level: "admin",
      type: "submenu",
      children: [
        {
          label: "Limbah B3",
          path: "/dashboard/admin/limbah-padat",
          level: "admin",
        },
        {
          label: "Limbah Cair",
          path: "/dashboard/admin/limbah-cair",
          level: "admin",
        },
        {
          label: "Laporan Lab",
          path: "/dashboard/admin/laporan-lab",
          level: "admin",
        },
      ],
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
      level: "admin",
      type: "submenu",
      children: [
        {
          label: "Laporan Limbah B3",
          path: "/dashboard/admin/manajemen/laporan/limbah-padat",
          level: "admin",
        },
        {
          label: "Laporan Limbah Cair",
          path: "/dashboard/admin/manajemen/laporan/limbah-cair",
          level: "admin",
        },
        {
          label: "Laporan Pemeriksaan Lab Lainnya",
          path: "/dashboard/admin/manajemen/laporan/lab-lainnya",
          level: "admin",
        },
      ],
    },
    {
      icon: <TableOutlined />,
      label: "Manajemen Laporan Rekapitulasi",
      level: "admin",
      type: "submenu",
      children: [
        {
          label: "Limbah B3",
          path: "/dashboard/admin/manajemen/laporan-rekapitulasi/limbah-padat",
          level: "admin",
        },
        {
          label: "Limbah Cair",
          path: "/dashboard/admin/manajemen/laporan-rekapitulasi/limbah-cair",
          level: "admin",
        },
        {
          label: "Laporan Lab",
          path: "/dashboard/admin/manajemen/laporan-rekapitulasi/laporan-lab",
          level: "admin",
        },
      ],
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
    // For submenu items, the key is the path
    if (item.key === "/") {
      // Logout case
      if (userLoginStore.prosesLogout) {
        let a = await userLoginStore.prosesLogout();
        router.push("/");
      }
    } else {
      // For regular menu items and submenu items, use the key as path
      router.push(item.key);
    }
  };

  useEffect(() => {
    // Ambil token dari cookie atau localStorage secara aman
    const token = cookie.get("token") || (typeof window !== 'undefined' ? localStorage.getItem("token") : "");

    // Decode token secara defensif (hindari crash saat token belum tersedia)
    let user: any = null;
    try {
      user = token ? jwt_decode(token) : null;
    } catch (e) {
      // abaikan error decode jika token belum valid/tersedia
    }

    const level = user?.level?.toString() || "";

    let menu = tmpItems.filter((val) => {
      if (val.level == undefined || val.level == null) return true;
      const cekAdmin = level === "1" && val.level === "admin";
      const cekUser = level !== "1" && val.level !== "admin";
      if (cekAdmin) return true;
      if (cekUser) return true;
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
          D'Smiling
          <br />
          Depok Sistem Manajemen Kesehatan Lingkungan
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
          items={items.map((item) => {
            if (item.type === "submenu") {
              return {
                key: item.label,
                icon: item.icon,
                label: item.label,
                children: item.children?.map((child: any) => ({
                  key: child.path,
                  label: (
                    <Link href={child.path} legacyBehavior>
                      <a>{child.label}</a>
                    </Link>
                  ),
                })),
              };
            } else {
              return {
                key: item.key,
                icon: item.icon,
                label: (
                  <Link href={item.path} legacyBehavior>
                    <a>
                      <span>{item.label}</span>
                    </a>
                  </Link>
                ),
              };
            }
          })}
          onClick={onClickMenu}
        />
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
