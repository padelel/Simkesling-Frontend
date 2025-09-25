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
  Input, 
  Space,
  Statistic,
  Tag,
  Tooltip,
  Progress,
  message
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
  ReloadOutlined
} from "@ant-design/icons";
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import api from '@/utils/HttpRequest';
import { useGlobalStore } from '@/stores/globalStore';
import { MLaporanRekapitulasi, ResponseLaporanRekapitulasi } from '@/models/MLaporanRekapitulasi';

dayjs.extend(relativeTime);

const { Title } = Typography;
const { Option } = Select;

interface RekapitulasiData {
  key: string;
  id_user: number;
  nama_fasilitas: string;
  tipe_tempat: string;
  alamat_tempat: string;
  kelurahan: string;
  kecamatan: string;
  berat_total: number;
  jumlah_laporan: number;
  periode: string;
  status: 'Lengkap' | 'Tidak Lengkap' | 'Terlambat';
  persentase_kepatuhan: number;
  nama_transporter: string;
  tanggal_terakhir: string;
  limbah_b3_medis: number;
  limbah_b3_nonmedis: number;
  limbah_jarum: number;
  limbah_sludge_ipal: number;
}

interface YearlyFacilityData {
  id_user: number;
  nama_fasilitas: string;
  tipe_tempat: string;
  alamat_tempat: string;
  kelurahan: string;
  kecamatan: string;
  total_berat_tahunan: number;
  total_laporan_tahunan: number;
  rata_rata_bulanan: number;
  bulan_tertinggi: { bulan: string; berat: number };
  bulan_terendah: { bulan: string; berat: number };
  persentase_kelengkapan: number;
  status_tahunan: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Kurang';
  detail_bulanan: Array<{
    periode: string;
    berat: number;
    status: string;
    tanggal: string;
  }>;
  limbah_b3_medis_tahunan: number;
  limbah_b3_nonmedis_tahunan: number;
  limbah_jarum_tahunan: number;
  limbah_sludge_ipal_tahunan: number;
}

