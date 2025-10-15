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
  Typography,
  Divider,
} from "antd";
import { BarChartOutlined, CalendarOutlined, FilterOutlined } from "@ant-design/icons";
import cloneDeep from "clone-deep";
import api from "@/utils/HttpRequest";
import { useGlobalStore } from "@/stores/globalStore";

const { Title, Text } = Typography;

const DashboardLabLainnyaPage: React.FC = () => {
  const globalStore = useGlobalStore();
  const userLoginStore = useUserLoginStore();
  const messageLab = "Anda belum mengisi data pemeriksaan lab periode";
  const [pesan, setPesan] = useState("");
  const [judulChart, setJudulChart] = useState("");
  const [lapor, setLapor] = useState(false);
  const [bulanSudahLapor, setBulanSudahLapor] = useState<boolean[]>([]);

  const [formInstance] = Form.useForm();

  let tmpForm = {
    tahun: "",
  };

  const [form, setForm] = useState(cloneDeep(tmpForm));

  const handleChangePeriode = (val: any, name: string, event: any) => {
    const periode = parseInt(val);
    console.log(val);
    console.log(periode);
    setForm({
      ...form,
      [name]: val,
    });
  };

  const handleChangeInput = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    // console.log(event);
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const hitDashboard = async () => {
    if (globalStore.setLoading) globalStore.setLoading(true);
    try {
      let dataForm: any = new FormData();
      dataForm.append("tahun", form.tahun);
      let url = "/user/dashboard-user/data-lab";
      let responsenya = await api.post(url, dataForm);
      
      // Set data bulan sudah lapor
      if (responsenya.data.data.values.bulan_sudah_lapor && Array.isArray(responsenya.data.data.values.bulan_sudah_lapor)) {
        setBulanSudahLapor(responsenya.data.data.values.bulan_sudah_lapor);
      } else {
        setBulanSudahLapor([false, false, false, false, false, false, false, false, false, false, false, false]);
      }
      
      let tmpPesan = "";
      let tmpJudulChart = "";
      if (responsenya.data.data.values.sudah_lapor) {
        tmpPesan = `Anda Sudah Mengisi Laporan Pada Periode ${responsenya.data.data.values.laporan_periode_nama} ${responsenya.data.data.values.laporan_periode_tahun}`;
        tmpJudulChart = `Total Pemeriksaan Lab Lainnya Tahun ${responsenya.data.data.values.laporan_periode_tahun}
       ${userLoginStore.user?.nama_user}`;
      } else {
        tmpPesan = `Anda Belum Mengisi Laporan Pada Periode ${responsenya.data.data.values.laporan_periode_nama} ${responsenya.data.data.values.laporan_periode_tahun}`;
        tmpJudulChart = `Total Pemeriksaan Lab Lainnya Tahun ${responsenya.data.data.values.laporan_periode_tahun}
       ${userLoginStore.user?.nama_user}`;
      }
      setPesan(tmpPesan);
      setJudulChart(tmpJudulChart);
      setLapor(responsenya.data.data.values.sudah_lapor);
      console.log(responsenya);
      console.log(tmpJudulChart);
    } catch (e) {
      console.error(e);
    } finally {
      if (globalStore.setLoading) globalStore.setLoading(false);
    }
  };

  useEffect(() => {
    hitDashboard();
  }, []);

  return (
    <MainLayout title={"Dashboard Pemeriksaan Lab Lainnya"}>
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        minHeight: '100vh',
        padding: '24px'
      }}>
        <Spin spinning={globalStore.isloading}>
          {/* Header Section */}
          <Card 
            style={{ 
              marginBottom: '24px',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              border: 'none',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
            }}
          >
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <BarChartOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
              <Title level={2} style={{ margin: 0, color: '#333', fontWeight: 700 }}>
                Dashboard Pemeriksaan Lab Lainnya
              </Title>
              <Text style={{ fontSize: '16px', color: '#666' }}>
                Monitoring dan Analisis Data Pemeriksaan Laboratorium
              </Text>
            </div>
          </Card>

          {/* Filter Section */}
          <Card 
            style={{ 
              marginBottom: '24px',
              borderRadius: '12px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              border: 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <FilterOutlined style={{ fontSize: '20px', color: '#1890ff', marginRight: '8px' }} />
              <Title level={4} style={{ margin: 0, color: '#333' }}>Filter Data</Title>
            </div>
            
            <Form form={formInstance}>
              <Row gutter={16} align="middle">
                <Col xs={24} sm={12} md={8}>
                  <Form.Item name="form_tahun" label="Tahun" style={{ marginBottom: 0 }}>
                    <Input
                      placeholder="Masukan Tahun (contoh: 2024)"
                      onChange={handleChangeInput}
                      maxLength={4}
                      name="tahun"
                      size="large"
                      prefix={<CalendarOutlined style={{ color: '#1890ff' }} />}
                      style={{ borderRadius: '8px' }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Button 
                    type="primary" 
                    onClick={hitDashboard}
                    size="large"
                    style={{ 
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                      border: 'none',
                      fontWeight: 600,
                      height: '40px',
                      minWidth: '120px'
                    }}
                  >
                    <FilterOutlined /> Filter Data
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card>

          {/* Alert Section */}
          <Card 
            style={{ 
              marginBottom: '24px',
              borderRadius: '12px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
              border: 'none'
            }}
          >
            {!lapor && (
              <Alert
                message="📋 Status Laporan"
                description={pesan}
                type="warning"
                showIcon
                style={{ 
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #fff7e6 0%, #fff2d3 100%)'
                }}
              />
            )}
            {lapor && (
              <Alert
                message="✅ Status Laporan"
                description={pesan}
                type="success"
                showIcon
                style={{ 
                  borderRadius: '8px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)'
                }}
              />
            )}
          </Card>

          {/* Monthly Status Section */}
          <Card 
            style={{ 
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              border: 'none',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
            }}
          >
            <div style={{ padding: '20px' }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <CalendarOutlined style={{ fontSize: '32px', color: '#1890ff', marginBottom: '12px' }} />
                <Title level={3} style={{ margin: 0, color: '#333', fontWeight: 600 }}>
                  Status Laporan Bulanan {form.tahun || new Date().getFullYear()}
                </Title>
                <Text style={{ fontSize: '14px', color: '#666' }}>
                  Pantau status kelengkapan laporan setiap bulan
                </Text>
              </div>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                gap: '16px',
                maxWidth: '1000px',
                margin: '0 auto'
              }}>
                {[
                  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
                ].map((bulan, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '20px 16px',
                      borderRadius: '12px',
                      textAlign: 'center',
                      background: bulanSudahLapor[index] 
                        ? 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)' 
                        : 'linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%)',
                      color: 'white',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                      transform: 'translateY(0)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(255,255,255,0.1)',
                      opacity: 0,
                      transition: 'opacity 0.3s ease'
                    }} />
                    <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
                      {bulan}
                    </div>
                    <div style={{ 
                      fontSize: '24px', 
                      marginBottom: '4px',
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                    }}>
                      {bulanSudahLapor[index] ? '✅' : '❌'}
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 500, opacity: 0.9 }}>
                      {bulanSudahLapor[index] ? 'Sudah Lapor' : 'Belum Lapor'}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Legend */}
              <div style={{ 
                marginTop: '32px', 
                textAlign: 'center',
                padding: '20px',
                background: 'linear-gradient(135deg, #f0f2f5 0%, #e6f7ff 100%)',
                borderRadius: '12px',
                border: '1px solid #d9d9d9'
              }}>
                <Title level={5} style={{ marginBottom: '16px', color: '#333' }}>Keterangan Status</Title>
                <Row justify="center" gutter={32}>
                  <Col>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ 
                        width: '20px', 
                        height: '20px', 
                        background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)', 
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px'
                      }}>
                        ✅
                      </div>
                      <Text style={{ fontWeight: 500, color: '#333' }}>Sudah Lapor</Text>
                    </div>
                  </Col>
                  <Col>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ 
                        width: '20px', 
                        height: '20px', 
                        background: 'linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%)', 
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px'
                      }}>
                        ❌
                      </div>
                      <Text style={{ fontWeight: 500, color: '#333' }}>Belum Lapor</Text>
                    </div>
                  </Col>
                </Row>
              </div>
            </div>
          </Card>
        </Spin>
      </div>
    </MainLayout>
  );
};

export default DashboardLabLainnyaPage;