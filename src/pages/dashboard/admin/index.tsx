import React from "react";
import MainLayout from "@/components/MainLayout";
import {
  Card,
  Col,
  Row,
} from "antd";
import { useRouter } from "next/router";
import { BarChartOutlined, DropboxOutlined, ExperimentOutlined } from "@ant-design/icons";

const DashboardAdminPage: React.FC = () => {
  const router = useRouter();

  const navigateToDashboard = (type: 'limbah-padat' | 'limbah-cair' | 'laporan-lab') => {
    if (type === 'laporan-lab') {
      router.push('/dashboard/admin/laporan-lab');
    } else {
      router.push(`/dashboard/admin/${type}`);
    }
  };

  return (
    <MainLayout title={"Dashboard Admin"}>
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <h1 style={{ marginBottom: '40px', fontSize: '2.5rem', fontWeight: 'bold' }}>Dashboard Admin Limbah</h1>
        <p style={{ marginBottom: '60px', fontSize: '1.2rem', color: '#666' }}>Pilih jenis dashboard yang ingin Anda kelola</p>
        
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
              onClick={() => navigateToDashboard('limbah-padat')}
            >
              <BarChartOutlined style={{ fontSize: '4rem', color: '#1890ff', marginBottom: '20px' }} />
              <h3 style={{ marginBottom: '10px', fontSize: '1.5rem' }}>Dashboard Limbah Padat</h3>
              <p style={{ color: '#666', margin: 0 }}>Kelola dan pantau data limbah padat</p>
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
              onClick={() => navigateToDashboard('limbah-cair')}
            >
              <DropboxOutlined style={{ fontSize: '4rem', color: '#52c41a', marginBottom: '20px' }} />
              <h3 style={{ marginBottom: '10px', fontSize: '1.5rem' }}>Dashboard Limbah Cair</h3>
              <p style={{ color: '#666', margin: 0 }}>Kelola dan pantau data limbah cair</p>
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
              onClick={() => navigateToDashboard('laporan-lab')}
            >
              <ExperimentOutlined style={{ fontSize: '4rem', color: '#722ed1', marginBottom: '20px' }} />
              <h3 style={{ marginBottom: '10px', fontSize: '1.5rem' }}>Dashboard Laporan Lab</h3>
              <p style={{ color: '#666', margin: 0 }}>Kelola dan pantau laporan laboratorium</p>
            </Card>
          </Col>
        </Row>
      </div>
    </MainLayout>
  );
};

export default DashboardAdminPage;
