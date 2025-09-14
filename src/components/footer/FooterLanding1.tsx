import { Footer } from "antd/es/layout/layout";
import {
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  FacebookOutlined,
  InstagramOutlined,
  YoutubeOutlined,
} from "@ant-design/icons";
import React from "react";

const FooterLanding = () => {
  return (
    <Footer
      style={{
        borderTop: "1px solid #e8e8e8",
        backgroundColor: "#007BFF",
        color: "#fff",
        textAlign: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: "column", // Mengubah tata letak menjadi kolom di ponsel
        }}
      >
        <div style={{ width: "100%" }}>
          <h2 style={{ color: "#fff" }}>Lokasi Dinas Kesehatan Kota Depok</h2>
          <iframe
            src="https://maps.google.com/maps?q=dinas%20kesehatan%20kota%20depok&amp;t=&amp;z=13&amp;ie=UTF8&amp;iwloc=&amp;output=embed"
            width="300"
            height="200"
            style={{ border: "0" }}
            loading="lazy"
          ></iframe>
        </div>
        <div style={{ width: "100%" }}>
          <h2 style={{ color: "#fff" }}>Kontak</h2>
          <p>
            <PhoneOutlined style={{ color: "#fff", marginRight: "5px" }} />
            Nomor Telepon: +1234567890
          </p>
          <p>
            <MailOutlined style={{ color: "#fff", marginRight: "5px" }} />
            Email: your@email.com
          </p>
          <p>
            <EnvironmentOutlined
              style={{ color: "#fff", marginRight: "5px" }}
            />
            Lokasi: Nama Lokasi, Kota
          </p>
        </div>
      </div>
      <div style={{ marginTop: "20px" }}>
        <a
          href="https://www.facebook.com/your-facebook-page"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FacebookOutlined
            style={{ fontSize: "24px", color: "#fff", marginRight: "10px" }}
          />
        </a>
        <a
          href="https://www.instagram.com/your-instagram-page"
          target="_blank"
          rel="noopener noreferrer"
        >
          <InstagramOutlined
            style={{ fontSize: "24px", color: "#fff", marginRight: "10px" }}
          />
        </a>
        <a
          href="https://www.youtube.com/your-youtube-channel"
          target="_blank"
          rel="noopener noreferrer"
        >
          <YoutubeOutlined style={{ fontSize: "24px", color: "#fff" }} />
        </a>
      </div>
      <p>&copy; {new Date().getFullYear()} Pengmas PNJ</p>
    </Footer>
  );
};

export default FooterLanding;
