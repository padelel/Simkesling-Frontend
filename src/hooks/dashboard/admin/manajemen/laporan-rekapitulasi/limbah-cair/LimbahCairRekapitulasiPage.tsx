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
  volume_total: number;
  jumlah_laporan: number;
  jumlah_laporan_lab?: number;
  periode: string;
  status: 'Lengkap' | 'Tidak Lengkap' | 'Terlambat';
  persentase_kepatuhan: number;
  nama_transporter: string;
  tanggal_terakhir: string;
}

interface YearlyFacilityData {
  id_user: number;
  nama_fasilitas: string;
  tipe_tempat: string;
  alamat_tempat: string;
  kelurahan: string;
  kecamatan: string;
  total_volume_tahunan: number;
  total_laporan_tahunan: number;
  rata_rata_bulanan: number;
  bulan_tertinggi: { bulan: string; volume: number };
  bulan_terendah: { bulan: string; volume: number };
  persentase_kelengkapan: number;
  status_tahunan: 'Sangat Baik' | 'Baik' | 'Cukup' | 'Kurang';
  detail_bulanan: Array<{
    periode: string;
    volume: number;
    status: string;
    tanggal: string;
  }>;
  limbah_b3_medis_tahunan: number;
  limbah_b3_nonmedis_tahunan: number;
  limbah_jarum_tahunan: number;
  limbah_sludge_ipal_tahunan: number;
}