const LaporanRekapitulasiLimbahPadat: React.FC = () => {
  const router = useRouter();
  const globalStore = useGlobalStore();
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [searchText, setSearchText] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<RekapitulasiData[]>([]);
  const [apiData, setApiData] = useState<MLaporanRekapitulasi | null>(null);
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('yearly');
  const [yearlyData, setYearlyData] = useState<YearlyFacilityData[]>([]);

  // Fetch data from API
  const fetchData = async () => {
    try {
      setLoading(true);
      if (globalStore.setLoading) globalStore.setLoading(true);
      
      // Create FormData for backend API call
      const formData = new FormData();
      formData.append('tahun', currentYear.toString());
      if (selectedPeriod !== 'all') {
        formData.append('periode', selectedPeriod);
      }
      
      // Call actual backend API endpoint
      const response = await api.post('/user/laporan-rekapitulasi/data', formData);
      
      console.log('Backend API Response:', response.data);
      
      // Handle backend response structure
      const responseData = response.data as ResponseLaporanRekapitulasi;
      
      if (responseData.success) {
        const apiResponseData = responseData.data;
        setApiData(apiResponseData);
        
        // Transform API data to match table structure
        const transformedData: RekapitulasiData[] = [];
        const processedUsers = new Set<string>(); // Track processed users to prevent duplicates
        
        // Handle both direct users array and laporan.users structure
        const usersToProcess = apiResponseData.laporan && apiResponseData.laporan.length > 0 
          ? apiResponseData.laporan 
          : [{ users: apiResponseData.users || [], periode_nama: 'Semua Periode', periode: 0 }];
        
        usersToProcess.forEach((laporan, laporanIndex) => {
          const users = laporan.users || [];
          users.forEach((user, userIndex) => {
            // Create unique identifier for user to prevent duplicates
            const userKey = `${user.id_user}-${laporan.periode || 'default'}`;
            
            // Skip if user already processed for this period
            if (processedUsers.has(userKey)) {
              return;
            }
            processedUsers.add(userKey);
            
            // Calculate status based on data completeness
            let status: 'Lengkap' | 'Tidak Lengkap' | 'Terlambat' = 'Lengkap';
            let persentase_kepatuhan = 100;
            
            // Check if user has limbah data (handle both Limbah object and number types)
            const limbahData = typeof user.limbah === 'object' && user.limbah !== null ? user.limbah : null;
            
            if (!limbahData) {
              status = 'Tidak Lengkap';
              persentase_kepatuhan = 0;
            } else {
              // Check completeness based on required fields
              const requiredFields = [
                limbahData.berat_limbah_total,
                limbahData.nama_transporter,
                limbahData.nama_pemusnah
              ];
              const filledFields = requiredFields.filter(field => field && field.toString().trim() !== '').length;
              persentase_kepatuhan = Math.round((filledFields / requiredFields.length) * 100);
              
              if (persentase_kepatuhan < 100) {
                status = 'Tidak Lengkap';
              }
              
              // Check if report is late (simplified logic)
              const currentDate = new Date();
              const reportDate = new Date(limbahData.created_at);
              const daysDiff = Math.floor((currentDate.getTime() - reportDate.getTime()) / (1000 * 3600 * 24));
              if (daysDiff > 30) { // Consider late if more than 30 days old
                status = 'Terlambat';
              }
            }
            
            // Calculate proper berat_total from limbah data - handle multiple sources
            let beratTotal = 0;
            
            // Priority 1: Get from limbah object if it exists and has berat_limbah_total
            if (limbahData && limbahData.berat_limbah_total) {
              beratTotal = parseFloat(limbahData.berat_limbah_total.toString()) || 0;
            }
            // Priority 2: If no limbah object data, try to get from user direct properties
            else if (typeof user.limbah === 'number' && user.limbah > 0) {
              beratTotal = user.limbah;
            }
            // Priority 3: Try to calculate from individual limbah components
            else {
              const limbahB3Medis = parseFloat((limbahData?.limbah_b3_medis || (user as any).limbah_b3_medis || '0').toString()) || 0;
              const limbahB3NonMedis = parseFloat((limbahData?.limbah_b3_nonmedis || (user as any).limbah_b3_nonmedis || '0').toString()) || 0;
              const limbahJarum = parseFloat((limbahData?.limbah_jarum || (user as any).limbah_jarum || '0').toString()) || 0;
              const limbahSludge = parseFloat((limbahData?.limbah_sludge_ipal || (user as any).limbah_sludge_ipal || '0').toString()) || 0;
              
              beratTotal = limbahB3Medis + limbahB3NonMedis + limbahJarum + limbahSludge;
            }
            
            // Calculate jumlah_laporan - count how many reports this user has across all periods
            let jumlahLaporan = 0;
            if (apiResponseData.laporan && apiResponseData.laporan.length > 0) {
              // Count reports for this user across all periods
              jumlahLaporan = apiResponseData.laporan.filter(lap => 
                lap.users && lap.users.some(u => u.id_user === user.id_user && (
                  (typeof u.limbah === 'object' && u.limbah !== null) || 
                  (typeof u.limbah === 'number' && u.limbah > 0)
                ))
              ).length;
            } else {
              // If no laporan structure, count based on user having limbah data
              jumlahLaporan = (limbahData || (typeof user.limbah === 'number' && user.limbah > 0)) ? 1 : 0;
            }
            
            transformedData.push({
              key: userKey, // Use unique key to prevent React key conflicts
              id_user: user.id_user,
              nama_fasilitas: user.nama_tempat || user.nama_user || user.username,
              tipe_tempat: user.tipe_tempat || 'Tidak Diketahui',
              alamat_tempat: user.alamat_tempat || '',
              kelurahan: user.kelurahan || '',
              kecamatan: user.kecamatan || '',
              berat_total: beratTotal,
              jumlah_laporan: jumlahLaporan,
              periode: laporan.periode_nama || 'Tidak Diketahui',
              status: status,
              persentase_kepatuhan: persentase_kepatuhan,
              nama_transporter: limbahData?.nama_transporter || 'Belum Ditentukan',
              tanggal_terakhir: limbahData ? new Date(limbahData.created_at).toLocaleDateString('id-ID') : '-',
              limbah_b3_medis: limbahData ? parseFloat(limbahData.limbah_b3_medis?.toString() || '0') || 0 : ((user as any).limbah_b3_medis || 0),
              limbah_b3_nonmedis: limbahData ? parseFloat(limbahData.limbah_b3_nonmedis?.toString() || '0') || 0 : ((user as any).limbah_b3_nonmedis || 0),
              limbah_jarum: limbahData ? parseFloat(limbahData.limbah_jarum?.toString() || '0') || 0 : ((user as any).limbah_jarum || 0),
              limbah_sludge_ipal: limbahData ? parseFloat(limbahData.limbah_sludge_ipal?.toString() || '0') || 0 : ((user as any).limbah_sludge_ipal || 0),
            });
          });
        });
        
        // Additional deduplication based on id_user as final safety measure
        const uniqueData = transformedData.filter((item, index, self) => 
          index === self.findIndex(t => t.id_user === item.id_user)
        );
        
        setData(uniqueData);
        
        // Calculate yearly aggregation data
        const yearlyAggregation = calculateYearlyData(uniqueData, apiResponseData);
        setYearlyData(yearlyAggregation);
        
        message.success(`Data berhasil dimuat: ${uniqueData.length} fasilitas kesehatan`);
      } else {
        message.error('Gagal memuat data: ' + (responseData.message || 'Response tidak valid'));
        setData([]);
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      
      // Enhanced error handling
      let errorMessage = 'Terjadi kesalahan saat memuat data';
      
      if (error.response) {
        // Server responded with error status
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
        // Network error
        errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      message.error(errorMessage);
      setData([]);
    } finally {
      setLoading(false);
      if (globalStore.setLoading) globalStore.setLoading(false);
    }
  };

  // Load data when component mounts or year changes
  useEffect(() => {
    fetchData();
  }, [currentYear]);

  // Calculate yearly aggregation data
  const calculateYearlyData = (monthlyData: RekapitulasiData[], apiData: MLaporanRekapitulasi): YearlyFacilityData[] => {
    const facilityMap = new Map<number, YearlyFacilityData>();
    
    // Group data by facility
    monthlyData.forEach(item => {
      if (!facilityMap.has(item.id_user)) {
        facilityMap.set(item.id_user, {
          id_user: item.id_user,
          nama_fasilitas: item.nama_fasilitas,
          tipe_tempat: item.tipe_tempat,
          alamat_tempat: item.alamat_tempat,
          kelurahan: item.kelurahan,
          kecamatan: item.kecamatan,
          total_berat_tahunan: 0,
          total_laporan_tahunan: 0,
          rata_rata_bulanan: 0,
          bulan_tertinggi: { bulan: '', berat: 0 },
          bulan_terendah: { bulan: '', berat: Number.MAX_VALUE },
          persentase_kelengkapan: 0,
          status_tahunan: 'Kurang',
          detail_bulanan: [],
          limbah_b3_medis_tahunan: 0,
          limbah_b3_nonmedis_tahunan: 0,
          limbah_jarum_tahunan: 0,
          limbah_sludge_ipal_tahunan: 0,
        });
      }
    });

    // Process all periods for each facility
    if (apiData.laporan && apiData.laporan.length > 0) {
      apiData.laporan.forEach(laporan => {
        const users = laporan.users || [];
        users.forEach(user => {
          if (facilityMap.has(user.id_user)) {
            const facility = facilityMap.get(user.id_user)!;
            const limbahData = typeof user.limbah === 'object' && user.limbah !== null ? user.limbah : null;
            
            if (limbahData) {
              const beratBulan = parseFloat(limbahData.berat_limbah_total?.toString() || '0') || 0;
              const limbahB3Medis = parseFloat(limbahData.limbah_b3_medis?.toString() || '0') || 0;
              const limbahB3NonMedis = parseFloat(limbahData.limbah_b3_nonmedis?.toString() || '0') || 0;
              const limbahJarum = parseFloat(limbahData.limbah_jarum?.toString() || '0') || 0;
              const limbahSludge = parseFloat(limbahData.limbah_sludge_ipal?.toString() || '0') || 0;
              
              // Add to yearly totals
              facility.total_berat_tahunan += beratBulan;
              facility.total_laporan_tahunan += 1;
              facility.limbah_b3_medis_tahunan += limbahB3Medis;
              facility.limbah_b3_nonmedis_tahunan += limbahB3NonMedis;
              facility.limbah_jarum_tahunan += limbahJarum;
              facility.limbah_sludge_ipal_tahunan += limbahSludge;
              
              // Track monthly details
              facility.detail_bulanan.push({
                periode: laporan.periode_nama || `Periode ${laporan.periode}`,
                berat: beratBulan,
                status: beratBulan > 0 ? 'Ada Laporan' : 'Tidak Ada Laporan',
                tanggal: new Date(limbahData.created_at).toLocaleDateString('id-ID')
              });
              
              // Track highest and lowest months
              if (beratBulan > facility.bulan_tertinggi.berat) {
                facility.bulan_tertinggi = {
                  bulan: laporan.periode_nama || `Periode ${laporan.periode}`,
                  berat: beratBulan
                };
              }
              
              if (beratBulan < facility.bulan_terendah.berat && beratBulan > 0) {
                facility.bulan_terendah = {
                  bulan: laporan.periode_nama || `Periode ${laporan.periode}`,
                  berat: beratBulan
                };
              }
            }
          }
        });
      });
    }

    // Calculate final statistics for each facility
    facilityMap.forEach((facility, id) => {
      // Calculate average
      facility.rata_rata_bulanan = facility.total_laporan_tahunan > 0 
        ? facility.total_berat_tahunan / facility.total_laporan_tahunan 
        : 0;
      
      // Calculate completeness percentage (assuming 12 months in a year)
      facility.persentase_kelengkapan = Math.round((facility.total_laporan_tahunan / 12) * 100);
      
      // Determine yearly status
      if (facility.persentase_kelengkapan >= 90) {
        facility.status_tahunan = 'Sangat Baik';
      } else if (facility.persentase_kelengkapan >= 75) {
        facility.status_tahunan = 'Baik';
      } else if (facility.persentase_kelengkapan >= 50) {
        facility.status_tahunan = 'Cukup';
      } else {
        facility.status_tahunan = 'Kurang';
      }
      
      // Handle case where no lowest month was found
      if (facility.bulan_terendah.berat === Number.MAX_VALUE) {
        facility.bulan_terendah = { bulan: '-', berat: 0 };
      }
    });

    return Array.from(facilityMap.values());
  };

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
            {value.toLocaleString('id-ID', { minimumFractionDigits: 1 })}
          </div>
          <div style={{ fontSize: '11px', color: '#666' }}>kg</div>
        </div>
      )
    },
    {
      title: 'Jumlah Laporan',
      dataIndex: 'jumlah_laporan',
      key: 'jumlah_laporan',
      width: 120,
      sorter: (a, b) => a.jumlah_laporan - b.jumlah_laporan,
      render: (value) => (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#1890ff' }}>
            {value}
          </div>
          <div style={{ fontSize: '11px', color: '#666' }}>laporan</div>
        </div>
      )
    },
    {
      title: 'Kepatuhan (%)',
      dataIndex: 'persentase_kepatuhan',
      key: 'persentase_kepatuhan',
      width: 120,
      sorter: (a, b) => a.persentase_kepatuhan - b.persentase_kepatuhan,
      render: (value) => (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', fontSize: '16px', color: value >= 80 ? '#52c41a' : value >= 60 ? '#faad14' : '#ff4d4f' }}>
            {value}%
          </div>
          <div style={{ fontSize: '11px', color: '#666' }}>
            {value >= 80 ? 'Baik' : value >= 60 ? 'Cukup' : 'Kurang'}
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
        return <Tag color={colors[status]}>{status}</Tag>;
      }
    },
    {
      title: 'Tanggal Terakhir',
      dataIndex: 'tanggal_terakhir',
      key: 'tanggal_terakhir',
      width: 130,
      sorter: (a, b) => dayjs(a.tanggal_terakhir).unix() - dayjs(b.tanggal_terakhir).unix(),
      render: (date) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>
            {dayjs(date).format('DD/MM/YYYY')}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            <CalendarOutlined /> {dayjs(date).fromNow()}
          </div>
        </div>
      )
    },
    {
      title: 'Aksi',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="Lihat Detail">
            <Button 
              type="primary" 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => handleViewDetail(record)}
            />
          </Tooltip>
          <Tooltip title="Unduh Laporan">
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

  // Yearly columns for yearly view
  const yearlyColumns: ColumnsType<YearlyFacilityData> = [
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
        </div>
      )
    },
    {
      title: 'Total Berat Tahunan (kg)',
      dataIndex: 'total_berat_tahunan',
      key: 'total_berat_tahunan',
      width: 150,
      sorter: (a, b) => a.total_berat_tahunan - b.total_berat_tahunan,
      render: (value) => (
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#1890ff' }}>
            {value.toLocaleString('id-ID', { minimumFractionDigits: 1 })}
          </div>
          <div style={{ fontSize: '11px', color: '#666' }}>kg/tahun</div>
        </div>
      )
    },
    {
      title: 'Rata-rata Bulanan (kg)',
      dataIndex: 'rata_rata_bulanan',
      key: 'rata_rata_bulanan',
      width: 140,
      sorter: (a, b) => a.rata_rata_bulanan - b.rata_rata_bulanan,
      render: (value) => (
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
            {value.toLocaleString('id-ID', { minimumFractionDigits: 1 })}
          </div>
          <div style={{ fontSize: '11px', color: '#666' }}>kg/bulan</div>
        </div>
      )
    },
    {
      title: 'Laporan Masuk',
      dataIndex: 'total_laporan_tahunan',
      key: 'total_laporan_tahunan',
      width: 120,
      sorter: (a, b) => a.total_laporan_tahunan - b.total_laporan_tahunan,
      render: (value) => (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#52c41a' }}>
            {value}
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
      sorter: (a, b) => a.persentase_kelengkapan - b.persentase_kelengkapan,
      render: (value) => (
        <div style={{ textAlign: 'center' }}>
          <Progress 
            percent={value} 
            size="small" 
            status={value >= 75 ? 'success' : value >= 50 ? 'active' : 'exception'}
          />
          <div style={{ fontSize: '12px', marginTop: '4px' }}>
            {value}%
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
      title: 'Bulan Tertinggi',
      key: 'bulan_tertinggi',
      width: 140,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '12px' }}>
            {record.bulan_tertinggi.bulan}
          </div>
          <div style={{ fontSize: '11px', color: '#666' }}>
            {record.bulan_tertinggi.berat.toLocaleString('id-ID', { minimumFractionDigits: 1 })} kg
          </div>
        </div>
      )
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
          <Tooltip title="Unduh Laporan Tahunan">
            <Button 
              icon={<DownloadOutlined />} 
              size="small"
              onClick={() => handleDownloadYearly(record)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  // Add error handling and loading states
  const handleViewDetail = (record: RekapitulasiData) => {
    console.log('View detail for:', record);
    // Navigate to detail page with facility ID and year
    router.push(`/dashboard/admin/manajemen/laporan-rekapitulasi/limbah-padat/detail/${record.id_user}?tahun=${currentYear}`);
  };

  const handleDownload = (record: RekapitulasiData) => {
    console.log('Download report for:', record);
    // Implement download logic
  };

  const handleViewYearlyDetail = (record: YearlyFacilityData) => {
    console.log('View yearly detail for:', record);
    // Navigate to detail page with facility ID and year
    router.push(`/dashboard/admin/manajemen/laporan-rekapitulasi/limbah-padat/detail/${record.id_user}?tahun=${currentYear}`);
  };

  const handleDownloadYearly = (record: YearlyFacilityData) => {
    console.log('Download yearly report for:', record);
    // Implement yearly download logic
  };

  const handleExport = () => {
    console.log('Export all data');
    // Implement export logic
  };

  const handleRefresh = () => {
    fetchData();
  };

  const handlePreviousYear = () => {
    setCurrentYear(prev => prev - 1);
  };

  const handleNextYear = () => {
    setCurrentYear(prev => prev + 1);
  };

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

  // Calculate summary statistics
  const totalFasilitas = viewMode === 'monthly' ? filteredData.length : filteredYearlyData.length;
  const totalBeratLimbah = viewMode === 'monthly' 
    ? filteredData.reduce((sum, item) => sum + item.berat_total, 0)
    : filteredYearlyData.reduce((sum, item) => sum + item.total_berat_tahunan, 0);
  const totalLaporan = viewMode === 'monthly'
    ? filteredData.reduce((sum, item) => sum + item.jumlah_laporan, 0)
    : filteredYearlyData.reduce((sum, item) => sum + item.total_laporan_tahunan, 0);
  const rataRataKepatuhan = viewMode === 'monthly'
    ? (filteredData.length > 0 
        ? filteredData.reduce((sum, item) => sum + item.persentase_kepatuhan, 0) / filteredData.length 
        : 0)
    : (filteredYearlyData.length > 0 
        ? filteredYearlyData.reduce((sum, item) => sum + item.persentase_kelengkapan, 0) / filteredYearlyData.length 
        : 0);

  return (
    <MainLayout title="Manajemen Laporan Rekapitulasi - Limbah Padat">
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
            📊 Rekapitulasi Laporan Limbah Padat {currentYear}
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
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} md={6}>
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              padding: '20px',
              color: 'white',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
                {totalFasilitas}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>
                Total Fasilitas Tahunan
              </div>
            </div>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <div style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              borderRadius: '12px',
              padding: '20px',
              color: 'white',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
                {totalLaporan}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>
                Total Laporan Tahunan
              </div>
            </div>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <div style={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              borderRadius: '12px',
              padding: '20px',
              color: 'white',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
                {totalBeratLimbah.toFixed(2)} kg
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>
                Total Berat Limbah Tahunan
              </div>
            </div>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <div style={{
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              borderRadius: '12px',
              padding: '20px',
              color: 'white',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
                {rataRataKepatuhan.toFixed(1)}%
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>
                Rata-rata Kepatuhan Tahunan
              </div>
            </div>
          </Col>
        </Row>

        {/* Additional Yearly Statistics */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} md={6}>
            <div style={{
              background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
              borderRadius: '12px',
              padding: '20px',
              color: '#333',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
                {yearlyData.filter(item => item.status_tahunan === 'Sangat Baik').length}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.8 }}>
                Fasilitas Lengkap
              </div>
            </div>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <div style={{
              background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
              borderRadius: '12px',
              padding: '20px',
              color: '#333',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
                {yearlyData.filter(item => item.status_tahunan === 'Cukup' || item.status_tahunan === 'Kurang').length}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.8 }}>
                Fasilitas Tidak Lengkap
              </div>
            </div>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <div style={{
              background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
              borderRadius: '12px',
              padding: '20px',
              color: '#333',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
                {yearlyData.filter(item => item.status_tahunan === 'Kurang').length}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.8 }}>
                Fasilitas Belum Lapor
              </div>
            </div>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <div style={{
              background: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
              borderRadius: '12px',
              padding: '20px',
              color: '#333',
              textAlign: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
                {yearlyData.length > 0 ? (yearlyData.reduce((sum, item) => sum + item.rata_rata_bulanan, 0) / yearlyData.length).toFixed(2) : '0.0'} kg
              </div>
              <div style={{ fontSize: '14px', opacity: 0.8 }}>
                Rata-rata Berat/Bulan
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
                onClick={() => message.info('Fitur download laporan tahunan sedang dalam pengembangan')}
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

export default LaporanRekapitulasiLimbahPadat;