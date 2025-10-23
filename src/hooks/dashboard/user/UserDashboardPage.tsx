import React from "react";
import MainLayout from "@/components/MainLayout";
import { Row, Col, Card } from "antd";
import { useRouter } from "next/router";
import { BarChartOutlined, DropboxOutlined, ExperimentOutlined } from "@ant-design/icons";
import styles from "./UserDashboardPage.module.css";

const DashboardPage: React.FC = () => {
  const router = useRouter();

  const navigateToDashboard = (type: 'limbah-padat' | 'limbah-cair' | 'lab-lainnya') => {
    if (type === 'lab-lainnya') {
      router.push('/dashboard/user/lab-lainnya/dashboard');
    } else {
      router.push(`/dashboard/user/${type}/dashboard`);
    }
  };

  return (
    <MainLayout title={"Dashboard"}>
      <div className={styles.container}>
        <h1 className={styles.heading}>Dashboard Limbah</h1>
        <p className={styles.subheading}>Pilih jenis dashboard yang ingin Anda akses</p>
        
        <Row gutter={[32, 32]} justify="center">
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              className={styles.card}
              onClick={() => navigateToDashboard('limbah-padat')}
            >
              <BarChartOutlined className={`${styles.icon} ${styles.iconPadat}`} />
              <h3 className={styles.cardTitle}>Dashboard Limbah Padat</h3>
              <p className={styles.cardText}>Kelola dan pantau data limbah padat</p>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              className={styles.card}
              onClick={() => navigateToDashboard('limbah-cair')}
            >
              <DropboxOutlined className={`${styles.icon} ${styles.iconCair}`} />
              <h3 className={styles.cardTitle}>Dashboard Limbah Cair</h3>
              <p className={styles.cardText}>Kelola dan pantau data limbah cair</p>
            </Card>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Card
              hoverable
              className={styles.card}
              onClick={() => navigateToDashboard('lab-lainnya')}
            >
              <ExperimentOutlined className={`${styles.icon} ${styles.iconLab}`} />
              <h3 className={styles.cardTitle}>Dashboard Lab Lainnya</h3>
              <p className={styles.cardText}>Kelola dan pantau data pemeriksaan lab lainnya</p>
            </Card>
          </Col>
        </Row>
      </div>
    </MainLayout>
  );
};

export default DashboardPage;