const LaporanRekapitulasiLimbahCair: React.FC = () => {
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

  // Calculate yearly data from raw facility data with individual reports
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
        total_volume_tahunan: 0,
        total_laporan_tahunan: 0,
        rata_rata_bulanan: 0,
        bulan_tertinggi: { bulan: '-', volume: 0 },
        bulan_terendah: { bulan: '-', volume: Number.MAX_VALUE },
        persentase_kelengkapan: 0,
        status_tahunan: 'Kurang',
        detail_bulanan: [],
        limbah_b3_medis_tahunan: 0,
        limbah_b3_nonmedis_tahunan: 0,
        limbah_jarum_tahunan: 0,
        limbah_sludge_ipal_tahunan: 0
      };

      let onTimeReportsCount = 0; // <-- TAMBAHAN: Counter untuk laporan tepat waktu

      reports.forEach((report: any) => {
        const volume = report.volume || 0;
        const monthName = report.monthName || 'Tidak Diketahui';
        
        yearlyFacility.total_volume_tahunan += volume;
        yearlyFacility.total_laporan_tahunan += 1;
        
        // --- LOGIKA KETEPATAN WAKTU DIMULAI DI SINI ---
        const reportDate = dayjs(report.created_at || report.updated_at);
        const reportPeriod = parseInt(report.periode);
        let statusLaporan = 'Tidak Ada Laporan';

        if (reportPeriod >= 1 && reportPeriod <= 12) {
          // Deadline adalah tanggal 5 bulan berikutnya, pukul 23:59:59
          // dayjs().month() adalah 0-11, jadi month(reportPeriod) adalah bulan berikutnya
          const deadline = dayjs().year(currentYear).month(reportPeriod).date(5).endOf('day');
          
          if (reportDate.isBefore(deadline) || reportDate.isSame(deadline)) {
            onTimeReportsCount++; // Laporan tepat waktu
            statusLaporan = 'Tepat Waktu';
          } else {
            statusLaporan = 'Terlambat'; // Laporan ada tapi terlambat
          }
        }
        // --- LOGIKA KETEPATAN WAKTU SELESAI ---

        yearlyFacility.detail_bulanan.push({
          periode: monthName,
          volume: volume,
          status: statusLaporan, // <-- PERUBAHAN
          tanggal: report.created_at || report.updated_at || ''
        });
        
        if (volume > 0 && volume > yearlyFacility.bulan_tertinggi.volume) {
          yearlyFacility.bulan_tertinggi = { bulan: monthName, volume: volume };
        }
        
        if (volume > 0 && volume < yearlyFacility.bulan_terendah.volume) {
          yearlyFacility.bulan_terendah = { bulan: monthName, volume: volume };
        }
      });

      if (yearlyFacility.bulan_terendah.volume === Number.MAX_VALUE) {
        yearlyFacility.bulan_terendah = { bulan: '-', volume: 0 };
      }

      yearlyFacility.rata_rata_bulanan = yearlyFacility.total_laporan_tahunan > 0 
        ? yearlyFacility.total_volume_tahunan / yearlyFacility.total_laporan_tahunan 
        : 0;
      
      // --- PERUBAHAN KALKULASI PERSENTASE ---
      // Dihitung dari laporan yang tepat waktu dibagi 12 bulan
      yearlyFacility.persentase_kelengkapan = Math.round((onTimeReportsCount / 12) * 100);
      
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
      console.log('Total facilities count:', allFacilities.length);
      
      // Log detailed structure of first facility
      if (allFacilities.length > 0) {
        console.log('First facility structure:', allFacilities[0]);
        console.log('First facility keys:', Object.keys(allFacilities[0]));
      }
      
      // Create FormData for backend API call
      const formData = new FormData();
      formData.append('tahun', currentYear.toString());
      if (selectedPeriod !== 'all') {
        formData.append('periode', selectedPeriod);
      }
      
      // Call actual backend API endpoint for limbah cair data
      const response = await api.post('/user/limbah-cair/data', formData);
      
      console.log('Backend API Response (Limbah Cair):', response.data);
      
      // Fetch lab report data
      const labFormData = new FormData();
      labFormData.append('tahun', currentYear.toString());
      if (selectedPeriod !== 'all') {
        labFormData.append('periode', selectedPeriod);
      }
      
      const labResponse = await api.post('/user/laporan-lab/data', labFormData);
      console.log('Backend API Response (Lab Reports):', labResponse.data);
      
      // Handle backend response structure for limbah cair
      let rawData = [];
      if (response.data && response.data.data) {
        rawData = response.data.data.values || response.data.data || [];
      } else if (response.data && response.data.values) {
        rawData = response.data.values;
      } else if (Array.isArray(response.data)) {
        rawData = response.data;
      }
      
      // Handle lab report data
      let labData = [];
      if (labResponse.data && labResponse.data.data) {
        labData = labResponse.data.data.values || labResponse.data.data || [];
      } else if (labResponse.data && labResponse.data.values) {
        labData = labResponse.data.values;
      } else if (Array.isArray(labResponse.data)) {
        labData = labResponse.data;
      }
      
      console.log('Raw limbah cair data:', rawData);
      console.log('Raw lab report data:', labData);
      
      // Transform API data to match table structure for limbah cair
      const processedData: RekapitulasiData[] = [];
      
      // Group data by facility (id_user) to calculate aggregated values
      const facilityMap = new Map<number, any>();
      
      // Process limbah cair data
      if (Array.isArray(rawData)) {
        rawData.forEach((item: any) => {
          const idUser = item.id_user || item.user?.id_user;
          const facilityName = item.user?.nama_tempat || item.user?.nama_user || item.nama_fasilitas || 'Fasilitas Tidak Diketahui';
          const facilityType = item.user?.tipe_tempat || 'Tidak Diketahui';
          const alamat = item.user?.alamat_tempat || '';
          const kelurahan = item.user?.kelurahan || '';
          const kecamatan = item.user?.kecamatan || '';
          const transporterName = item.transporter?.nama_transporter || item.nama_transporter || 'Tidak Ada Transporter';
          
          // Calculate volume from debit_air_limbah
          const volume = parseFloat(item.debit_air_limbah || '0') || 0;
          
          // Extract month from periode or created_at date
          let monthName = '';
          const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
          
          if (item.periode) {
            // If periode exists, convert to month name if it's a number
            const periodeNum = parseInt(item.periode);
            if (!isNaN(periodeNum) && periodeNum >= 1 && periodeNum <= 12) {
              monthName = monthNames[periodeNum - 1];
            } else {
              // If periode is already a month name, use it
              monthName = item.periode;
            }
          } else if (item.created_at) {
            // Extract month from created_at date
            const date = new Date(item.created_at);
            monthName = monthNames[date.getMonth()];
          } else {
            monthName = 'Tidak Diketahui';
          }
          
          if (!facilityMap.has(idUser)) {
            facilityMap.set(idUser, {
              id_user: idUser,
              nama_fasilitas: facilityName,
              tipe_tempat: facilityType,
              alamat_tempat: alamat,
              kelurahan: kelurahan,
              kecamatan: kecamatan,
              volume_total: 0,
              jumlah_laporan: 0,
              jumlah_laporan_lab: 0,
              nama_transporter: transporterName,
              tanggal_terakhir: item.created_at || item.updated_at || new Date().toISOString(),
              reports: [],
              lab_reports: []
            });
          }
          
          const facility = facilityMap.get(idUser);
          facility.volume_total += volume;
          facility.jumlah_laporan += 1;
          facility.reports.push({
            ...item,
            volume: volume,
            monthName: monthName
          });
          
          // Update latest date
          const currentDate = new Date(item.created_at || item.updated_at || new Date());
          const latestDate = new Date(facility.tanggal_terakhir);
          if (currentDate > latestDate) {
            facility.tanggal_terakhir = item.created_at || item.updated_at;
          }
        });
      }
      
      // Process lab report data
      if (Array.isArray(labData)) {
        labData.forEach((item: any) => {
          const idUser = item.id_user || item.user?.id_user;
          const facilityName = item.user?.nama_tempat || item.user?.nama_user || item.nama_fasilitas || 'Fasilitas Tidak Diketahui';
          const facilityType = item.user?.tipe_tempat || 'Tidak Diketahui';
          const alamat = item.user?.alamat_tempat || '';
          const kelurahan = item.user?.kelurahan || '';
          const kecamatan = item.user?.kecamatan || '';
          
          if (!facilityMap.has(idUser)) {
            facilityMap.set(idUser, {
              id_user: idUser,
              nama_fasilitas: facilityName,
              tipe_tempat: facilityType,
              alamat_tempat: alamat,
              kelurahan: kelurahan,
              kecamatan: kecamatan,
              volume_total: 0,
              jumlah_laporan: 0,
              jumlah_laporan_lab: 0,
              nama_transporter: '-',
              tanggal_terakhir: item.created_at || item.updated_at || new Date().toISOString(),
              reports: [],
              lab_reports: []
            });
          }
          
          const facility = facilityMap.get(idUser);
          facility.jumlah_laporan_lab += 1;
          facility.lab_reports.push(item);
          
          // Update latest date if lab report is more recent
          const currentDate = new Date(item.created_at || item.updated_at || new Date());
          const latestDate = new Date(facility.tanggal_terakhir);
          if (currentDate > latestDate) {
            facility.tanggal_terakhir = item.created_at || item.updated_at;
          }
        });
      }
      
      // Convert facility map to array and calculate status
      facilityMap.forEach((facility, idUser) => {
        // Calculate status based on data completeness and timeliness
        let status: 'Lengkap' | 'Tidak Lengkap' | 'Terlambat' = 'Lengkap';
        let persentase_kepatuhan = 100;
        
        // Check if facility has reports for the selected period
        if (facility.jumlah_laporan === 0) {
          status = 'Tidak Lengkap';
          persentase_kepatuhan = 0;
        } else {
          // Calculate expected reports based on period
          let expectedReports = 1;
          if (selectedPeriod === 'all') {
            expectedReports = 12; // All months
          }
          
          if (facility.jumlah_laporan < expectedReports) {
            status = 'Tidak Lengkap';
            persentase_kepatuhan = Math.round((facility.jumlah_laporan / expectedReports) * 100);
          }
        }
        
        processedData.push({
          key: facility.id_user.toString(),
          id_user: facility.id_user,
          nama_fasilitas: facility.nama_fasilitas,
          tipe_tempat: facility.tipe_tempat,
          alamat_tempat: facility.alamat_tempat,
          kelurahan: facility.kelurahan,
          kecamatan: facility.kecamatan,
          volume_total: facility.volume_total,
          jumlah_laporan: facility.jumlah_laporan,
          jumlah_laporan_lab: facility.jumlah_laporan_lab || 0,
          periode: selectedPeriod === 'all' ? 'Semua Bulan' : selectedPeriod,
          status: status,
          persentase_kepatuhan: persentase_kepatuhan,
          nama_transporter: facility.nama_transporter || '-',
          tanggal_terakhir: facility.tanggal_terakhir
        });
      });
      
      // Add facilities that haven't reported at all
      console.log('Processing facilities that haven\'t reported...');
      console.log('facilityMap keys:', Array.from(facilityMap.keys()));
      
      allFacilities.forEach((facility: any) => {
        console.log('Checking facility:', facility.id_user, facility.nama_fasilitas || facility.nama_tempat || facility.nama_user);
        if (!facilityMap.has(facility.id_user)) {
          console.log('Adding facility without reports:', facility.nama_fasilitas || facility.nama_tempat || facility.nama_user);
          processedData.push({
            key: facility.id_user.toString(),
            id_user: facility.id_user,
            nama_fasilitas: facility.nama_user || facility.nama_tempat || facility.nama_fasilitas || 'Tidak Diketahui',
            tipe_tempat: facility.jenis_tempat || facility.tipe_tempat || 'Tidak Diketahui',
            alamat_tempat: facility.alamat || facility.alamat_tempat || '-',
            kelurahan: facility.kelurahan || '-',
            kecamatan: facility.kecamatan || '-',
            volume_total: 0,
            jumlah_laporan: 0,
            jumlah_laporan_lab: 0,
            periode: selectedPeriod === 'all' ? 'Semua Bulan' : selectedPeriod,
            status: 'Tidak Lengkap' as const,
            persentase_kepatuhan: 0,
            nama_transporter: '-',
            tanggal_terakhir: '-'
          });
        } else {
          console.log('Facility already has reports:', facility.nama_fasilitas || facility.nama_tempat || facility.nama_user);
        }
      });
      
      console.log('Processed limbah cair data:', processedData);
      console.log('Total processed facilities:', processedData.length);
      
      setData(processedData);
      
      // Calculate yearly data for yearly view - pass facility data with reports
      const facilityDataWithReports = Array.from(facilityMap.values());
      
      // Add facilities without reports to yearly data as well
      allFacilities.forEach((facility: any) => {
        if (!facilityMap.has(facility.id_user)) {
          facilityDataWithReports.push({
            id_user: facility.id_user,
            nama_fasilitas: facility.nama_user || facility.nama_tempat || facility.nama_fasilitas || 'Tidak Diketahui',
            tipe_tempat: facility.tipe_tempat || facility.jenis_tempat || 'Tidak Diketahui',
            alamat_tempat: facility.alamat_tempat || facility.alamat || '-',
            kelurahan: facility.kelurahan || '-',
            kecamatan: facility.kecamatan || '-',
            volume_total: 0,
            jumlah_laporan: 0,
            nama_transporter: '-',
            tanggal_terakhir: '-',
            reports: []
          });
        }
      });
      
      console.log('Facility data with reports for yearly calculation:', facilityDataWithReports.length);
      const calculatedYearlyData = calculateYearlyData(facilityDataWithReports);
      console.log('Calculated yearly data:', calculatedYearlyData.length);
      setYearlyData(calculatedYearlyData);
      
      message.success(`Data berhasil dimuat: ${processedData.length} fasilitas kesehatan`);
      
    } catch (error: any) {
      console.error('Error fetching limbah cair data:', error);
      
      // Enhanced error handling
      let errorMessage = 'Terjadi kesalahan saat memuat data limbah cair';
      
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
      
      // Set empty data on error instead of using dummy data
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
     // 1. Ambil data yang sudah difilter yang sesuai dengan tampilan di tabel
    const dataToExport = filteredYearlyData;

    if (dataToExport.length === 0) {
      message.warning('Tidak ada data untuk diekspor.');
      return;
    }

    message.loading('Mempersiapkan file unduhan...', 0.5);

    // 2. Tentukan header untuk file CSV (judul kolom)
    const headers = [
      "ID User",
      "Nama Fasilitas",
      "Tipe Tempat",
      "Alamat",
      "Kelurahan",
      "Kecamatan",
      "Total Volume Tahunan (L)",
      "Total Laporan Tahunan",
      "Rata-rata Bulanan (L)",
      "Persentase Kelengkapan (%)",
      "Status Tahunan"
    ];

    // 3. Ubah setiap objek data menjadi baris CSV
    const csvRows = dataToExport.map(row => {
      // Pastikan urutannya sama persis dengan header
      const rowData = [
        row.id_user,
        `"${row.nama_fasilitas.replace(/"/g, '""')}"`, // Bungkus dengan kutip untuk menangani koma
        `"${row.tipe_tempat}"`,
        `"${row.alamat_tempat.replace(/"/g, '""')}"`,
        `"${row.kelurahan}"`,
        `"${row.kecamatan}"`,
        row.total_volume_tahunan,
        row.total_laporan_tahunan,
        row.rata_rata_bulanan,
        row.persentase_kelengkapan,
        `"${row.status_tahunan}"`
      ];
      return rowData.join(','); // Gabungkan dengan koma
    });

    // 4. Gabungkan header dan semua baris data, dipisahkan oleh baris baru
    const csvString = [headers.join(','), ...csvRows].join('\n');

    // 5. Buat Blob dari string CSV (file virtual di memori)
    // \uFEFF ditambahkan untuk memastikan kompatibilitas dengan Excel
    const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });

    // 6. Buat link sementara untuk memicu unduhan
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      const fileName = `rekapitulasi_limbah_cair_${currentYear}.csv`;
      
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
      title: 'Total Volume Tahunan (L)',
      dataIndex: 'total_volume_tahunan',
      key: 'total_volume_tahunan',
      width: 150,
      sorter: (a, b) => (a.total_volume_tahunan || 0) - (b.total_volume_tahunan || 0),
      render: (value) => (
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#1890ff' }}>
            {(value || 0).toLocaleString('id-ID', { minimumFractionDigits: 1 })}
          </div>
          <div style={{ fontSize: '11px', color: '#666' }}>L/tahun</div>
        </div>
      )
    },
    {
      title: 'Rata-rata Bulanan (L)',
      dataIndex: 'rata_rata_bulanan',
      key: 'rata_rata_bulanan',
      width: 140,
      sorter: (a, b) => (a.rata_rata_bulanan || 0) - (b.rata_rata_bulanan || 0),
      render: (value) => (
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
            {(value || 0).toLocaleString('id-ID', { minimumFractionDigits: 1 })}
          </div>
          <div style={{ fontSize: '11px', color: '#666' }}>L/bulan</div>
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
      title: 'Ketepatan Waktu (%)',
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
      title: 'Bulan Tertinggi',
      key: 'bulan_tertinggi',
      width: 140,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '12px' }}>
            {record.bulan_tertinggi?.bulan || '-'}
          </div>
          <div style={{ fontSize: '11px', color: '#666' }}>
            {(record.bulan_tertinggi?.volume || 0).toLocaleString('id-ID', { minimumFractionDigits: 1 })} L
          </div>
        </div>
      )
    },
    // {
    //   title: 'Jumlah Laporan',
    //   dataIndex: 'jumlah_laporan',
    //   key: 'jumlah_laporan',
    //   width: 120,
    //   sorter: (a, b) => (a.jumlah_laporan || 0) - (b.jumlah_laporan || 0),
    //   render: (value) => (
    //     <div style={{ textAlign: 'center' }}>
    //       <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#1890ff' }}>
    //         {value || 0}
    //       </div>
    //       <div style={{ fontSize: '11px', color: '#666' }}>limbah cair</div>
    //     </div>
    //   )
    // },
    // {
    //   title: 'Laporan Lab',
    //   dataIndex: 'jumlah_laporan_lab',
    //   key: 'jumlah_laporan_lab',
    //   width: 120,
    //   sorter: (a, b) => (a.jumlah_laporan_lab || 0) - (b.jumlah_laporan_lab || 0),
    //   render: (value) => (
    //     <div style={{ textAlign: 'center' }}>
    //       <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#52c41a' }}>
    //         {value || 0}
    //       </div>
    //       <div style={{ fontSize: '11px', color: '#666' }}>laporan lab</div>
    //     </div>
    //   )
    // },
    // {
    //   title: 'Kepatuhan (%)',
    //   dataIndex: 'persentase_kepatuhan',
    //   key: 'persentase_kepatuhan',
    //   width: 120,
    //   sorter: (a, b) => (a.persentase_kepatuhan || 0) - (b.persentase_kepatuhan || 0),
    //   render: (value) => (
    //     <div style={{ textAlign: 'center' }}>
    //       <div style={{ fontWeight: 'bold', fontSize: '16px', color: (value || 0) >= 80 ? '#52c41a' : (value || 0) >= 60 ? '#faad14' : '#ff4d4f' }}>
    //         {value || 0}%
    //       </div>
    //       <div style={{ fontSize: '11px', color: '#666' }}>
    //         {value >= 80 ? 'Baik' : value >= 60 ? 'Cukup' : 'Kurang'}
    //       </div>
    //     </div>
    //   )
    // },
    // {
    //   title: 'Status',
    //   dataIndex: 'status',
    //   key: 'status',
    //   width: 120,
    //   filters: [
    //     { text: 'Lengkap', value: 'Lengkap' },
    //     { text: 'Tidak Lengkap', value: 'Tidak Lengkap' },
    //     { text: 'Terlambat', value: 'Terlambat' }
    //   ],
    //   onFilter: (value, record) => record.status === value,
    //   render: (status: 'Lengkap' | 'Tidak Lengkap' | 'Terlambat') => {
    //     const colors = {
    //       'Lengkap': 'green',
    //       'Tidak Lengkap': 'orange',
    //       'Terlambat': 'red'
    //     };
    //     return <Tag color={colors[status]}>{status}</Tag>;
    //   }
    // },
    // {
    //   title: 'Tanggal Terakhir',
    //   dataIndex: 'tanggal_terakhir',
    //   key: 'tanggal_terakhir',
    //   width: 130,
    //   sorter: (a, b) => dayjs(a.tanggal_terakhir).unix() - dayjs(b.tanggal_terakhir).unix(),
    //   render: (date) => (
    //     <div>
    //       <div style={{ fontWeight: 'bold' }}>
    //         {dayjs(date).format('DD/MM/YYYY')}
    //       </div>
    //       <div style={{ fontSize: '12px', color: '#666' }}>
    //         <CalendarOutlined /> {dayjs(date).fromNow()}
    //       </div>
    //     </div>
    //   )
    // },
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
        </div>
      )
    },
    {
      title: 'Volume Total (L)',
      dataIndex: 'volume_total',
      key: 'volume_total',
      width: 130,
      sorter: (a, b) => (a.volume_total || 0) - (b.volume_total || 0),
      render: (value) => (
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
            {(value || 0).toLocaleString('id-ID', { minimumFractionDigits: 1 })}
          </div>
          <div style={{ fontSize: '11px', color: '#666' }}>L</div>
        </div>
      )
    },
    {
      title: 'Limbah Cair',
      dataIndex: 'jumlah_laporan',
      key: 'jumlah_laporan',
      width: 120,
      sorter: (a, b) => (a.jumlah_laporan || 0) - (b.jumlah_laporan || 0),
      render: (value) => (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#1890ff' }}>
            {value || 0}
          </div>
          <div style={{ fontSize: '11px', color: '#666' }}>limbah cair</div>
        </div>
      )
    },
    {
      title: 'Kepatuhan (%)',
      dataIndex: 'persentase_kepatuhan',
      key: 'persentase_kepatuhan',
      width: 120,
      sorter: (a, b) => (a.persentase_kepatuhan || 0) - (b.persentase_kepatuhan || 0),
      render: (value) => (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 'bold', fontSize: '16px', color: (value || 0) >= 80 ? '#52c41a' : (value || 0) >= 60 ? '#faad14' : '#ff4d4f' }}>
            {value || 0}%
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

  const handleViewDetail = (record: RekapitulasiData) => {
  console.log('View detail for:', record);
  
  // PERUBAHAN: Menggunakan objek untuk router.push agar lebih aman dan jelas
  router.push({
    pathname: '/dashboard/admin/manajemen/laporan-rekapitulasi/limbah-cair/detail',
    query: { 
      id: record.id_user, // ID sekarang menjadi query parameter
      tahun: currentYear 
    }
  });
};

