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
  Select, 
  DatePicker, 
  Input, 
  Space,
  Statistic,
  Tag,
  Tooltip,
  Progress,
  message,
  Badge
} from "antd";
import { 
  SearchOutlined, 
  FilterOutlined, 
  DownloadOutlined, 
  EyeOutlined,
  LeftOutlined,
  RightOutlined,
  BarChartOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined
} from "@ant-design/icons";
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import api from '@/utils/HttpRequest';
import { useGlobalStore } from '@/stores/globalStore';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface RekapitulasiData {
  key: string;
  id_user: number;
  nama_fasilitas: string;
  tipe_tempat: string;
  alamat_tempat: string;
  kelurahan: string;
  kecamatan: string;
  jumlah_laporan: number;
  periode: string;
  status: 'Lengkap' | 'Tidak Lengkap' | 'Terlambat';
  persentase_kepatuhan: number;
  jenis_pemeriksaan: string[];
  tanggal_terakhir: string;
}

interface YearlyFacilityData {
  id_user: number;
  nama_fasilitas: string;
  tipe_tempat: string;
  alamat_tempat: string;
  kelurahan: string;
  kecamatan: string;
  total_pemeriksaan_tahunan: number;
  total_laporan_tahunan: number;
  persentase_kelengkapan: number;
  status_tahunan: string;
  detail_bulanan: Array<{
    periode: string;
    pemeriksaan: number;
    status: string;
    tanggal: string;
  }>;
}

