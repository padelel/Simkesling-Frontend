import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import MainLayout from "@/components/MainLayout";
import { 
  Card, 
  Typography, 
  Row, 
  Col, 
  Table, 
  Button, 
  Spin,
  Statistic,
  Tag,
  Progress,
  message,
  Breadcrumb,
  Divider
} from "antd";
import { 
  ArrowLeftOutlined,
  DownloadOutlined,
  BarChartOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  FileTextOutlined
} from "@ant-design/icons";
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import api from '@/utils/HttpRequest';
import { useGlobalStore } from '@/stores/globalStore';
import { MLaporanRekapitulasi, ResponseLaporanRekapitulasi } from '@/models/MLaporanRekapitulasi';

const { Title, Text } = Typography;

interface MonthlyDetailData {
  key: string;
  bulan: string;
  periode: number;
  berat_total: number;
  limbah_b3_medis: number;
  limbah_b3_nonmedis: number;
  limbah_jarum: number;
  limbah_sludge_ipal: number;
  nama_transporter: string;
  total_limbah_padat_infeksius: number;
  total_limbah_covid: number;
  total_limbah_padat_non_infeksius: number;
  total_limbah_jarum: number;
  total_sludge_ipal: number;
  total_limbah_padat: number;
  status: 'Ada Laporan' | 'Tidak Ada Laporan';
  tanggal_laporan: string;
  persentase_dari_total: number;
}

interface FacilityInfo {
  id_user: number;
  nama_fasilitas: string;
  tipe_tempat: string;
  alamat_tempat: string;
  kelurahan: string;
  kecamatan: string;
  total_berat_tahunan: number;
  total_laporan_tahunan: number;
  rata_rata_bulanan: number;
  persentase_kelengkapan: number;
}