const handleDownload = (record: RekapitulasiData) => {
    console.log('Download report for:', record);
    // Implement download logic
};

const handleViewYearlyDetail = (record: YearlyFacilityData) => {
  console.log('View yearly detail for:', record);

  // PERUBAHAN: Menggunakan objek untuk router.push agar lebih aman dan jelas
  router.push({
    pathname: '/dashboard/admin/manajemen/laporan-rekapitulasi/limbah-cair/detail',
    query: { 
      id: record.id_user, // ID sekarang menjadi query parameter
      tahun: currentYear 
    }
  });
};

  // const handleDownloadYearly = (record: YearlyFacilityData) => {
  //   console.log('Download yearly report for:', record);
  //   // Implement yearly download logic
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

  const totalFasilitas = viewMode === 'monthly' ? filteredData.length : filteredYearlyData.length;
  const totalBeratLimbah = viewMode === 'monthly' 
    ? filteredData.reduce((sum, item) => sum + item.volume_total, 0)
    : filteredYearlyData.reduce((sum, item) => sum + item.total_volume_tahunan, 0);
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
    <MainLayout title="Manajemen Laporan Rekapitulasi - Limbah Cair">
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
            💧 Rekapitulasi Laporan Limbah Cair {currentYear}
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
        <Row gutter={[16, 16]} justify="center" style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} md={6} lg={6}>
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '16px',
              padding: '20px',
              color: 'white',
              textAlign: 'center',
              boxShadow: '0 8px 24px rgba(102, 126, 234, 0.25)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer',
              height: '130px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '6px', lineHeight: '1' }}>
                {totalFasilitas}
              </div>
              <div style={{ fontSize: '13px', opacity: 0.9, fontWeight: '500' }}>
                Total Fasilitas Tahunan
              </div>
            </div>
          </Col>
          
          <Col xs={24} sm={12} md={6} lg={6}>
            <div style={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              borderRadius: '16px',
              padding: '20px',
              color: 'white',
              textAlign: 'center',
              boxShadow: '0 8px 24px rgba(240, 147, 251, 0.25)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer',
              height: '130px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '6px', lineHeight: '1' }}>
                {totalLaporan}
              </div>
              <div style={{ fontSize: '13px', opacity: 0.9, fontWeight: '500' }}>
                Total Laporan Tahunan
              </div>
            </div>
          </Col>
          
          <Col xs={24} sm={12} md={6} lg={6}>
            <div style={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              borderRadius: '16px',
              padding: '20px',
              color: 'white',
              textAlign: 'center',
              boxShadow: '0 8px 24px rgba(79, 172, 254, 0.25)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer',
              height: '130px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '6px', lineHeight: '1' }}>
                {totalBeratLimbah.toFixed(2)} L
              </div>
              <div style={{ fontSize: '13px', opacity: 0.9, fontWeight: '500' }}>
                Total Volume Limbah Tahunan
              </div>
            </div>
          </Col>
          
          <Col xs={24} sm={12} md={6} lg={6}>
            <div style={{
              background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
              borderRadius: '16px',
              padding: '20px',
              color: 'white',
              textAlign: 'center',
              boxShadow: '0 8px 24px rgba(250, 112, 154, 0.25)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer',
              height: '130px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '6px', lineHeight: '1' }}>
                {rataRataKepatuhan.toFixed(1)}%
              </div>
              <div style={{ fontSize: '13px', opacity: 0.9, fontWeight: '500' }}>
                Rata-rata Ketepatan Waktu
              </div>
            </div>
          </Col>
        </Row>

        {/* Additional Yearly Statistics */}
        <Row gutter={[16, 16]} justify="center" style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} md={6} lg={6}>
            <div style={{
              background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
              borderRadius: '16px',
              padding: '20px',
              color: '#2c3e50',
              textAlign: 'center',
              boxShadow: '0 8px 24px rgba(168, 237, 234, 0.3)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer',
              height: '130px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '6px', lineHeight: '1' }}>
                {data.filter(item => item.persentase_kepatuhan >= 90).length}
              </div>
              <div style={{ fontSize: '13px', opacity: 0.8, fontWeight: '500' }}>
                Fasilitas Lengkap
              </div>
            </div>
          </Col>
          
          <Col xs={24} sm={12} md={6} lg={6}>
            <div style={{
              background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
              borderRadius: '16px',
              padding: '20px',
              color: '#2c3e50',
              textAlign: 'center',
              boxShadow: '0 8px 24px rgba(255, 236, 210, 0.3)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer',
              height: '130px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '6px', lineHeight: '1' }}>
                {data.filter(item => item.persentase_kepatuhan < 90 && item.persentase_kepatuhan >= 50).length}
              </div>
              <div style={{ fontSize: '13px', opacity: 0.8, fontWeight: '500' }}>
                Fasilitas Tidak Lengkap
              </div>
            </div>
          </Col>
          
          <Col xs={24} sm={12} md={6} lg={6}>
            <div style={{
              background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
              borderRadius: '16px',
              padding: '20px',
              color: '#2c3e50',
              textAlign: 'center',
              boxShadow: '0 8px 24px rgba(255, 154, 158, 0.3)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer',
              height: '130px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '6px', lineHeight: '1' }}>
                {data.filter(item => item.persentase_kepatuhan < 50).length}
              </div>
              <div style={{ fontSize: '13px', opacity: 0.8, fontWeight: '500' }}>
                Fasilitas Belum Lapor
              </div>
            </div>
          </Col>
          
          <Col xs={24} sm={12} md={6} lg={6}>
            <div style={{
              background: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
              borderRadius: '16px',
              padding: '20px',
              color: '#2c3e50',
              textAlign: 'center',
              boxShadow: '0 8px 24px rgba(161, 196, 253, 0.3)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer',
              height: '130px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '6px', lineHeight: '1' }}>
                {data.length > 0 ? (data.reduce((sum, item) => sum + item.volume_total, 0) / data.length).toFixed(1) : '0.0'} L
              </div>
              <div style={{ fontSize: '13px', opacity: 0.8, fontWeight: '500' }}>
                Rata-rata Volume/Bulan
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
            pageSizeOptions: ['10', '15', '20', '50', '100'],
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

export default LaporanRekapitulasiLimbahCair;