const LaporanRekapitulasiLaporanLab: React.FC = () => {
  const router = useRouter();
  const globalStore = useGlobalStore();
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');
  const [searchText, setSearchText] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<RekapitulasiData[]>([]);
  const [yearlyData, setYearlyData] = useState<YearlyFacilityData[]>([]);

  const calculateYearlyData = (facilityData: any[]): YearlyFacilityData[] => {
    const yearlyResults: YearlyFacilityData[] = [];

    facilityData.forEach(facilityInfo => {
      const reports = facilityInfo.reports || [];
      
      const nama_fasilitas = facilityInfo.nama_user || facilityInfo.nama_fasilitas || facilityInfo.nama_tempat || 'Tidak Diketahui';
      const tipe_tempat = facilityInfo.tipe_user || facilityInfo.tipe_tempat || 'Tidak Diketahui';
      const alamat_tempat = facilityInfo.alamat_user || facilityInfo.alamat_tempat || 'Tidak Diketahui';
      
      const yearlyFacility: YearlyFacilityData = {
        id_user: facilityInfo.id_user,
        nama_fasilitas: nama_fasilitas,
        tipe_tempat: tipe_tempat,
        alamat_tempat: alamat_tempat,
        kelurahan: facilityInfo.kelurahan || 'Tidak Diketahui',
        kecamatan: facilityInfo.kecamatan || 'Tidak Diketahui',
        total_pemeriksaan_tahunan: 0,
        total_laporan_tahunan: 0,
        persentase_kelengkapan: 0,
        status_tahunan: 'Kurang',
        detail_bulanan: []
      };

      const totalReportsInYear = reports.length;
      yearlyFacility.total_laporan_tahunan = totalReportsInYear;
      yearlyFacility.total_pemeriksaan_tahunan = totalReportsInYear;

      const monthlyReports = new Map<number, any[]>();
      
      reports.forEach((report: any) => {
        const periode = report.periode || 0;
        const monthName = report.periode_nama || `Bulan ${periode}` || 'Tidak Diketahui';
        
        if (!monthlyReports.has(periode)) {
          monthlyReports.set(periode, []);
        }
        monthlyReports.get(periode)!.push(report);
        
        yearlyFacility.detail_bulanan.push({
          periode: monthName,
          pemeriksaan: 1,
          status: 'Ada Laporan',
          tanggal: report.created_at || report.updated_at || ''
        });
      });

      const uniqueMonths = monthlyReports.size;
      yearlyFacility.persentase_kelengkapan = Math.round((uniqueMonths / 12) * 100);
      
      if (yearlyFacility.persentase_kelengkapan >= 90) {
        yearlyFacility.status_tahunan = 'Sangat Baik';
      } else if (yearlyFacility.persentase_kelengkapan >= 75) {
        yearlyFacility.status_tahunan = 'Baik';
      } else if (yearlyFacility.persentase_kelengkapan >= 50) {
        yearlyFacility.status_tahunan = 'Cukup';
      } else {
        yearlyFacility.status_tahunan = 'Kurang';
      }

      yearlyResults.push(yearlyFacility);
    });

    return yearlyResults;
  };

  // Fetch data from API
  const fetchData = async () => {
    try {
      setLoading(true);
      if (globalStore.setLoading) globalStore.setLoading(true);
      
      // Fetch all healthcare facilities first
      const allFacilitiesResponse = await api.post("/user/puskesmas-rumahsakit/data");
      const allFacilities = allFacilitiesResponse.data.data.values || [];
      console.log('All Facilities:', allFacilities);
      
      // Create FormData for backend API call
      const formData = new FormData();
      formData.append('tahun', currentYear.toString());
      if (selectedPeriod !== 'all') {
        formData.append('periode', selectedPeriod);
      }
      
      // Call actual backend API endpoint for laporan lab data (admin endpoint)
      const response = await api.post('/admin/laporan-lab/data', formData);
      console.log('Backend API Response (Laporan Lab):', response.data);
      
      // Handle backend response structure - Fix for correct API response format
      let rawData = [];
      if (response.data && response.data.data && response.data.data.data) {
        rawData = response.data.data.data;
      } else if (response.data && response.data.data) {
        rawData = response.data.data;
      } else if (Array.isArray(response.data)) {
        rawData = response.data;
      }
      
      console.log('Raw laporan lab data:', rawData);
      
      // Group lab reports by facility
      const facilityReportsMap = new Map<number, FacilityLabReports>();
      
      if (Array.isArray(rawData)) {
        rawData.forEach((item: any) => {
          const idUser = item.id_user || item.user?.id_user;
          
          // Extract facility information
          const facilityName = item.nama_fasilitas || item.user?.nama_tempat || item.user?.nama_user || item.nama_tempat || 'Fasilitas Tidak Diketahui';
          const facilityType = item.tipe_tempat || item.user?.tipe_tempat || 'Tidak Diketahui';
          const alamat = item.alamat_tempat || item.user?.alamat_tempat || item.alamat || '';
          const kelurahan = item.kelurahan || item.user?.kelurahan || '';
          const kecamatan = item.kecamatan || item.user?.kecamatan || '';
          
          // Create lab report data with only essential fields
          const labReport: LaporanLabData = {
            key: `${idUser}-${item.id_laporan_lab || Date.now()}`,
            id_laporan_lab: item.id_laporan_lab || 0,
            id_user: idUser,
            nama_fasilitas: facilityName,
            tipe_tempat: facilityType,
            alamat_tempat: alamat,
            kelurahan: kelurahan,
            kecamatan: kecamatan,
            kualitas_udara: item.kualitas_udara || null,
            kualitas_air: item.kualitas_air || null,
            kualitas_makanan: item.kualitas_makanan || null,
            usap_alat_medis: item.usap_alat_medis || null,
            limbah_cair: item.limbah_cair || null,
            catatan: item.catatan || null,
            periode: item.periode || 0,
            periode_nama: item.periode_nama || '',
            tahun: item.tahun || currentYear,
            created_at: item.created_at || '',
            updated_at: item.updated_at || ''
          };
          
          if (!facilityReportsMap.has(idUser)) {
            facilityReportsMap.set(idUser, {
              id_user: idUser,
              nama_fasilitas: facilityName,
              tipe_tempat: facilityType,
              alamat_tempat: alamat,
              kelurahan: kelurahan,
              kecamatan: kecamatan,
              reports: [],
              total_reports: 0
            });
          }
          
          const facilityReports = facilityReportsMap.get(idUser)!;
          facilityReports.reports.push(labReport);
          facilityReports.total_reports += 1;
        });
      }
      
      // Convert to summary data for table display
      const processedData: RekapitulasiData[] = [];
      
      facilityReportsMap.forEach((facilityReports, idUser) => {
        // Calculate basic statistics
        const totalReports = facilityReports.total_reports;
        const expectedReports = selectedPeriod === 'all' ? 12 : 1;
        const completionPercentage = Math.round((totalReports / expectedReports) * 100);
        
        let status: 'Lengkap' | 'Tidak Lengkap' | 'Terlambat' = 'Lengkap';
        if (totalReports === 0) {
          status = 'Tidak Lengkap';
        } else if (totalReports < expectedReports) {
          status = 'Tidak Lengkap';
        }
        
        // Get latest report date
        const latestReport = facilityReports.reports.reduce((latest, current) => {
          return new Date(current.created_at) > new Date(latest.created_at) ? current : latest;
        }, facilityReports.reports[0]);
        
        processedData.push({
          key: facilityReports.id_user.toString(),
          id_user: facilityReports.id_user,
          nama_fasilitas: facilityReports.nama_fasilitas,
          tipe_tempat: facilityReports.tipe_tempat,
          alamat_tempat: facilityReports.alamat_tempat,
          kelurahan: facilityReports.kelurahan,
          kecamatan: facilityReports.kecamatan,
          jumlah_laporan: totalReports,
          periode: selectedPeriod === 'all' ? 'Semua Bulan' : selectedPeriod,
          status: status,
          persentase_kepatuhan: Math.min(completionPercentage, 100),
          jenis_pemeriksaan: ['Kualitas Udara', 'Kualitas Air', 'Kualitas Makanan', 'Usap Alat Medis', 'Limbah Cair'],
          tanggal_terakhir: latestReport?.created_at || '-'
        });
      });
      
      // Add facilities that haven't reported at all
      allFacilities.forEach((facility: any) => {
        if (!facilityReportsMap.has(facility.id_user)) {
          processedData.push({
            key: facility.id_user.toString(),
            id_user: facility.id_user,
            nama_fasilitas: facility.nama_user || facility.nama_tempat || facility.nama_fasilitas || 'Tidak Diketahui',
            tipe_tempat: facility.jenis_tempat || facility.tipe_tempat || 'Tidak Diketahui',
            alamat_tempat: facility.alamat || facility.alamat_tempat || '-',
            kelurahan: facility.kelurahan || '-',
            kecamatan: facility.kecamatan || '-',
            jumlah_laporan: 0,
            periode: selectedPeriod === 'all' ? 'Semua Bulan' : selectedPeriod,
            status: 'Tidak Lengkap' as const,
            persentase_kepatuhan: 0,
            jenis_pemeriksaan: [],
            tanggal_terakhir: '-'
          });
        }
      });
      
      console.log('Processed laporan lab data:', processedData);
      setData(processedData);
      
      // Calculate simplified yearly data
      const facilityDataWithReports = Array.from(facilityReportsMap.values());
      allFacilities.forEach((facility: any) => {
        if (!facilityReportsMap.has(facility.id_user)) {
          facilityDataWithReports.push({
            id_user: facility.id_user,
            nama_fasilitas: facility.nama_user || facility.nama_tempat || facility.nama_fasilitas || 'Tidak Diketahui',
            tipe_tempat: facility.tipe_tempat || facility.jenis_tempat || 'Tidak Diketahui',
            alamat_tempat: facility.alamat_tempat || facility.alamat || '-',
            kelurahan: facility.kelurahan || '-',
            kecamatan: facility.kecamatan || '-',
            reports: [],
            total_reports: 0
          });
        }
      });
      
      const calculatedYearlyData = calculateYearlyData(facilityDataWithReports);
      setYearlyData(calculatedYearlyData);
      
      message.success(`Data berhasil dimuat: ${processedData.length} fasilitas kesehatan`);
      
    } catch (error: any) {
      console.error('Error fetching laporan lab data:', error);
      
      let errorMessage = 'Terjadi kesalahan saat memuat data laporan lab';
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 401) {
          errorMessage = 'Sesi telah berakhir, silakan login kembali';
        } else if (status === 403) {
          errorMessage = 'Anda tidak memiliki akses untuk melihat data ini';
        } else if (status === 404) {
          errorMessage = 'Endpoint API tidak ditemukan';
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
      setData([]);
      setYearlyData([]);
    } finally {
      setLoading(false);
      if (globalStore.setLoading) globalStore.setLoading(false);
    }
  };

  const handlePreviousYear = () => {
    setCurrentYear(prev => prev - 1);
  };

  const handleNextYear = () => {
    setCurrentYear(prev => prev + 1);
  };

  // Refresh data handler
  const handleRefresh = () => {
    fetchData();
  };

  // Export handler
  const handleExport = () => {
    // 1. Ambil data yang sudah difilter yang sedang ditampilkan di tabel
    const dataToExport = filteredYearlyData;

    if (dataToExport.length === 0) {
      message.warning('Tidak ada data untuk diekspor.');
      return;
    }

    // 2. Tentukan header untuk file CSV (judul kolom)
    const headers = [
      "ID User",
      "Nama Fasilitas",
      "Tipe Tempat",
      "Alamat",
      "Kelurahan",
      "Kecamatan",
      "Total Laporan Tahunan",
      "Persentase Kelengkapan (%)",
      "Status Tahunan"
    ];

    // 3. Ubah setiap objek data menjadi baris CSV
    const csvRows = dataToExport.map(row => {
      // Pastikan urutannya sama dengan header
      const rowData = [
        row.id_user,
        `"${row.nama_fasilitas.replace(/"/g, '""')}"`, // Bungkus dengan kutip untuk menangani koma
        `"${row.tipe_tempat}"`,
        `"${row.alamat_tempat.replace(/"/g, '""')}"`,
        `"${row.kelurahan}"`,
        `"${row.kecamatan}"`,
        row.total_laporan_tahunan,
        row.persentase_kelengkapan,
        `"${row.status_tahunan}"`
      ];
      return rowData.join(','); // Gabungkan dengan koma
    });

    // 4. Gabungkan header dan semua baris data, dipisahkan oleh baris baru
    const csvString = [headers.join(','), ...csvRows].join('\n');

    // 5. Buat Blob dari string CSV
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

    // 6. Buat link sementara untuk memicu unduhan
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      const fileName = `rekapitulasi_laporan_lab_${currentYear}.csv`;
      
      link.setAttribute("href", url);
      link.setAttribute("download", fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      message.success(`Berhasil mengunduh ${fileName}`);
    }
  };

  // Load data when component mounts or year changes
  useEffect(() => {
    fetchData();
  }, [currentYear]);

  // Yearly columns for yearly view
  const yearlyColumns: ColumnsType<YearlyFacilityData> = [
    {
      title: 'Fasilitas',
      key: 'fasilitas',
      width: 200,
      fixed: 'left',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
            {record.nama_fasilitas}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            <EnvironmentOutlined /> {record.tipe_tempat}
          </div>
          <div style={{ fontSize: '11px', color: '#999' }}>
            {record.kelurahan}, {record.kecamatan}
          </div>
        </div>
      )
    },
    {
      title: 'Laporan Masuk',
      dataIndex: 'total_laporan_tahunan',
      key: 'total_laporan_tahunan',
      width: 120,
      sorter: (a, b) => (a.total_laporan_tahunan || 0) - (b.total_laporan_tahunan || 0),
      render: (value) => (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#52c41a' }}>
            {value || 0}
          </div>
          <div style={{ fontSize: '11px', color: '#666' }}>dari 12 bulan</div>
        </div>
      )
    },
    {
      title: 'Kelengkapan (%)',
      dataIndex: 'persentase_kelengkapan',
      key: 'persentase_kelengkapan',
      width: 120,
      sorter: (a, b) => (a.persentase_kelengkapan || 0) - (b.persentase_kelengkapan || 0),
      render: (value) => (
        <div style={{ textAlign: 'center' }}>
          <Progress 
            percent={value || 0} 
            size="small" 
            status={(value || 0) >= 75 ? 'success' : (value || 0) >= 50 ? 'active' : 'exception'}
          />
          <div style={{ fontSize: '12px', marginTop: '4px' }}>
            {value || 0}%
          </div>
        </div>
      )
    },
    {
      title: 'Status Tahunan',
      dataIndex: 'status_tahunan',
      key: 'status_tahunan',
      width: 120,
      filters: [
        { text: 'Sangat Baik', value: 'Sangat Baik' },
        { text: 'Baik', value: 'Baik' },
        { text: 'Cukup', value: 'Cukup' },
        { text: 'Kurang', value: 'Kurang' }
      ],
      onFilter: (value, record) => record.status_tahunan === value,
      render: (status: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Kurang') => {
        const colors = {
          'Sangat Baik': 'green',
          'Baik': 'blue',
          'Cukup': 'orange',
          'Kurang': 'red'
        };
        return <Tag color={colors[status]}>{status}</Tag>;
      }
    },
    {
      title: 'Aksi',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="Lihat Detail Bulanan">
            <Button 
              type="primary" 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => handleViewYearlyDetail(record)}
            />
          </Tooltip>
          {/* <Tooltip title="Unduh Laporan Tahunan">
            <Button 
              icon={<DownloadOutlined />} 
              size="small"
              onClick={() => handleDownloadYearly(record)}
            />
          </Tooltip> */}
        </Space>
      )
    }
  ];

  const columns: ColumnsType<RekapitulasiData> = [
    {
      title: 'Nama Fasilitas',
      dataIndex: 'nama_fasilitas',
      key: 'nama_fasilitas',
      width: 200,
      fixed: 'left',
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value, record) => 
        record.nama_fasilitas.toLowerCase().includes(value.toString().toLowerCase()),
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            <EnvironmentOutlined /> {record.tipe_tempat}
          </div>
          <div style={{ fontSize: '11px', color: '#999' }}>
            {record.kelurahan}, {record.kecamatan}
          </div>
        </div>
      )
    },
    {
      title: 'Jumlah Laporan Lab',
      dataIndex: 'jumlah_laporan',
      key: 'jumlah_laporan',
      width: 120,
      sorter: (a, b) => (a.jumlah_laporan || 0) - (b.jumlah_laporan || 0),
      render: (value) => (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#1890ff' }}>
            {value || 0}
          </div>
          <div style={{ fontSize: '11px', color: '#666' }}>laporan lab</div>
        </div>
      )
    },
    {
      title: 'Periode',
      dataIndex: 'periode',
      key: 'periode',
      width: 120,
      render: (value) => (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
            {value}
          </div>
          <div style={{ fontSize: '11px', color: '#666' }}>
            Tahun {currentYear}
          </div>
        </div>
      )
    },
    {
      title: 'Kelengkapan (%)',
      dataIndex: 'persentase_kepatuhan',
      key: 'persentase_kepatuhan',
      width: 120,
      sorter: (a, b) => (a.persentase_kepatuhan || 0) - (b.persentase_kepatuhan || 0),
      render: (value) => (
        <div style={{ textAlign: 'center' }}>
          <Progress 
            percent={value || 0} 
            size="small" 
            status={(value || 0) >= 75 ? 'success' : (value || 0) >= 50 ? 'active' : 'exception'}
          />
          <div style={{ fontSize: '12px', marginTop: '4px' }}>
            {value || 0}%
          </div>
        </div>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      filters: [
        { text: 'Lengkap', value: 'Lengkap' },
        { text: 'Tidak Lengkap', value: 'Tidak Lengkap' },
        { text: 'Terlambat', value: 'Terlambat' }
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: 'Lengkap' | 'Tidak Lengkap' | 'Terlambat') => {
        const colors = {
          'Lengkap': 'green',
          'Tidak Lengkap': 'orange',
          'Terlambat': 'red'
        };
        const icons = {
          'Lengkap': <CheckCircleOutlined />,
          'Tidak Lengkap': <ExclamationCircleOutlined />,
          'Terlambat': <CloseCircleOutlined />
        };
        return (
          <Tag color={colors[status]} icon={icons[status]}>
            {status}
          </Tag>
        );
      }
    },
    {
      title: 'Tanggal Terakhir',
      dataIndex: 'tanggal_terakhir',
      key: 'tanggal_terakhir',
      width: 130,
      sorter: (a, b) => {
        if (a.tanggal_terakhir === '-' && b.tanggal_terakhir === '-') return 0;
        if (a.tanggal_terakhir === '-') return 1;
        if (b.tanggal_terakhir === '-') return -1;
        return dayjs(a.tanggal_terakhir).unix() - dayjs(b.tanggal_terakhir).unix();
      },
      render: (date) => {
        if (date === '-') {
          return (
            <div style={{ textAlign: 'center', color: '#999' }}>
              <div>-</div>
              <div style={{ fontSize: '11px' }}>Belum ada laporan</div>
            </div>
          );
        }
        return (
          <div>
            <div style={{ fontWeight: 'bold' }}>
              {dayjs(date).format('DD/MM/YYYY')}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              <CalendarOutlined /> {dayjs(date).fromNow()}
            </div>
          </div>
        );
      }
    },
    {
      title: 'Aksi',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="Lihat Detail Laporan Lab">
            <Button 
              type="primary" 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="Unduh Laporan Lab">
            <Button 
              icon={<DownloadOutlined />} 
              size="small"
              onClick={() => handleDownload(record)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  const handleViewDetail = (record: RekapitulasiData) => {
  console.log('View detail for:', record);

  // PERUBAHAN: Menggunakan objek untuk router.push agar lebih aman
  router.push({
    pathname: '/dashboard/admin/manajemen/laporan-rekapitulasi/laporan-lab/detail',
    query: { 
      id: record.id_user, // ID sekarang menjadi query parameter
      tahun: currentYear 
    }
  });
};

const handleDownload = (record: RekapitulasiData) => {
    console.log('Download report for:', record);
    message.info('Fitur download laporan sedang dalam pengembangan');
};

const handleViewYearlyDetail = (record: YearlyFacilityData) => {
  console.log('View yearly detail for:', record);

  // PERUBAHAN: Menggunakan objek untuk router.push agar lebih aman
  router.push({
    pathname: '/dashboard/admin/manajemen/laporan-rekapitulasi/laporan-lab/detail',
    query: { 
      id: record.id_user, // ID sekarang menjadi query parameter
      tahun: currentYear 
    }
  });
};

  // const handleDownloadYearly = (record: YearlyFacilityData) => {
  //   console.log('Download yearly report for:', record);
  //   message.info('Fitur download laporan tahunan sedang dalam pengembangan');
  // };

  // Calculate summary statistics
  const filteredData = data.filter(item => {
    const matchesSearch = searchText === '' || 
      item.nama_fasilitas.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const filteredYearlyData = yearlyData.filter(item => {
    const matchesSearch = searchText === '' || 
      item.nama_fasilitas.toLowerCase().includes(searchText.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || 
      (selectedStatus === 'Lengkap' && item.status_tahunan === 'Sangat Baik') ||
      (selectedStatus === 'Tidak Lengkap' && (item.status_tahunan === 'Cukup' || item.status_tahunan === 'Kurang')) ||
      (selectedStatus === 'Terlambat' && item.status_tahunan === 'Kurang');
    
    return matchesSearch && matchesStatus;
  });

  const totalFasilitas = filteredData.length;
  const totalLaporan = filteredData.reduce((sum, item) => sum + item.jumlah_laporan, 0);
  const rataRataKepatuhan = filteredData.length > 0 
    ? filteredData.reduce((sum, item) => sum + item.persentase_kepatuhan, 0) / filteredData.length 
    : 0;

  return (
    <MainLayout title="Manajemen Laporan Rekapitulasi - Laporan Lab">
      {/* Header Section with Year Navigation */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        color: 'white'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h3 style={{ 
            margin: 0, 
            fontSize: '24px', 
            fontWeight: 'bold',
            color: 'white'
          }}>
            🧪 Rekapitulasi Laporan Lab {currentYear}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Year Navigation */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              backgroundColor: 'rgba(255,255,255,0.15)', 
              borderRadius: '20px',
              padding: '4px',
              gap: '0px'
            }}>
              <Button 
                icon={<LeftOutlined />} 
                onClick={handlePreviousYear}
                style={{ 
                  backgroundColor: 'transparent', 
                  border: 'none', 
                  color: 'white',
                  borderRadius: '16px',
                  minWidth: '32px',
                  height: '32px',
                  padding: '0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              />
              <div style={{ 
                padding: '6px 16px', 
                color: 'white',
                fontWeight: '600',
                fontSize: '14px',
                minWidth: '60px',
                textAlign: 'center'
              }}>
                {currentYear}
              </div>
              <Button 
                icon={<RightOutlined />} 
                onClick={handleNextYear}
                style={{ 
                  backgroundColor: 'transparent', 
                  border: 'none', 
                  color: 'white',
                  borderRadius: '16px',
                  minWidth: '32px',
                  height: '32px',
                  padding: '0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              />
            </div>
          </div>
        </div>

        {/* Summary Statistics */}
        <Row gutter={[16, 16]} justify="center" style={{ marginBottom: '20px' }}>
          <Col xs={24} sm={12} md={6} lg={6}>
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '16px',
              padding: '18px',
              color: 'white',
              textAlign: 'center',
              boxShadow: '0 8px 24px rgba(102, 126, 234, 0.25)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer',
              height: '120px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <div style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '6px', lineHeight: '1' }}>
                {totalFasilitas}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.9, fontWeight: '500' }}>
                Total Fasilitas Tahunan
              </div>
            </div>
          </Col>
          
          <Col xs={24} sm={12} md={6} lg={6}>
            <div style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              borderRadius: '16px',
              padding: '18px',
              color: 'white',
              textAlign: 'center',
              boxShadow: '0 8px 24px rgba(240, 147, 251, 0.25)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer',
              height: '120px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <div style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '6px', lineHeight: '1' }}>
                {totalLaporan}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.9, fontWeight: '500' }}>
                Total Laporan Tahunan
              </div>
            </div>
          </Col>
          
          <Col xs={24} sm={12} md={6} lg={6}>
            <div style={{
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              borderRadius: '16px',
              padding: '18px',
              color: 'white',
              textAlign: 'center',
              boxShadow: '0 8px 24px rgba(250, 112, 154, 0.25)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer',
              height: '120px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <div style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '6px', lineHeight: '1' }}>
                {rataRataKepatuhan.toFixed(1)}%
              </div>
              <div style={{ fontSize: '12px', opacity: 0.9, fontWeight: '500' }}>
                Rata-rata Ketepatan Tahunan
              </div>
            </div>
          </Col>
        </Row>

        {/* Additional Yearly Statistics */}
        <Row gutter={[16, 16]} justify="center" style={{ marginBottom: '20px' }}>
          <Col xs={24} sm={12} md={6} lg={6}>
            <div style={{
              background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
              borderRadius: '16px',
              padding: '18px',
              color: '#2c3e50',
              textAlign: 'center',
              boxShadow: '0 8px 24px rgba(168, 237, 234, 0.3)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer',
              height: '120px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <div style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '6px', lineHeight: '1' }}>
                {data.filter(item => item.persentase_kepatuhan >= 90).length}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.8, fontWeight: '500' }}>
                Fasilitas Lengkap
              </div>
            </div>
          </Col>
          
          <Col xs={24} sm={12} md={6} lg={6}>
            <div style={{
              background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
              borderRadius: '16px',
              padding: '18px',
              color: '#2c3e50',
              textAlign: 'center',
              boxShadow: '0 8px 24px rgba(255, 236, 210, 0.3)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer',
              height: '120px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <div style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '6px', lineHeight: '1' }}>
                {data.filter(item => item.persentase_kepatuhan < 90 && item.persentase_kepatuhan >= 50).length}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.8, fontWeight: '500' }}>
                Fasilitas Tidak Lengkap
              </div>
            </div>
          </Col>
          
          <Col xs={24} sm={12} md={6} lg={6}>
            <div style={{
              background: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
              borderRadius: '16px',
              padding: '18px',
              color: '#2c3e50',
              textAlign: 'center',
              boxShadow: '0 8px 24px rgba(161, 196, 253, 0.3)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer',
              height: '120px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <div style={{ fontSize: '26px', fontWeight: 'bold', marginBottom: '6px', lineHeight: '1' }}>
                {data.filter(item => item.persentase_kepatuhan < 50).length}
              </div>
              <div style={{ fontSize: '12px', opacity: 0.8, fontWeight: '500' }}>
                Fasilitas Belum Lapor
              </div>
            </div>
          </Col>
        </Row>
      </div>

      {/* Filters Section */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Input
              placeholder="🔍 Cari fasilitas kesehatan..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              placeholder="Filter Status"
              value={selectedStatus}
              onChange={setSelectedStatus}
              style={{ width: '100%' }}
            >
              <Option value="all">Semua Status</Option>
              <Option value="Lengkap">Lengkap</Option>
              <Option value="Tidak Lengkap">Tidak Lengkap</Option>
              <Option value="Terlambat">Terlambat</Option>
            </Select>
          </Col>
          <Col xs={24} sm={24} md={10}>
            <Space wrap style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button type="primary" icon={<FilterOutlined />}>
                Filter
              </Button>
              <Button 
                icon={<DownloadOutlined />}
                onClick={handleExport}
              >
                Download Laporan Tahunan
              </Button>
              <Button 
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={globalStore.isloading}
              >
                Refresh
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Data Table */}
      <Card>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <Title level={4} style={{ margin: 0, color: '#667eea' }}>
            <BarChartOutlined /> Detail Rekapitulasi Laporan
          </Title>
          <div style={{ fontSize: '14px', color: '#666' }}>
            Menampilkan {filteredData.length} dari {data.length} data
          </div>
        </div>
        
        <Table
          columns={yearlyColumns}
          dataSource={yearlyData}
          loading={globalStore.isloading}
          scroll={{ x: 1200 }}
          pagination={{
            total: yearlyData.length,
            pageSize: 10,
            showSizeChanger: true,
            pageSizeOptions: ['10', '15', '20', '50', '100'],
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} dari ${total} fasilitas`,
          }}
          rowKey="id_user"
          rowClassName={(record, index) => 
            index % 2 === 0 ? 'table-row-light' : 'table-row-dark'
          }
        />
      </Card>

      <style jsx global>{`
        .table-row-light {
          background-color: #fafafa;
        }
        .table-row-dark {
          background-color: #ffffff;
        }
        .ant-table-thead > tr > th {
          background-color: #667eea !important;
          color: white !important;
          font-weight: bold;
        }
        .ant-table-tbody > tr:hover > td {
          background-color: #e6f7ff !important;
        }
      `}</style>
    </MainLayout>
  );
};

export default LaporanRekapitulasiLaporanLab;


interface LaporanLabData {
  key: string;
  id_laporan_lab: number;
  id_user: number;
  nama_fasilitas: string;
  tipe_tempat: string;
  alamat_tempat: string;
  kelurahan: string;
  kecamatan: string;
  kualitas_udara: string | null;
  kualitas_air: string | null;
  kualitas_makanan: string | null;
  usap_alat_medis: string | null;
  limbah_cair: string | null;
  catatan: string | null;
  periode: number;
  periode_nama: string;
  tahun: number;
  created_at: string;
  updated_at: string;
}

interface FacilityLabReports {
  id_user: number;
  nama_fasilitas: string;
  tipe_tempat: string;
  alamat_tempat: string;
  kelurahan: string;
  kecamatan: string;
  reports: LaporanLabData[];
  total_reports: number;
}