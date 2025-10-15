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
  debit_limbah_cair: number;
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
  
  const [loading, setLoading] = useState<boolean>(true); // Set loading true di awal
  const [facilityInfo, setFacilityInfo] = useState<FacilityInfo | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyDetailData[]>([]);
  const [currentYear, setCurrentYear] = useState<number>(
    tahun ? parseInt(tahun as string) : new Date().getFullYear()
  );

  const fetchDetailData = async () => {
    if (!id) {
      console.log("FETCH SKIPPED: 'id' dari router belum siap.");
      return;
    }
    
    try {
      setLoading(true);
      if (globalStore.setLoading) globalStore.setLoading(true);
      
      const formData = new FormData();
      formData.append('tahun', currentYear.toString());
      formData.append('nama_user', ''); 

      console.log("--- DEBUGGING: Memulai fetchDetailData ---");
      console.log("Target User ID (dari URL):", id);
      console.log("Target Year:", currentYear.toString());
      console.log("API Base URL yang Digunakan Axios:", api.defaults.baseURL);
      console.log("Memanggil Endpoint:", "/admin/laporan-rekapitulasi/data");

      const response = await api.post('/user/laporan-rekapitulasi/data', formData);
      
      console.log("API Response Diterima:", response);

      const responseData = response.data as ResponseLaporanRekapitulasi;
      
      if (responseData.success) {
        const apiData = responseData.data;
        
        const targetUserId = parseInt(id as string);
        let targetUser: any = null;

        if (apiData.laporan && apiData.laporan.length > 0) {
          for (const laporan of apiData.laporan) {
            if (laporan.users && laporan.users.length > 0) {
              const foundUser = laporan.users.find(user => user.id_user == targetUserId);
              if (foundUser) {
                targetUser = foundUser;
                break;
              }
            }
          }
        }

        if (!targetUser) {
          message.error(`Data untuk fasilitas dengan ID: ${targetUserId} tidak ditemukan dalam respons API.`);
          setMonthlyData(Array.from({ length: 12 }, (_, i) => ({
              key: (i + 1).toString(), bulan: dayjs().month(i).format('MMMM'), periode: i + 1, berat_total: 0, limbah_b3_medis: 0, limbah_b3_nonmedis: 0, limbah_jarum: 0, limbah_sludge_ipal: 0, debit_limbah_cair: 0, nama_transporter: '-', total_limbah_padat_infeksius: 0, total_limbah_covid: 0, total_limbah_padat_non_infeksius: 0, total_limbah_jarum: 0, total_sludge_ipal: 0, total_limbah_padat: 0, status: 'Tidak Ada Laporan', tanggal_laporan: '-', persentase_dari_total: 0
          })));
          return;
        }
        
        setFacilityInfo({
          id_user: targetUser.id_user,
          nama_fasilitas: targetUser.nama_tempat || targetUser.nama_user || 'Tidak Diketahui',
          tipe_tempat: targetUser.tipe_tempat || 'Tidak Diketahui',
          alamat_tempat: targetUser.alamat_tempat || '',
          kelurahan: targetUser.kelurahan || '',
          kecamatan: targetUser.kecamatan || '',
          total_berat_tahunan: 0, total_laporan_tahunan: 0, rata_rata_bulanan: 0, persentase_kelengkapan: 0,
        });
        
        const monthlyDetails: MonthlyDetailData[] = [];
        const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        let totalBeratTahunan = 0;
        let totalLaporanTahunan = 0;
        
        for (let i = 1; i <= 12; i++) {
          const monthReport = apiData.laporan?.find(lap => lap.periode === i);
          const userInMonth = monthReport?.users?.find(u => u.id_user == targetUserId);
          const limbahData = userInMonth?.limbah && typeof userInMonth.limbah === 'object' ? userInMonth.limbah : null;
          
          const beratTotal = limbahData ? parseFloat(limbahData.berat_limbah_total?.toString() || '0') : 0;
          if (beratTotal > 0) {
            totalBeratTahunan += beratTotal;
            totalLaporanTahunan += 1;
          }
          
          monthlyDetails.push({
            key: i.toString(),
            bulan: monthNames[i-1],
            periode: i,
            berat_total: beratTotal,
            limbah_b3_medis: limbahData ? parseFloat(limbahData.limbah_b3_medis?.toString() || '0') : 0,
            limbah_b3_nonmedis: limbahData ? parseFloat(limbahData.limbah_b3_nonmedis?.toString() || '0') : 0,
            limbah_jarum: limbahData ? parseFloat(limbahData.limbah_jarum?.toString() || '0') : 0,
            limbah_sludge_ipal: limbahData ? parseFloat(limbahData.limbah_sludge_ipal?.toString() || '0') : 0,
            debit_limbah_cair: limbahData ? parseFloat(limbahData.debit_limbah_cair?.toString() || '0') : 0,
            nama_transporter: limbahData?.nama_transporter || 'Belum Ditentukan',
            total_limbah_padat_infeksius: limbahData ? parseFloat(limbahData.limbah_padat_infeksius?.toString() || '0') : 0,
            total_limbah_covid: limbahData ? parseFloat(limbahData.limbah_b3_covid?.toString() || '0') : 0,
            total_limbah_padat_non_infeksius: limbahData ? parseFloat(limbahData.limbah_b3_nonmedis?.toString() || '0') : 0,
            total_limbah_jarum: limbahData ? parseFloat(limbahData.limbah_jarum?.toString() || '0') : 0,
            total_sludge_ipal: limbahData ? parseFloat(limbahData.limbah_sludge_ipal?.toString() || '0') : 0,
            total_limbah_padat: beratTotal,
            status: beratTotal > 0 ? 'Ada Laporan' : 'Tidak Ada Laporan',
            tanggal_laporan: limbahData ? dayjs(limbahData.created_at).format('DD/MM/YYYY') : '-',
            persentase_dari_total: 0
          });
        }
        
        const rataRataBulanan = totalLaporanTahunan > 0 ? totalBeratTahunan / totalLaporanTahunan : 0;
        const persentaseKelengkapan = Math.round((totalLaporanTahunan / 12) * 100);
        
        monthlyDetails.forEach(month => {
          month.persentase_dari_total = totalBeratTahunan > 0 ? Math.round((month.berat_total / totalBeratTahunan) * 100) : 0;
        });
        
        setMonthlyData(monthlyDetails);
        
        setFacilityInfo(prev => prev ? {
          ...prev, total_berat_tahunan: totalBeratTahunan, total_laporan_tahunan: totalLaporanTahunan, rata_rata_bulanan: rataRataBulanan, persentase_kelengkapan: persentaseKelengkapan
        } : null);
        
        message.success('Data detail berhasil dimuat');

      } else {
        message.error('Gagal memuat data detail: ' + (responseData.message || 'Respons API tidak sukses'));
      }
    } catch (error: any) {
      console.error("--- DEBUGGING: PANGGILAN API GAGAL! ---");
      if (error.response) {
        console.error("Status Code:", error.response.status);
        console.error("Response Data:", error.response.data);
      } else if (error.request) {
        console.error("Tidak ada respons diterima. Cek URL API (Environment Variable) atau masalah jaringan.", error.request);
      } else {
        console.error("Error saat setup request:", error.message);
      }
      message.error('Terjadi kesalahan. Silakan cek console browser (F12) untuk detail teknis.');
    } finally {
      setLoading(false);
      if (globalStore.setLoading) globalStore.setLoading(false);
    }
  };

  useEffect(() => {
    if (router.isReady) {
      fetchDetailData();
    }
  }, [router.isReady, id, currentYear]);

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
      title: 'Total Limbah B3 Infeksius (kg)',
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
      title: 'Total Limbah B3 Non Infeksius (kg)',
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
      title: 'Total Limbah Cair B3 (kg)',
      dataIndex: 'debit_limbah_cair',
      key: 'debit_limbah_cair',
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
     // 1. Pastikan ada data fasilitas dan data bulanan sebelum melanjutkan
    if (!facilityInfo || !monthlyData || monthlyData.length === 0) {
      message.warning('Tidak ada data detail untuk diekspor.');
      return;
    }

    message.loading('Mempersiapkan file unduhan...', 0.5);

    // 2. Tentukan header untuk file CSV (sesuaikan dengan kolom di tabel)
    const headers = [
      "Bulan",
      "Periode",
      "Berat Total (kg)",
      "Limbah B3 Medis (kg)",
      "Limbah B3 Non-Medis (kg)",
      "Limbah Jarum (kg)",
      "Limbah Sludge IPAL (kg)",
      "Total Limbah Padat Infeksius (kg)",
      "Total Limbah Covid (kg)",
      "Status Laporan",
      "Nama Transporter",
      "Tanggal Laporan"
    ];

    // 3. Ubah setiap objek data bulanan menjadi baris CSV
    const csvRows = monthlyData.map(row => {
      // Pastikan urutannya sama persis dengan header
      const rowData = [
        `"${row.bulan}"`,
        row.periode,
        row.berat_total,
        row.limbah_b3_medis,
        row.limbah_b3_nonmedis,
        row.limbah_jarum,
        row.limbah_sludge_ipal,
        row.total_limbah_padat_infeksius,
        row.total_limbah_covid,
        `"${row.status}"`,
        `"${row.nama_transporter.replace(/"/g, '""')}"`,
        `"${row.tanggal_laporan}"`
      ];
      return rowData.join(','); // Gabungkan dengan koma
    });

    // 4. Gabungkan header dan semua baris data, dipisahkan oleh baris baru
    const csvString = [headers.join(','), ...csvRows].join('\n');

    // 5. Buat Blob dari string CSV (file virtual di memori)
    // \uFEFF ditambahkan untuk memastikan kompatibilitas dengan Microsoft Excel
    const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });

    // 6. Buat link sementara untuk memicu unduhan
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      const fileName = `detail_limbah_padat_${facilityInfo.nama_fasilitas.replace(/ /g, '_')}_${currentYear}.csv`;
      
      link.setAttribute("href", url);
      link.setAttribute("download", fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => {
        message.success(`Berhasil mengunduh ${fileName}`);
      }, 500);
    }
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