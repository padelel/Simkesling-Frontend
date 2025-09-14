import { Card, Col, Image, Row } from "antd";
import React from "react";

const Overview: React.FC = () => {
  // 1. Perbaiki cardStyle: hapus properti tidak valid dan atur agar mengisi kolom
  const cardStyle: React.CSSProperties = {
    width: "100%", // Mengisi lebar <Col>
    height: "100%", // Membuat tinggi kedua kartu selalu sama
    borderRadius: "10px",
    boxShadow: "5px 8px 24px 5px rgba(208, 216, 243, 0.6)",
  };

  // 2. useEffect dan useState tidak lagi diperlukan karena Row/Col sudah responsif

  return (
    // 3. Gunakan Row dan Col untuk layout grid yang andal
    <Row gutter={[16, 16]}>
      {/* - xs={24}: Di layar kecil (extra small), kolom akan mengambil lebar penuh (24/24) 
        - md={12}: Di layar medium dan lebih besar, kolom akan mengambil setengah lebar (12/24)
      */}
      <Col xs={24} md={12}>
        <Card
          style={cardStyle}
          bordered={false}
          title="Transportasi Limbah Kesehatan"
        >
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Image
              alt="gambar"
              src="/gambar-carousel/recycling-truck.png"
              style={{
                maxWidth: "250px",
              }}
            />
          </div>
        </Card>
      </Col>

      <Col xs={24} md={12}>
        <Card
          style={cardStyle}
          title="Pengolahan Limbah Kesehatan"
          bordered={false}
        >
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Image
              alt="gambar"
              preview
              src="/gambar-carousel/industry.png"
              style={{
                maxWidth: "250px",
              }}
            />
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default Overview;