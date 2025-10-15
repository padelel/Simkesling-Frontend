import React, { useEffect } from "react";
import { useState, createContext, useContext } from "react";
import MainLayout from "@/components/MainLayout";
import { useUserLoginStore } from "@/stores/userLoginStore";
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Select,
  Space,
  Spin,
} from "antd";
import { useRouter } from "next/router";
import { BarChartOutlined, DropboxOutlined, ExperimentOutlined } from "@ant-design/icons";
import dynamic from "next/dynamic";
import cloneDeep from "clone-deep";
import api from "@/utils/HttpRequest";
import { useGlobalStore } from "@/stores/globalStore";

const DashboardPage: React.FC = () => {
  const router = useRouter();
  const globalStore = useGlobalStore();
  const userLoginStore = useUserLoginStore();

  const navigateToDashboard = (type: 'limbah-padat' | 'limbah-cair' | 'lab-lainnya') => {
    if (type === 'lab-lainnya') {
      router.push('/dashboard/user/lab-lainnya/dashboard');
    } else {
      router.push(`/dashboard/user/${type}/dashboard`);
    }
  };

  return (
    <MainLayout title={"Dashboard"}>
      <div style={{ padding: '40px 20px', textAlign: 'center' }}>
        <h1 style={{ marginBottom: '40px', fontSize: '2.5rem', fontWeight: 'bold' }}>Dashboard Limbah</h1>
        <p style={{ marginBottom: '60px', fontSize: '1.2rem', color: '#666' }}>Pilih jenis dashboard yang ingin Anda akses</p>
        
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
              onClick={() => navigateToDashboard('lab-lainnya')}
            >
              <ExperimentOutlined style={{ fontSize: '4rem', color: '#722ed1', marginBottom: '20px' }} />
              <h3 style={{ marginBottom: '10px', fontSize: '1.5rem' }}>Dashboard Lab Lainnya</h3>
              <p style={{ color: '#666', margin: 0 }}>Kelola dan pantau data pemeriksaan lab lainnya</p>
            </Card>
          </Col>
        </Row>
      </div>
    </MainLayout>
  );
};

export default DashboardPage;
