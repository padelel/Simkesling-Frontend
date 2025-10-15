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

interface MonthlyLabDetailData {
  key: string;
  bulan: string;
  periode: number;
  kualitas_udara: any;
  kualitas_air: any;
  kualitas_makanan: any;
  usap_alat_medis: any;
  limbah_cair: any;
  status: 'Ada Laporan' | 'Tidak Ada Laporan';
  tanggal_laporan: string;
  persentase_dari_total: number;
  nama_lab: string;
  metode_analisis: string;
  catatan: string;
}

interface FacilityLabInfo {
  id_user: number;
  nama_fasilitas: string;
  tipe_tempat: string;
  alamat_tempat: string;
  kelurahan: string;
  kecamatan: string;
  total_laporan_tahunan: number;
  persentase_kelengkapan: number;
}

const DetailLaporanLab: React.FC = () => {
  const router = useRouter();
  const { id, tahun, periode } = router.query;
  const globalStore = useGlobalStore();
  
  const [loading, setLoading] = useState<boolean>(false);
  const [facilityInfo, setFacilityInfo] = useState<FacilityLabInfo | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyLabDetailData[]>([]);
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
      // TAMBAHAN: Kirim parameter filter kosong untuk memberi tahu backend
      // agar mengembalikan data semua fasilitas, bukan hanya data admin.
      formData.append('nama_user', '');

      // --- PERBAIKAN 1: GUNAKAN ENDPOINT USER ---
      const response = await api.post('/user/laporan-lab/data', formData);
      
      if (response.data && response.data.data) {
        // Asumsi data ada di `response.data.data.data` atau `response.data.data`
        const apiData = response.data.data.data || response.data.data || [];
        
        const targetUserId = parseInt(id as string);

        // --- PERBAIKAN 2: GUNAKAN PERBANDINGAN LONGGAR (==) ---
        const userReports = apiData.filter((item: any) => 
          (item.id_user == targetUserId) || (item.user?.id_user == targetUserId)
        );
        
        // Logika fallback jika tidak ada laporan, untuk mengambil info fasilitas
        if (userReports.length === 0) {
          const allFacilitiesResponse = await api.post("/user/puskesmas-rumahsakit/data");
          const allFacilities = allFacilitiesResponse.data.data.values || [];
          const targetFacility = allFacilities.find((facility: any) => facility.id_user === targetUserId);

          if(targetFacility) {
            setFacilityInfo({
              id_user: targetFacility.id_user,
              nama_fasilitas: targetFacility.nama_user || targetFacility.nama_tempat || 'Tidak Diketahui',
              tipe_tempat: targetFacility.tipe_tempat || 'Tidak Diketahui',
              alamat_tempat: targetFacility.alamat_tempat || targetFacility.alamat || '',
              kelurahan: targetFacility.kelurahan || '',
              kecamatan: targetFacility.kecamatan || '',
              total_laporan_tahunan: 0,
              persentase_kelengkapan: 0,
            });
          } else {
             message.error('Data fasilitas tidak ditemukan');
          }
          // Set data bulanan menjadi kosong agar tabel tidak error
          const emptyMonthlyDetails: MonthlyLabDetailData[] = [];
          const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
          for (let i = 1; i <= 12; i++) {
              emptyMonthlyDetails.push({
                  key: `${targetUserId}-${i}`, bulan: monthNames[i-1], periode: i, kualitas_udara: null, kualitas_air: null, kualitas_makanan: null, usap_alat_medis: null, limbah_cair: null, status: 'Tidak Ada Laporan', tanggal_laporan: '-', catatan: '-', persentase_dari_total: 0, nama_lab: '-', metode_analisis: '-'
              });
          }
          setMonthlyData(emptyMonthlyDetails);

          return; // Hentikan fungsi jika tidak ada laporan
        }

        // Jika ada laporan, proses seperti biasa
        const firstReport = userReports[0];
        const userInfo = firstReport.user || firstReport;
        
        setFacilityInfo({
          id_user: targetUserId,
          nama_fasilitas: userInfo.nama_user || userInfo.nama_fasilitas || userInfo.nama_tempat || 'Tidak Diketahui',
          tipe_tempat: userInfo.tipe_user || userInfo.tipe_tempat || 'Tidak Diketahui',
          alamat_tempat: userInfo.alamat_user || userInfo.alamat_tempat || 'Tidak Diketahui',
          kelurahan: userInfo.kelurahan || 'Tidak Diketahui',
          kecamatan: userInfo.kecamatan || 'Tidak Diketahui',
          total_laporan_tahunan: 0,
          persentase_kelengkapan: 0
        });

        // Logika Anda untuk memproses data bulanan sudah bagus, kita pertahankan
        const monthlyMap = new Map();
        for (let month = 1; month <= 12; month++) {
          const monthName = getMonthName(month);
          monthlyMap.set(month, {
            key: `${targetUserId}-${month}`, bulan: monthName, periode: month, kualitas_udara: null, kualitas_air: null, kualitas_makanan: null, usap_alat_medis: null, limbah_cair: null, status: 'Tidak Ada Laporan' as const, tanggal_laporan: '-', catatan: '-', persentase_dari_total: 0, nama_lab: '-', metode_analisis: '-'
          });
        }

        userReports.forEach((report: any) => {
          const monthNum = parseInt(report.periode) || 1;
          const monthData = monthlyMap.get(monthNum);
          if (monthData) {
            monthData.status = 'Ada Laporan';
            monthData.tanggal_laporan = dayjs(report.created_at || report.updated_at).format('DD/MM/YYYY');
            monthData.nama_lab = report.nama_lab || '-';
            monthData.metode_analisis = report.metode_analisis || '-';
            monthData.catatan = report.catatan || '-';
            
            // Logika parsing JSON sudah bagus
            if (report.kualitas_udara && report.kualitas_udara !== '0') {
              try { monthData.kualitas_udara = JSON.parse(report.kualitas_udara); } catch { monthData.kualitas_udara = report.kualitas_udara; }
            }
            if (report.kualitas_air && report.kualitas_air !== '0') {
              try { monthData.kualitas_air = JSON.parse(report.kualitas_air); } catch { monthData.kualitas_air = report.kualitas_air; }
            }
            if (report.kualitas_makanan && report.kualitas_makanan !== '0') {
              try { monthData.kualitas_makanan = JSON.parse(report.kualitas_makanan); } catch { monthData.kualitas_makanan = report.kualitas_makanan; }
            }
            if (report.usap_alat_medis && report.usap_alat_medis !== '0') {
              try { monthData.usap_alat_medis = JSON.parse(report.usap_alat_medis); } catch { monthData.usap_alat_medis = report.usap_alat_medis; }
            }
            if (report.limbah_cair && report.limbah_cair !== '0') {
              try { monthData.limbah_cair = JSON.parse(report.limbah_cair); } catch { monthData.limbah_cair = report.limbah_cair; }
            }
          }
        });

        const monthlyArray = Array.from(monthlyMap.values());
        const totalLaporanTahunan = monthlyArray.filter(month => month.status === 'Ada Laporan').length;
        const persentaseKelengkapan = (totalLaporanTahunan / 12) * 100;

        setFacilityInfo(prev => prev ? {...prev, total_laporan_tahunan: totalLaporanTahunan, persentase_kelengkapan: persentaseKelengkapan} : null);
        setMonthlyData(monthlyArray);

        message.success('Data detail berhasil dimuat');
      }
    } catch (error) {
      console.error('Error fetching detail data:', error);
      message.error('Gagal memuat data detail laporan lab');
    } finally {
      setLoading(false);
      if (globalStore.setLoading) globalStore.setLoading(false);
    }
  };

  // Helper function to format data for display
  const formatDataForDisplay = (data: any): string => {
    if (!data || data === null || data === undefined) {
      return '-';
    }
    
    if (typeof data === 'string') {
      return data === '0' || data === '-' ? '-' : data;
    }
    
    if (Array.isArray(data)) {
      if (data.length === 0) return '-';
      return data.map((item, index) => {
        if (typeof item === 'object') {
          return `${index + 1}. ${Object.entries(item).map(([key, value]) => `${key}: ${value}`).join(', ')}`;
        }
        return `${index + 1}. ${item}`;
      }).join('\n');
    }
    
    if (typeof data === 'object') {
      return Object.entries(data).map(([key, value]) => `${key}: ${value}`).join(', ');
    }
    
    return String(data);
  };

  // Helper function to get month name
  const getMonthName = (monthNumber: number): string => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return months[monthNumber - 1] || 'Tidak Diketahui';
  };
  // Table columns
  const columns: ColumnsType<MonthlyLabDetailData> = [
    {
      title: 'Bulan',
      dataIndex: 'bulan',
      key: 'bulan',
      width: 120,
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {currentYear}
          </Text>
        </div>
      ),
    },
    {
      title: 'Kualitas Udara',
      dataIndex: 'kualitas_udara',
      key: 'kualitas_udara',
      width: 200,
      render: (value) => (
        <div style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
          <Text style={{ color: value ? '#1890ff' : '#d9d9d9' }}>
            {formatDataForDisplay(value)}
          </Text>
        </div>
      ),
    },
    {
      title: 'Kualitas Air',
      dataIndex: 'kualitas_air',
      key: 'kualitas_air',
      width: 200,
      render: (value) => (
        <div style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
          <Text style={{ color: value ? '#13c2c2' : '#d9d9d9' }}>
            {formatDataForDisplay(value)}
          </Text>
        </div>
      ),
    },
    {
      title: 'Kualitas Makanan',
      dataIndex: 'kualitas_makanan',
      key: 'kualitas_makanan',
      width: 200,
      render: (value) => (
        <div style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
          <Text style={{ color: value ? '#faad14' : '#d9d9d9' }}>
            {formatDataForDisplay(value)}
          </Text>
        </div>
      ),
    },
    {
      title: 'Usap Alat Medis',
      dataIndex: 'usap_alat_medis',
      key: 'usap_alat_medis',
      width: 200,
      render: (value) => (
        <div style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
          <Text style={{ color: value ? '#722ed1' : '#d9d9d9' }}>
            {formatDataForDisplay(value)}
          </Text>
        </div>
      ),
    },
    {
      title: 'Limbah Cair',
      dataIndex: 'limbah_cair',
      key: 'limbah_cair',
      width: 200,
      render: (value) => (
        <div style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
          <Text style={{ color: value ? '#f5222d' : '#d9d9d9' }}>
            {formatDataForDisplay(value)}
          </Text>
        </div>
      ),
    },
    // {
    //   title: 'Status',
    //   dataIndex: 'status',
    //   key: 'status',
    //   width: 120,
    //   align: 'center',
    //   render: (status) => (
    //     <Tag color={status === 'Ada Laporan' ? 'success' : 'default'}>
    //       {status}
    //     </Tag>
    //   ),
    // },
    {
      title: 'Catatan',
      dataIndex: 'catatan',
      key: 'catatan',
      width: 200,
      render: (value) => (
        <div style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
          <Text style={{ color: value ? '#1890ff' : '#d9d9d9' }}>
            {formatDataForDisplay(value)}
          </Text>
        </div>
      ),
    },
    {
      title: 'Tanggal Laporan',
      dataIndex: 'tanggal_laporan',
      key: 'tanggal_laporan',
      width: 120,
      render: (date) => (
        <Text type="secondary">{date}</Text>
      ),
    },
  ];

  // Calculate summary statistics - now based on data presence instead of counts
  const bulanDenganLaporan = monthlyData.filter(item => item.status === 'Ada Laporan').length;
  const persentaseKepatuhan = (bulanDenganLaporan / 12) * 100;
  
  const jenisStats = {
    kualitas_udara: monthlyData.filter(item => item.kualitas_udara).length,
    kualitas_air: monthlyData.filter(item => item.kualitas_air).length,
    kualitas_makanan: monthlyData.filter(item => item.kualitas_makanan).length,
    usap_alat_medis: monthlyData.filter(item => item.usap_alat_medis).length,
    limbah_cair: monthlyData.filter(item => item.limbah_cair).length,
  };

    const handleDownloadDetail = () => {
    // 1. Pastikan ada data fasilitas dan data bulanan sebelum melanjutkan
    if (!facilityInfo || !monthlyData || monthlyData.length === 0) {
      message.warning('Tidak ada data detail untuk diekspor.');
      return;
    }

    message.loading('Mempersiapkan file unduhan...', 0.5);

    // 2. Tentukan header untuk file CSV
    const headers = [
      "Bulan",
      "Periode",
      "Kualitas Udara",
      "Kualitas Air",
      "Kualitas Makanan",
      "Usap Alat Medis",
      "Limbah Cair",
      "Nama Lab",
      "Metode Analisis",
      "Catatan",
      "Status Laporan",
      "Tanggal Laporan"
    ];

    // Helper untuk memformat data sel CSV dengan aman
    const formatCsvCell = (data: any): string => {
      if (data === null || data === undefined) return '';
      // Jika data adalah objek/array, ubah menjadi string JSON
      const str = (typeof data === 'object') ? JSON.stringify(data) : String(data);
      // Bungkus dengan kutip dua dan escape tanda kutip di dalamnya
      return `"${str.replace(/"/g, '""')}"`;
    };

    // 3. Ubah setiap objek data bulanan menjadi baris CSV
    const csvRows = monthlyData.map(row => {
      const rowData = [
        `"${row.bulan}"`,
        row.periode,
        formatCsvCell(row.kualitas_udara),
        formatCsvCell(row.kualitas_air),
        formatCsvCell(row.kualitas_makanan),
        formatCsvCell(row.usap_alat_medis),
        formatCsvCell(row.limbah_cair),
        formatCsvCell(row.nama_lab),
        formatCsvCell(row.metode_analisis),
        formatCsvCell(row.catatan),
        `"${row.status}"`,
        `"${row.tanggal_laporan}"`
      ];
      return rowData.join(','); // Gabungkan dengan koma
    });

    // 4. Gabungkan header dan semua baris data
    const csvString = [headers.join(','), ...csvRows].join('\n');

    // 5. Buat Blob dari string CSV (file virtual di memori)
    const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });

    // 6. Buat link sementara untuk memicu unduhan
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      const fileName = `detail_laporan_lab_${facilityInfo.nama_fasilitas.replace(/ /g, '_')}_${currentYear}.csv`;
      
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

  useEffect(() => {
    fetchDetailData();
  }, [id, currentYear]);

  if (loading) {
    return (
      <MainLayout>
        <div style={{ padding: '24px', textAlign: 'center' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px' }}>
            <Text>Memuat data detail laporan lab...</Text>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div style={{ padding: '24px' }}>
        {/* Breadcrumb */}
        <Breadcrumb style={{ marginBottom: '16px' }}>
          <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
          <Breadcrumb.Item>Manajemen</Breadcrumb.Item>
          <Breadcrumb.Item>
            <a onClick={() => router.push('/dashboard/admin/manajemen/laporan-rekapitulasi/laporan-lab')}>
              Rekapitulasi Laporan Lab
            </a>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Detail</Breadcrumb.Item>
        </Breadcrumb>

        {/* Header */}
        <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
          <Col>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => router.back()}
              style={{ marginRight: '16px' }}
            >
              Kembali
            </Button>
            <Title level={2} style={{ margin: 0, display: 'inline' }}>
              <FileTextOutlined style={{ marginRight: '12px', color: '#1890ff' }} />
              Detail Laporan Lab - {facilityInfo?.nama_fasilitas}
            </Title>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleDownloadDetail}
            >
              Export Detail
            </Button>
          </Col>
        </Row>

        {/* Facility Information */}
        {facilityInfo && (
          <Card title="Informasi Fasilitas" style={{ marginBottom: '24px' }}>
            <Row gutter={[24, 16]}>
              <Col xs={24} sm={12} md={8}>
                <div>
                  <Text type="secondary">Nama Fasilitas:</Text>
                  <br />
                  <Text strong>{facilityInfo.nama_fasilitas}</Text>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <div>
                  <Text type="secondary">Tipe:</Text>
                  <br />
                  <Tag color="blue">{facilityInfo.tipe_tempat}</Tag>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <div>
                  <Text type="secondary">Alamat:</Text>
                  <br />
                  <Text>{facilityInfo.alamat_tempat}</Text>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <div>
                  <Text type="secondary">Kelurahan:</Text>
                  <br />
                  <Text>{facilityInfo.kelurahan}</Text>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <div>
                  <Text type="secondary">Kecamatan:</Text>
                  <br />
                  <Text>{facilityInfo.kecamatan}</Text>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8}>
                <div>
                  <Text type="secondary">Tahun:</Text>
                  <br />
                  <Tag color="green">{currentYear}</Tag>
                </div>
              </Col>
            </Row>
          </Card>
        )}

        {/* Summary Statistics */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic
                title="Bulan dengan Laporan"
                value={bulanDenganLaporan}
                suffix="/ 12"
                prefix={<CalendarOutlined style={{ color: '#52c41a' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic
                title="Persentase Kelengkapan"
                value={persentaseKepatuhan}
                precision={1}
                suffix="%"
                prefix={<BarChartOutlined style={{ color: '#faad14' }} />}
              />
            </Card>
          </Col>
        </Row>

        {/* Examination Type Statistics
        <Card title="Statistik Berdasarkan Jenis Pemeriksaan" style={{ marginBottom: '24px' }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={4}>
              <Statistic
                title="Kualitas Udara"
                value={jenisStats.kualitas_udara}
                valueStyle={{ color: '#1890ff' }}
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Statistic
                title="Kualitas Air"
                value={jenisStats.kualitas_air}
                valueStyle={{ color: '#13c2c2' }}
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Statistic
                title="Kualitas Makanan"
                value={jenisStats.kualitas_makanan}
                valueStyle={{ color: '#faad14' }}
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Statistic
                title="Usap Alat Medis"
                value={jenisStats.usap_alat_medis}
                valueStyle={{ color: '#722ed1' }}
              />
            </Col>
            <Col xs={24} sm={12} md={4}>
              <Statistic
                title="Limbah Cair"
                value={jenisStats.limbah_cair}
                valueStyle={{ color: '#f5222d' }}
              />
            </Col>
          </Row>
        </Card> */}

        {/* Monthly Detail Table */}
        <Card title={`Detail Bulanan Tahun ${currentYear}`}>
          <Table
            columns={columns}
            dataSource={monthlyData}
            pagination={false}
            scroll={{ x: 1200 }}
            size="small"
          />
        </Card>
      </div>
    </MainLayout>
  );
};

export default DetailLaporanLab;