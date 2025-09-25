import React from "react";
import MainLayout from "@/components/MainLayout";
import {
  Card,
  Col,
  Row,
} from "antd";
import { useRouter } from "next/router";
import { BarChartOutlined, DropboxOutlined } from "@ant-design/icons";

const ManajemenLaporanPage: React.FC = () => {
  const router = useRouter();

  const navigateToLaporan = (type: 'limbah-padat' | 'limbah-cair') => {
    router.push(`/dashboard/admin/manajemen/laporan/${type}`);
  };

  return (
    <MainLayout title={"Manajemen Laporan"}>
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <h1 style={{ marginBottom: '40px', fontSize: '2.5rem', fontWeight: 'bold' }}>Manajemen Laporan Limbah</h1>
        <p style={{ marginBottom: '60px', fontSize: '1.2rem', color: '#666' }}>Pilih jenis laporan limbah yang ingin Anda kelola</p>
        
        <Row gutter={[32, 32]} justify="center">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              style={{
                textAlign: 'center',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease'
              }}
              bodyStyle={{ padding: '40px 20px' }}
              onClick={() => navigateToLaporan('limbah-padat')}
            >
              <BarChartOutlined style={{ fontSize: '4rem', color: '#1890ff', marginBottom: '20px' }} />
              <h3 style={{ marginBottom: '10px', fontSize: '1.5rem' }}>Laporan Limbah Padat</h3>
              <p style={{ color: '#666', margin: 0 }}>Kelola laporan limbah padat dari puskesmas dan rumah sakit</p>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              style={{
                textAlign: 'center',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease'
              }}
              bodyStyle={{ padding: '40px 20px' }}
              onClick={() => navigateToLaporan('limbah-cair')}
            >
              <DropboxOutlined style={{ fontSize: '4rem', color: '#52c41a', marginBottom: '20px' }} />
              <h3 style={{ marginBottom: '10px', fontSize: '1.5rem' }}>Laporan Limbah Cair</h3>
              <p style={{ color: '#666', margin: 0 }}>Kelola laporan limbah cair dari puskesmas dan rumah sakit</p>
            </Card>
          </Col>
        </Row>
      </div>
    </MainLayout>
  );
};

export default ManajemenLaporanPage;
