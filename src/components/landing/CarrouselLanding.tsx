import React, { useState, useEffect } from "react";
import { Button, Modal, Space, Spin } from "antd";
import { LoginOutlined } from "@ant-design/icons";
import { InfoCircleOutlined } from "@ant-design/icons";
import bg from "../../../public/gambar-carousel/Balaikota-Depok.jpg";
import bg2 from "../../../public/gambar-carousel/limbah-ilustration.jpg";
import { SizeType } from "antd/es/config-provider/SizeContext";
import { SpaceSize } from "antd/es/space";
import Link from "next/link";
import FormLogin from "../login/FormLogin";
// import { Roboto } from "next/font/google";
import { useGlobalStore } from "@/stores/globalStore";

const CarrouselLanding = () => {
  const globalStore = useGlobalStore();
  const [sizeButton, setSizeButton] = useState<SizeType>("large"); // default is 'middle'
  const [size, setSize] = useState<SpaceSize | [SpaceSize, SpaceSize]>("small");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bgImage, setBgImage] = useState(bg2.src);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      // Berganti gambar latar belakang setiap 5 detik
      setBgImage((prevImage) => (prevImage === bg.src ? bg2.src : bg.src));
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div
      className="flex"
      style={{
        color: "#fff",
        width: "100%",
        textAlign: "center",
        backgroundImage: `url(${bgImage})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        position: "relative", // Add this line
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(0,0,0, 0.60)",
          top: 0,
          paddingTop: 100,
          paddingBottom: 100,
          left: 0,
          height: "100%",
        }}
      >
        <h2 style={{ fontFamily: "Roboto, Arial, sans-serif" }}>
          D&apos;Smiling
          <br />
          Depok Sistem Manajemen Kesehatan Lingkungan
        </h2>
        <Space size={size}>
          <Button
            type="primary"
            icon={<LoginOutlined />}
            onClick={showModal}
            size={sizeButton}
          >
            Login
          </Button>

          <Button href="https://s.pnj.ac.id/pedomansimkesling" target="_blank" type="primary" icon={<InfoCircleOutlined />} size={sizeButton} style={
              {
                backgroundColor: '#fa8c16'
              }
            }>
          Petunjuk Pemakaian
        </Button>
        </Space>

        <Modal
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
          footer={null}
        >
          <h2 style={{ textAlign: "center" }}>Login Simkesling</h2>
          <Spin spinning={globalStore.isloading}>
          <FormLogin />
          </Spin>
        </Modal>
      </div>
    </div>
  );
};

export default CarrouselLanding;