const DetailLaporanLimbahPadat: React.FC = () => {
  const router = useRouter();
  const { id, tahun } = router.query;
  const globalStore = useGlobalStore();
  
  const [loading, setLoading] = useState<boolean>(false);
  const [facilityInfo, setFacilityInfo] = useState<FacilityInfo | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyDetailData[]>([]);
  const [currentYear, setCurrentYear] = useState<number>(
    tahun ? parseInt(tahun as string) : new Date().getFullYear()
  );

  // Fetch detailed data for specific facility
  const fetchDetailData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      if (globalStore.setLoading) globalStore.setLoading(true);
      
      const formData = new FormData();
      formData.append('tahun', currentYear.toString());
      
      // Use the correct API endpoint that matches the main page
      const response = await api.post('/user/laporan-rekapitulasi/data', formData);
      const responseData = response.data as ResponseLaporanRekapitulasi;
      
      if (responseData.success) {
        const apiData = responseData.data;
        
        // Find the specific user from the response
        const targetUserId = parseInt(id as string);
        let targetUser = null;
        
        // Look for the user in the users array first
        if (apiData.users && apiData.users.length > 0) {
          targetUser = apiData.users.find(user => user.id_user === targetUserId);
        }
        
        // If not found in users, look in laporan.users
        if (!targetUser && apiData.laporan && apiData.laporan.length > 0) {
          for (const laporan of apiData.laporan) {
            if (laporan.users && laporan.users.length > 0) {
              const foundUser = laporan.users.find(user => user.id_user === targetUserId);
              if (foundUser) {
                targetUser = foundUser;
                break;
              }
            }
          }
        }
        
        if (!targetUser) {
          message.error('Data fasilitas tidak ditemukan');
          return;
        }
        
        // Process facility info
        setFacilityInfo({
          id_user: targetUser.id_user,
          nama_fasilitas: targetUser.nama_tempat || targetUser.nama_user || targetUser.username,
          tipe_tempat: targetUser.tipe_tempat || 'Tidak Diketahui',
          alamat_tempat: targetUser.alamat_tempat || '',
          kelurahan: targetUser.kelurahan || '',
          kecamatan: targetUser.kecamatan || '',
          total_berat_tahunan: 0,
          total_laporan_tahunan: 0,
          rata_rata_bulanan: 0,
          persentase_kelengkapan: 0,
        });
        
        // Process monthly data
        const monthlyDetails: MonthlyDetailData[] = [];
        const monthNames = [
          'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
          'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        
        let totalBeratTahunan = 0;
        let totalLaporanTahunan = 0;
        
        // Create data for all 12 months
        for (let i = 1; i <= 12; i++) {
          const monthName = monthNames[i - 1];
          
          // Find data for this month and user
          const monthReport = apiData.laporan?.find(lap => lap.periode === i);
          const userInMonth = monthReport?.users?.find(u => u.id_user === targetUserId);
          const limbahData = userInMonth && typeof userInMonth.limbah === 'object' && userInMonth.limbah !== null 
            ? userInMonth.limbah 
            : null;
          
          const beratTotal = limbahData ? parseFloat(limbahData.berat_limbah_total?.toString() || '0') || 0 : 0;
          const limbahB3Medis = limbahData ? parseFloat(limbahData.limbah_b3_medis?.toString() || '0') || 0 : 0;
          const limbahB3NonMedis = limbahData ? parseFloat(limbahData.limbah_b3_nonmedis?.toString() || '0') || 0 : 0;
          const limbahJarum = limbahData ? parseFloat(limbahData.limbah_jarum?.toString() || '0') || 0 : 0;
          const limbahSludge = limbahData ? parseFloat(limbahData.limbah_sludge_ipal?.toString() || '0') || 0 : 0;
          
          // Get additional data for Total Limbah Padat Infeksius and Total Limbah Covid
          const limbahCovid = limbahData ? parseFloat(limbahData.limbah_b3_covid?.toString() || '0') || 0 : 
                             (userInMonth ? parseFloat(userInMonth.limbah_covid?.toString() || '0') || 0 : 0);
          const totalLimbahPadatInfeksius = limbahData ? parseFloat(limbahData.limbah_padat_infeksius?.toString() || '0') || 0 : 0;
          const totalLimbahCovid = limbahCovid;
          
          if (beratTotal > 0) {
            totalBeratTahunan += beratTotal;
            totalLaporanTahunan += 1;
          }
          
          monthlyDetails.push({
            key: i.toString(),
            bulan: monthName,
            periode: i,
            berat_total: beratTotal,
            limbah_b3_medis: limbahB3Medis,
            limbah_b3_nonmedis: limbahB3NonMedis,
            limbah_jarum: limbahJarum,
            limbah_sludge_ipal: limbahSludge,
            nama_transporter: limbahData?.nama_transporter || 'Belum Ditentukan',
            total_limbah_padat_infeksius: totalLimbahPadatInfeksius,
            total_limbah_covid: totalLimbahCovid,
            total_limbah_padat_non_infeksius: limbahB3NonMedis, // Using existing data for now
            total_limbah_jarum: limbahJarum, // Using existing data
            total_sludge_ipal: limbahSludge, // Using existing data
            total_limbah_padat: beratTotal, // Using total weight
            status: beratTotal > 0 ? 'Ada Laporan' : 'Tidak Ada Laporan',
            tanggal_laporan: limbahData ? new Date(limbahData.created_at).toLocaleDateString('id-ID') : '-',
            persentase_dari_total: 0 // Will be calculated after we have total
          });
        }
        
        // Calculate percentages and update facility info
        const rataRataBulanan = totalLaporanTahunan > 0 ? totalBeratTahunan / totalLaporanTahunan : 0;
        const persentaseKelengkapan = Math.round((totalLaporanTahunan / 12) * 100);
        
        monthlyDetails.forEach(month => {
          month.persentase_dari_total = totalBeratTahunan > 0 
            ? Math.round((month.berat_total / totalBeratTahunan) * 100) 
            : 0;
        });
        
        setMonthlyData(monthlyDetails);
        
        // Update facility info with calculated values
        setFacilityInfo(prev => prev ? {
          ...prev,
          total_berat_tahunan: totalBeratTahunan,
          total_laporan_tahunan: totalLaporanTahunan,
          rata_rata_bulanan: rataRataBulanan,
          persentase_kelengkapan: persentaseKelengkapan,
        } : null);
        
        message.success('Data detail berhasil dimuat');
      } else {
        message.error('Gagal memuat data detail: ' + (responseData.message || 'Response tidak valid'));
      }
    } catch (error: any) {
      console.error('Error fetching detail data:', error);
      let errorMessage = 'Terjadi kesalahan saat memuat data detail';
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 401) {
          errorMessage = 'Sesi telah berakhir, silakan login kembali';
        } else if (status === 403) {
          errorMessage = 'Anda tidak memiliki akses untuk melihat data ini';
        } else if (status === 404) {
          errorMessage = 'Data tidak ditemukan';
        } else if (status === 500) {
          errorMessage = 'Terjadi kesalahan pada server';
        } else if (data && data.message) {
          errorMessage = data.message;
        }
      } else if (error.request) {
        errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      message.error(errorMessage);
    } finally {
      setLoading(false);
      if (globalStore.setLoading) globalStore.setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDetailData();
    }
  }, [id, currentYear]);

  const columns: ColumnsType<MonthlyDetailData> = [
    {
      title: 'Bulan',
      dataIndex: 'bulan',
      key: 'bulan',
      width: 120,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            <CalendarOutlined /> {currentYear}
          </div>
        </div>
      )
    },
    {
      title: 'Berat Total (kg)',
      dataIndex: 'berat_total',
      key: 'berat_total',
      width: 130,
      sorter: (a, b) => a.berat_total - b.berat_total,
      render: (value) => (
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
            {value > 0 ? value.toLocaleString('id-ID', { minimumFractionDigits: 1 }) : '-'}
          </div>
          <div style={{ fontSize: '11px', color: '#666' }}>kg</div>
        </div>
      )
    },
    {
      title: 'Total Limbah Padat Infeksius (kg)',
      dataIndex: 'total_limbah_padat_infeksius',
      key: 'total_limbah_padat_infeksius',
      width: 180,
      render: (value) => (
        <div style={{ textAlign: 'right' }}>
          {value > 0 ? value.toLocaleString('id-ID', { minimumFractionDigits: 1 }) : '-'}
        </div>
      )
    },
    {
      title: 'Total Limbah Covid (kg)',
      dataIndex: 'total_limbah_covid',
      key: 'total_limbah_covid',
      width: 150,
      render: (value) => (
        <div style={{ textAlign: 'right' }}>
          {value > 0 ? value.toLocaleString('id-ID', { minimumFractionDigits: 1 }) : '-'}
        </div>
      )
    },
    {
      title: 'Total Limbah Padat Non Infeksius (kg)',
      dataIndex: 'total_limbah_padat_non_infeksius',
      key: 'total_limbah_padat_non_infeksius',
      width: 200,
      render: (value) => (
        <div style={{ textAlign: 'right' }}>
          {value > 0 ? value.toLocaleString('id-ID', { minimumFractionDigits: 1 }) : '-'}
        </div>
      )
    },
    {
      title: 'Total Limbah Jarum (kg)',
      dataIndex: 'total_limbah_jarum',
      key: 'total_limbah_jarum',
      width: 150,
      render: (value) => (
        <div style={{ textAlign: 'right' }}>
          {value > 0 ? value.toLocaleString('id-ID', { minimumFractionDigits: 1 }) : '-'}
        </div>
      )
    },
    {
      title: 'Total Sludge IPAL (kg)',
      dataIndex: 'total_sludge_ipal',
      key: 'total_sludge_ipal',
      width: 150,
      render: (value) => (
        <div style={{ textAlign: 'right' }}>
          {value > 0 ? value.toLocaleString('id-ID', { minimumFractionDigits: 1 }) : '-'}
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      filters: [
        { text: 'Ada Laporan', value: 'Ada Laporan' },
        { text: 'Tidak Ada Laporan', value: 'Tidak Ada Laporan' }
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: 'Ada Laporan' | 'Tidak Ada Laporan') => {
        const colors = {
          'Ada Laporan': 'green',
          'Tidak Ada Laporan': 'red'
        };
        return <Tag color={colors[status]}>{status}</Tag>;
      }
    },
    {
      title: 'Nama Transporter',
      dataIndex: 'nama_transporter',
      key: 'nama_transporter',
      width: 150,
      render: (text) => text || 'Belum Ditentukan'
    },
    {
      title: 'Tanggal Laporan',
      dataIndex: 'tanggal_laporan',
      key: 'tanggal_laporan',
      width: 130,
      render: (date) => date || '-'
    },
    {
      title: '% dari Total',
      dataIndex: 'persentase_dari_total',
      key: 'persentase_dari_total',
      width: 100,
      render: (value) => (
        <div style={{ textAlign: 'center' }}>
          <Progress 
            percent={value} 
            size="small" 
            showInfo={false}
            strokeColor={value > 15 ? '#52c41a' : value > 5 ? '#faad14' : '#ff4d4f'}
          />
          <div style={{ fontSize: '12px', marginTop: '2px' }}>{value}%</div>
        </div>
      )
    }
  ];

  const handleBack = () => {
    router.back();
  };

  const handleDownloadDetail = () => {
    console.log('Download detail report for facility:', facilityInfo?.id_user);
    message.info('Fitur download sedang dalam pengembangan');
  };

  if (loading) {
    return (
      <MainLayout>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <div style={{ marginTop: '20px' }}>Memuat data detail...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div style={{ padding: '24px' }}>
        {/* Breadcrumb */}
        <Breadcrumb style={{ marginBottom: '24px' }}>
          <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
          <Breadcrumb.Item>Manajemen Laporan</Breadcrumb.Item>
          <Breadcrumb.Item>Rekapitulasi Limbah Padat</Breadcrumb.Item>
          <Breadcrumb.Item>Detail Laporan</Breadcrumb.Item>
        </Breadcrumb>

        {/* Header */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col span={24}>
            <Card>
              <Row justify="space-between" align="middle">
                <Col>
                  <Button 
                    icon={<ArrowLeftOutlined />} 
                    onClick={handleBack}
                    style={{ marginRight: '16px' }}
                  >
                    Kembali
                  </Button>
                  <Title level={3} style={{ margin: 0, display: 'inline' }}>
                    Detail Laporan Limbah Padat {currentYear}
                  </Title>
                </Col>
                <Col>
                  <Button 
                    type="primary" 
                    icon={<DownloadOutlined />}
                    onClick={handleDownloadDetail}
                  >
                    Download Laporan Detail
                  </Button>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        {/* Facility Information */}
        {facilityInfo && (
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            <Col span={24}>
              <Card title="Informasi Fasilitas" extra={<EnvironmentOutlined />}>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12} md={8}>
                    <Statistic 
                      title="Nama Fasilitas" 
                      value={facilityInfo.nama_fasilitas}
                      valueStyle={{ fontSize: '16px', fontWeight: 'bold' }}
                    />
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Statistic 
                      title="Tipe Tempat" 
                      value={facilityInfo.tipe_tempat}
                      valueStyle={{ fontSize: '16px' }}
                    />
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <Statistic 
                      title="Lokasi" 
                      value={`${facilityInfo.kelurahan}, ${facilityInfo.kecamatan}`}
                      valueStyle={{ fontSize: '16px' }}
                    />
                  </Col>
                </Row>
                <Divider />
                <Text type="secondary">
                  <EnvironmentOutlined /> {facilityInfo.alamat_tempat}
                </Text>
              </Card>
            </Col>
          </Row>
        )}

        {/* Summary Statistics */}
        {facilityInfo && (
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Total Berat Tahunan"
                  value={facilityInfo.total_berat_tahunan}
                  precision={1}
                  suffix="kg"
                  valueStyle={{ color: '#1890ff' }}
                  prefix={<BarChartOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Total Laporan"
                  value={facilityInfo.total_laporan_tahunan}
                  suffix="laporan"
                  valueStyle={{ color: '#52c41a' }}
                  prefix={<FileTextOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Rata-rata Bulanan"
                  value={facilityInfo.rata_rata_bulanan}
                  precision={1}
                  suffix="kg"
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Card>
                <Statistic
                  title="Kelengkapan Laporan"
                  value={facilityInfo.persentase_kelengkapan}
                  suffix="%"
                  valueStyle={{ 
                    color: facilityInfo.persentase_kelengkapan >= 80 ? '#52c41a' : 
                           facilityInfo.persentase_kelengkapan >= 60 ? '#faad14' : '#ff4d4f' 
                  }}
                />
              </Card>
            </Col>
          </Row>
        )}

        {/* Monthly Detail Table */}
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card 
              title={`Detail Laporan Bulanan ${currentYear}`}
              extra={<CalendarOutlined />}
            >
              <Table
                columns={columns}
                dataSource={monthlyData}
                loading={loading}
                pagination={{
                  total: monthlyData.length,
                  pageSize: 12,
                  showSizeChanger: false,
                  showQuickJumper: true,
                  showTotal: (total, range) => 
                    `${range[0]}-${range[1]} dari ${total} bulan`,
                }}
                scroll={{ x: 1240 }}
                size="middle"
              />
            </Card>
          </Col>
        </Row>
      </div>
    </MainLayout>
  );
};

export default DetailLaporanLimbahPadat;