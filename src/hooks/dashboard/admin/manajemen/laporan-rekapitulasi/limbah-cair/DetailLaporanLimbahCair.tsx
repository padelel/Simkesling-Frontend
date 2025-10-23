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

const { Title, Text } = Typography;

interface MonthlyDetailData {
  key: string;
  bulan: string;
  periode: number;
  volume_total: number;
  debit_air_limbah: number;
  ph: number;
  tss: number;
  bod: number;
  cod: number;
  minyak_lemak: number;
  amoniak: number;
  nama_transporter: string;
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
  total_volume_tahunan: number;
  total_laporan_tahunan: number;
  rata_rata_bulanan: number;
  persentase_kelengkapan: number;
}

const DetailLaporanLimbahCair: React.FC = () => {
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
      // PENJELASAN: Mengirim filter kosong ini penting agar endpoint admin
      // mengembalikan data SEMUA fasilitas, bukan hanya data admin yang login.
      formData.append('nama_user', ''); 
      
      // KONFIRMASI: Anda sudah benar menggunakan endpoint admin ini
      const response = await api.post('/user/limbah-cair/data', formData);
      
      if (response.data && response.data.data) {
        const apiData = response.data.data.values || [];
        
        const targetUserId = parseInt(id as string);
        
        // --- PERBAIKAN 1: LOGIKA FILTER ---
        // Menggunakan '==' (perbandingan longgar) untuk mengatasi masalah "string" vs number.
        const userReports = apiData.filter((item: any) => 
          (item.id_user == targetUserId) || (item.user?.id_user == targetUserId)
        );
        
        // Bagian ini menangani jika fasilitas ada tapi belum pernah melapor sama sekali
        if (userReports.length === 0) {
          const allFacilitiesResponse = await api.post("/user/puskesmas-rumahsakit/data");
          const allFacilities = allFacilitiesResponse.data.data.values || [];
          const targetFacility = allFacilities.find((facility: any) => facility.id_user === targetUserId);
          
          if (targetFacility) {
            setFacilityInfo({
              id_user: targetFacility.id_user,
              nama_fasilitas: targetFacility.nama_user || targetFacility.nama_tempat || 'Tidak Diketahui',
              tipe_tempat: targetFacility.jenis_tempat || targetFacility.tipe_tempat || 'Tidak Diketahui',
              alamat_tempat: targetFacility.alamat || '',
              kelurahan: targetFacility.kelurahan || '',
              kecamatan: targetFacility.kecamatan || '',
              total_volume_tahunan: 0, total_laporan_tahunan: 0, rata_rata_bulanan: 0, persentase_kelengkapan: 0,
            });
            
            const emptyMonthlyDetails: MonthlyDetailData[] = [];
            const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
            for (let i = 1; i <= 12; i++) {
                emptyMonthlyDetails.push({
                    key: i.toString(), bulan: monthNames[i-1], periode: i, volume_total: 0, debit_air_limbah: 0, ph: 0, tss: 0, bod: 0, cod: 0, minyak_lemak: 0, amoniak: 0, nama_transporter: '-', status: 'Tidak Ada Laporan', tanggal_laporan: '-', persentase_dari_total: 0
                });
            }
            setMonthlyData(emptyMonthlyDetails);
          } else {
            message.error('Data fasilitas tidak ditemukan');
          }
          return;
        }
        
        // Proses info fasilitas dari laporan pertama yang ditemukan
        const firstReport = userReports[0];
        setFacilityInfo({
          id_user: targetUserId,
          nama_fasilitas: firstReport.user?.nama_tempat || firstReport.user?.nama_user || 'Tidak Diketahui',
          tipe_tempat: firstReport.user?.tipe_tempat || 'Tidak Diketahui',
          alamat_tempat: firstReport.user?.alamat_tempat || '',
          kelurahan: firstReport.user?.kelurahan || '',
          kecamatan: firstReport.user?.kecamatan || '',
          total_volume_tahunan: 0, total_laporan_tahunan: 0, rata_rata_bulanan: 0, persentase_kelengkapan: 0,
        });
        
        // --- PERBAIKAN 2: LOGIKA PEMROSESAN DATA BULANAN ---
        const monthlyDetails: MonthlyDetailData[] = [];
        const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        
        let totalVolumeTahunan = 0;
        let totalLaporanTahunan = 0;
        
        for (let i = 1; i <= 12; i++) {
          const monthName = monthNames[i - 1];
          // Cari laporan yang sesuai untuk bulan ke-i
          const monthReport = userReports.find((report: any) => parseInt(report.periode) === i);
          
          const volumeTotal = monthReport ? parseFloat(monthReport.debit_air_limbah?.toString() || '0') : 0;
          
          if (volumeTotal > 0) {
            totalVolumeTahunan += volumeTotal;
            totalLaporanTahunan += 1;
          }
          
          monthlyDetails.push({
            key: i.toString(),
            bulan: monthName,
            periode: i,
            volume_total: volumeTotal,
            debit_air_limbah: volumeTotal,
            ph: monthReport ? parseFloat(monthReport.ph?.toString() || '0') : 0,
            tss: monthReport ? parseFloat(monthReport.tss?.toString() || '0') : 0,
            bod: monthReport ? parseFloat(monthReport.bod?.toString() || '0') : 0,
            cod: monthReport ? parseFloat(monthReport.cod?.toString() || '0') : 0,
            minyak_lemak: monthReport ? parseFloat(monthReport.minyak_lemak?.toString() || '0') : 0,
            amoniak: monthReport ? parseFloat(monthReport.amoniak?.toString() || '0') : 0,
            nama_transporter: monthReport?.transporter?.nama_transporter || 'Belum Ditentukan',
            status: volumeTotal > 0 ? 'Ada Laporan' : 'Tidak Ada Laporan',
            tanggal_laporan: monthReport ? dayjs(monthReport.created_at).format('DD/MM/YYYY') : '-',
            persentase_dari_total: 0
          });
        }
        
        const rataRataBulanan = totalLaporanTahunan > 0 ? totalVolumeTahunan / totalLaporanTahunan : 0;
        const persentaseKelengkapan = Math.round((totalLaporanTahunan / 12) * 100);
        
        monthlyDetails.forEach(month => {
          month.persentase_dari_total = totalVolumeTahunan > 0 ? Math.round((month.volume_total / totalVolumeTahunan) * 100) : 0;
        });
        
        setMonthlyData(monthlyDetails);
        
        // Update info fasilitas dengan total yang sudah dihitung
        setFacilityInfo(prev => prev ? {
          ...prev,
          total_volume_tahunan: totalVolumeTahunan,
          total_laporan_tahunan: totalLaporanTahunan,
          rata_rata_bulanan: rataRataBulanan,
          persentase_kelengkapan: persentaseKelengkapan,
        } : null);
        
        message.success('Data detail berhasil dimuat');

      } else {
        message.error('Gagal memuat data detail: Format respons tidak valid');
      }
    } catch (error: any) {
      console.error('Error fetching detail data:', error);
      message.error('Terjadi kesalahan saat memuat data detail');
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
      title: 'Volume Total (L)',
      dataIndex: 'volume_total',
      key: 'volume_total',
      width: 130,
      sorter: (a, b) => a.volume_total - b.volume_total,
      render: (value) => (
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
            {value > 0 ? value.toLocaleString('id-ID', { minimumFractionDigits: 1 }) : '-'}
          </div>
          <div style={{ fontSize: '11px', color: '#666' }}>L</div>
        </div>
      )
    },
    {
      title: 'pH',
      dataIndex: 'ph',
      key: 'ph',
      width: 80,
      render: (value) => (
        <div style={{ textAlign: 'center' }}>
          {value > 0 ? value.toFixed(2) : '-'}
        </div>
      )
    },
    {
      title: 'TSS (mg/L)',
      dataIndex: 'tss',
      key: 'tss',
      width: 100,
      render: (value) => (
        <div style={{ textAlign: 'right' }}>
          {value > 0 ? value.toLocaleString('id-ID', { minimumFractionDigits: 1 }) : '-'}
        </div>
      )
    },
    {
      title: 'BOD (mg/L)',
      dataIndex: 'bod',
      key: 'bod',
      width: 100,
      render: (value) => (
        <div style={{ textAlign: 'right' }}>
          {value > 0 ? value.toLocaleString('id-ID', { minimumFractionDigits: 1 }) : '-'}
        </div>
      )
    },
    {
      title: 'COD (mg/L)',
      dataIndex: 'cod',
      key: 'cod',
      width: 100,
      render: (value) => (
        <div style={{ textAlign: 'right' }}>
          {value > 0 ? value.toLocaleString('id-ID', { minimumFractionDigits: 1 }) : '-'}
        </div>
      )
    },
    {
      title: 'Minyak & Lemak (mg/L)',
      dataIndex: 'minyak_lemak',
      key: 'minyak_lemak',
      width: 150,
      render: (value) => (
        <div style={{ textAlign: 'right' }}>
          {value > 0 ? value.toLocaleString('id-ID', { minimumFractionDigits: 1 }) : '-'}
        </div>
      )
    },
    {
      title: 'Amoniak (mg/L)',
      dataIndex: 'amoniak',
      key: 'amoniak',
      width: 120,
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
        <Breadcrumb 
          style={{ marginBottom: '24px' }}
          items={[
            { title: 'Dashboard' },
            { title: 'Manajemen Laporan' },
            { title: 'Rekapitulasi Limbah Cair' },
            { title: 'Detail Laporan' }
          ]}
        />

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
                    Detail Laporan Limbah Cair {currentYear}
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
                  title="Total Volume Tahunan"
                  value={facilityInfo.total_volume_tahunan}
                  precision={1}
                  suffix="L"
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
                  suffix="L"
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

export default DetailLaporanLimbahCair;