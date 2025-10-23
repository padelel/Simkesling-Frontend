import React, { useEffect, useState } from "react";
import MainLayout from "@/components/MainLayout";
import { Button, Space, Modal, Col, Row, Form, Input, Tag } from "antd";
import { Table } from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";
import api from "@/utils/HttpRequest";
import ModalView from "@/components/admin/laporan/ModalView";
import { useRouter } from "next/router";
import cloneDeep from "clone-deep";
import { MLaporanBulanan } from "@/models/MLaporanBulanan";
import { useLaporanBulananStore } from "@/stores/laporanBulananStore";
import {
  LoginOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  ExclamationCircleFilled,
  ReloadOutlined,
  DownOutlined,
  RightOutlined,
  LeftOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { parsingDate } from "@/utils/common";
import { useGlobalStore } from "@/stores/globalStore";

// Add CSS for group rows
const groupRowStyles = `
  .group-row {
    background-color: #f5f5f5 !important;
    font-weight: bold;
  }
  .group-row:hover {
    background-color: #e6f7ff !important;
  }
  .year-group-row {
    background-color: #fafafa !important;
    font-weight: 600;
    font-style: italic;
  }
  .year-group-row:hover {
    background-color: #f0f8ff !important;
  }
  .detail-row {
    background-color: #ffffff !important;
    padding-left: 20px;
  }
  .detail-row:hover {
    background-color: #f9f9f9 !important;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = groupRowStyles;
  document.head.appendChild(styleElement);
}

interface DataType {
  statusBerlaku: any;
  status: any;
  namaTransporter: any;
  namaPemusnah: any;
  namaTempat: any;
  periode: any;
  tahun: any;
  tanggalPengajuan: any;
  tanggalRevisi: any;
  tanggalBerakhir: any;
  key: React.Key;
  name: string;
  age: number;
  address: string;
  isGroup?: boolean;
  isYearGroup?: boolean;
  children?: DataType[];
  reportedMonths?: number[];
  facilityData?: any[];
  isPlaceholder?: boolean;
  [key: string]: any;
}

const ManajemenLaporanLimbahCairPage: React.FC = () => {
  const router = useRouter();
  const globalStore = useGlobalStore();
  const laporanBulananStore = useLaporanBulananStore();
  const [groupedDataByYear, setGroupedDataByYear] = useState<{ [key: string]: DataType[] }>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formInstance] = Form.useForm();
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [form, setForm] = useState<any>({
    nama_user: "",
  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);

  const onChange = (pagination: any, filters: any, sorter: any, extra: any) => {
    console.log("params", pagination, filters, sorter, extra);
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  const handleExpand = (expanded: boolean, record: DataType) => {
    const keys = [...expandedRowKeys];
    if (expanded) {
      keys.push(record.key);
    } else {
      const index = keys.indexOf(record.key);
      if (index > -1) {
        keys.splice(index, 1);
      }
    }
    setExpandedRowKeys(keys);
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleChangeInput = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setForm({
      ...form,
      [name]: value,
    });
  };

  // Year navigation functions
  const handlePreviousYear = () => {
    if (currentYear > Math.min(...availableYears)) {
      setCurrentYear(currentYear - 1);
      setExpandedRowKeys([]); // Reset expanded rows when changing year
      setCurrentPage(1); // Reset pagination when changing year
    }
  };

  const handleNextYear = () => {
    if (currentYear < Math.max(...availableYears)) {
      setCurrentYear(currentYear + 1);
      setExpandedRowKeys([]); // Reset expanded rows when changing year
      setCurrentPage(1); // Reset pagination when changing year
    }
  };

  const getCurrentYearData = () => {
    const baseData = groupedDataByYear[currentYear.toString()] || [];
    const expandedData: DataType[] = [];
    
    baseData.forEach(item => {
      expandedData.push(item);
      
      // If this is a group row and it's expanded, add its children
      if (item.isGroup && expandedRowKeys.includes(item.key) && item.facilityData) {
        item.facilityData.forEach((record: any) => {
          expandedData.push({
            ...record,
            isDetailRow: true // Mark as detail row for styling
          });
        });
      }
    });
    
    return expandedData;
  };

const getReportedMonths = (facilityData: any[]): number[] => {
    const reportedMonths = new Set<number>();
    const fullMonthNames = ['januari', 'februari', 'maret', 'april', 'mei', 'juni', 'juli', 'agustus', 'september', 'oktober', 'november', 'desember'];

    facilityData.forEach(item => {
      // Lewati jika periode null, undefined, atau placeholder
      if (item.periode === null || item.periode === undefined || item.isPlaceholder) {
        return;
      }

      // 1. Prioritaskan konversi ke angka
      const periodeNum = parseInt(item.periode.toString(), 10);

      // 2. Jika hasilnya adalah angka bulan yang valid, gunakan itu
      if (!isNaN(periodeNum) && periodeNum >= 1 && periodeNum <= 12) {
        reportedMonths.add(periodeNum);
        return; // Lanjut ke item berikutnya
      }

      // 3. Jika gagal, baru coba parsing nama bulan (sebagai fallback)
      const periodeStr = item.periode.toString().toLowerCase().trim();
      const monthIndex = fullMonthNames.findIndex(month => month === periodeStr);

      if (monthIndex !== -1) {
        reportedMonths.add(monthIndex + 1);
      }
    });

    return Array.from(reportedMonths).sort((a, b) => a - b);
  };

  const renderMonthTags = (reportedMonths: number[]) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const allMonths = Array.from({length: 12}, (_, i) => i + 1);
    
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
        {allMonths.map(month => {
          const isReported = reportedMonths.includes(month);
          return (
            <Tag 
              key={month}
              color={isReported ? 'green' : 'red'}
              style={{ fontSize: '10px', padding: '1px 4px', margin: '1px' }}
            >
              {monthNames[month - 1]}
            </Tag>
          );
        })}
      </div>
    );
  };

  const columns: ColumnsType<DataType> = [
    {
      title: "Nama Tempat",
      dataIndex: "namaTempat",
      key: "namaTempat",
      render: (text, record) => {
        if (record.isYearGroup) {
          return <span style={{ fontWeight: 'bold', fontSize: '14px' }}>📅 Tahun {text}</span>;
        }
        if (record.isGroup) {
          const reportedMonths = record.reportedMonths || [];
          return (
            <div>
              <div 
                style={{ 
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                💧 {text} ({reportedMonths.length}/12 bulan dilaporkan)
              </div>
              {renderMonthTags(reportedMonths)}
            </div>
          );
        }
        // Add indentation for detail rows
        return (
          <div style={{ paddingLeft: '24px' }}>
            {text}
          </div>
        );
      },
      onCell: (record) => {
        if (record.isYearGroup) {
          return {
            colSpan: 6,
            className: 'year-group-row'
          };
        }
        if (record.isGroup) {
          return {
            colSpan: 6,
            className: 'group-row'
          };
        }
        return {};
      },
    },
    {
      title: "Periode (Bulan)",
      dataIndex: "periode",
      key: "periode",
      render: (text, record) => {
        if (record.isGroup || record.isYearGroup) {
          return null;
        }
        // Handle placeholder data
        if (record.isPlaceholder || record.status === 'Belum Melapor') {
          return <span style={{ color: '#999', fontStyle: 'italic' }}>Belum melapor</span>;
        }
        // Convert number to month name if it's a number
        if (typeof text === 'number' || (typeof text === 'string' && !isNaN(Number(text)))) {
          const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
          const monthIndex = Number(text) - 1;
          return monthNames[monthIndex] || text;
        }
        return text || '-';
      },
      onCell: (record) => {
        if (record.isGroup || record.isYearGroup) {
          return { colSpan: 0 };
        }
        return {};
      },
    },
    {
      title: "Tahun",
      dataIndex: "tahun",
      key: "tahun",
      render: (text, record) => {
        if (record.isGroup || record.isYearGroup) {
          return null;
        }
        // Handle placeholder data
        if (record.isPlaceholder || record.status === 'Belum Melapor') {
          return <span style={{ color: '#999', fontStyle: 'italic' }}>Belum melapor</span>;
        }
        return text || '-';
      },
      onCell: (record) => {
        if (record.isGroup || record.isYearGroup) {
          return { colSpan: 0 };
        }
        return {};
      },
    },
    {
      title: "Tanggal Pengajuan",
      dataIndex: "tanggalPengajuan",
      key: "tanggalPengajuan",
      render: (text, record) => {
        if (record.isGroup || record.isYearGroup) {
          return null;
        }
        // Handle placeholder data
        if (record.isPlaceholder || record.status === 'Belum Melapor') {
          return <span style={{ color: '#999', fontStyle: 'italic' }}>Belum melapor</span>;
        }
        return parsingDate(text);
      },
      onCell: (record) => {
        if (record.isGroup || record.isYearGroup) {
          return { colSpan: 0 };
        }
        return {};
      },
    },
    {
      title: "Tanggal Revisi",
      dataIndex: "tanggalRevisi",
      key: "tanggalRevisi",
      render: (text, record) => {
        if (record.isGroup || record.isYearGroup) {
          return null;
        }
        // Handle placeholder data
        if (record.isPlaceholder || record.status === 'Belum Melapor') {
          return <span style={{ color: '#999', fontStyle: 'italic' }}>Belum melapor</span>;
        }
        return text ? parsingDate(text) : '-';
      },
      onCell: (record) => {
        if (record.isGroup || record.isYearGroup) {
          return { colSpan: 0 };
        }
        return {};
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => {
        if (record.isGroup || record.isYearGroup) {
          return null;
        }
        // Handle placeholder data - show different action for facilities that haven't reported
        if (record.isPlaceholder || record.status === 'Belum Melapor') {
          return (
            <Space size="middle">
              <span style={{ color: '#999', fontStyle: 'italic' }}>Belum ada laporan</span>
            </Space>
          );
        }
        return (
          <Space size="middle">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
            >
              View
            </Button>
          </Space>
        );
      },
      onCell: (record) => {
        if (record.isGroup || record.isYearGroup) {
          return { colSpan: 0 };
        }
        return {};
      },
    },
  ];

  const handleView = (record: any) => {
    if (laporanBulananStore.simpenSementara) {
      laporanBulananStore.simpenSementara(record);
    }
    router.push("/dashboard/admin/manajemen/laporan/limbah-cair/ViewLaporan");
  };

  const getData = async () => {
    if (globalStore.setLoading) globalStore.setLoading(true);
    setCurrentPage(1); // Reset pagination when filtering data
    try {
      // Fetch all healthcare facilities first
      const allFacilitiesResponse = await api.post("/user/puskesmas-rumahsakit/data");
      const allFacilities = allFacilitiesResponse.data.data.values || [];
      console.log('All Facilities:', allFacilities);

      let dataForm: any = new FormData();
      // Only append nama_user filter if it has value and is not just whitespace
      if (form.nama_user && form.nama_user.trim()) {
        dataForm.append("nama_user", form.nama_user.trim());
      }
      
      let url = "/admin/limbah-cair/data"; // Different endpoint for limbah cair
      let responsenya = await api.post(url, dataForm);
      
      console.log('API Response (Limbah Cair):', responsenya.data);
      
      // Handle different response structures
      let rawData = [];
      if (responsenya.data && responsenya.data.data && responsenya.data.data.values) {
        rawData = responsenya.data.data.values;
      } else if (responsenya.data && responsenya.data.data) {
        rawData = Array.isArray(responsenya.data.data) ? responsenya.data.data : [responsenya.data.data];
      } else if (responsenya.data && Array.isArray(responsenya.data)) {
        rawData = responsenya.data;
      } else {
        console.warn('Unexpected API response structure:', responsenya.data);
        rawData = [];
      }
      
      console.log('Raw Data (Limbah Cair):', rawData);
      
      // Create a map of facilities that have reported
      const reportedFacilities = new Set();
      const reportsByFacility: { [key: string]: any[] } = {};
      const yearsInData = new Set<string>();
      
      rawData.forEach((item: any) => {
        const facilityName = item.nama_user || item.user?.nama_user || 'Unknown';
        reportedFacilities.add(facilityName);
        
        // Extract year from data
        let year: string;
        if (item.tahun) {
          year = item.tahun.toString();
        } else {
          const dateField = item.tanggal_laporan || item.created_at || item.tanggal_pengajuan;
          if (dateField) {
            year = new Date(dateField).getFullYear().toString();
          } else {
            year = '2024'; // Default fallback
          }
        }
        yearsInData.add(year);
        
        if (!reportsByFacility[facilityName]) {
          reportsByFacility[facilityName] = [];
        }
        reportsByFacility[facilityName].push(item);
      });
      
      // Create enhanced data that includes all facilities
      const enhancedData = [...rawData];
      
      // Add entries for facilities that haven't reported for each year
      const yearsArray = Array.from(yearsInData);
      if (yearsArray.length === 0) {
        yearsArray.push('2024'); // Ensure at least one year exists
      }
      
      // Filter facilities based on nama_user filter if provided
      let filteredFacilities = allFacilities;
      if (form.nama_user && form.nama_user.trim()) {
        const searchTerm = form.nama_user.trim().toLowerCase();
        filteredFacilities = allFacilities.filter((facility: any) => 
          facility.nama_user && facility.nama_user.toLowerCase().includes(searchTerm)
        );
      }
      
      filteredFacilities.forEach((facility: any) => {
        const facilityName = facility.nama_user;
        
        yearsArray.forEach(year => {
          // Check if this facility has reported for this specific year
          const hasReportedForYear = rawData.some((item: any) => {
            const itemFacilityName = item.nama_user || item.user?.nama_user || 'Unknown';
            let itemYear: string;
            if (item.tahun) {
              itemYear = item.tahun.toString();
            } else {
              const dateField = item.tanggal_laporan || item.created_at || item.tanggal_pengajuan;
              if (dateField) {
                itemYear = new Date(dateField).getFullYear().toString();
              } else {
                itemYear = '2024';
              }
            }
            return itemFacilityName === facilityName && itemYear === year;
          });
          
          if (!hasReportedForYear) {
            enhancedData.push({
              id_limbah_cair: `placeholder_${facility.id_user}_${year}`,
              nama_user: facilityName,
              nama_transporter: 'Belum ada data',
              periode: 'Belum melapor',
              tahun: year,
              tanggal_pengajuan: null,
              tanggal_revisi: null,
              status: 'Belum Melapor',
              isPlaceholder: true,
              user: {
                nama_user: facilityName
              }
            });
          }
        });
      });
      
      // Also filter the enhanced data based on nama_user filter for better search results
      let finalData = enhancedData;
      if (form.nama_user && form.nama_user.trim()) {
        const searchTerm = form.nama_user.trim().toLowerCase();
        finalData = enhancedData.filter((item: any) => {
          const facilityName = item.nama_user || item.user?.nama_user || '';
          return facilityName.toLowerCase().includes(searchTerm);
        });
      }
      
      console.log('Final filtered data:', finalData);
      
      if (!Array.isArray(finalData) || finalData.length === 0) {
        console.log('No data available after filtering - setting empty arrays');
        setGroupedDataByYear({});
        return;
      }
      
      // Group data by year and location
      const groupedData: { [key: string]: { [key: string]: any[] } } = {};
      
      finalData.forEach((item: any) => {
        console.log('Processing item:', item);
        
        let year: string;
        // Prioritize tahun column first, then fall back to date fields
        if (item.tahun) {
          year = item.tahun.toString();
          console.log('Year from tahun column:', year);
        } else {
          // Fallback to date fields if tahun column is not available
          const dateField = item.tanggal_laporan || item.created_at || item.tanggal_pengajuan;
          console.log('Date field found:', dateField);
          
          if (dateField) {
            year = new Date(dateField).getFullYear().toString();
            console.log('Year from date field:', year);
          } else {
            year = '2024'; // Default fallback
            console.log('Using default year:', year);
          }
        }
        
        console.log('Final determined year:', year);
        const location = item.nama_user || item.user?.nama_user || 'Unknown Location';
        
        if (!groupedData[year]) {
          groupedData[year] = {};
        }
        if (!groupedData[year][location]) {
          groupedData[year][location] = [];
        }
        
        groupedData[year][location].push({
          key: item.id_limbah_cair || item.id || Math.random().toString(),
          namaTempat: item.nama_user || item.user?.nama_user || '-',
          namaTransporter: item.nama_transporter || item.transporter || '-',
          periode: item.periode || '-',
          tahun: item.tahun || year,
          tanggalPengajuan: item.tanggal_pengajuan || item.tanggal_laporan || item.created_at || '-',
          tanggalRevisi: item.tanggal_revisi || item.updated_at || null,
          status: item.status || 'Active',
          isPlaceholder: item.isPlaceholder || false,
          ...item
        });
      });
      
      // Convert grouped data to processedGroupedData with group headers and individual records
      const processedGroupedData: { [key: string]: DataType[] } = {};
      const allYears = Object.keys(groupedData).sort();
      
      allYears.forEach(year => {
        processedGroupedData[year] = [];
        
        Object.keys(groupedData[year]).sort().forEach(location => {
          const facilityData = groupedData[year][location];
          const reportedMonths = getReportedMonths(facilityData);
          
          // Add location group header
          processedGroupedData[year].push({
            key: `group-${year}-${location}`,
            namaTempat: location,
            isGroup: true,
            reportedMonths: reportedMonths,
            facilityData: facilityData,
            namaTransporter: '',
            namaPemusnah: '',
            periode: '',
            tahun: '',
            tanggalPengajuan: '',
            tanggalRevisi: '',
            tanggalBerakhir: '',
            statusBerlaku: '',
            status: '',
            name: '',
            age: 0,
            address: ''
          });
          
          // Add individual records under the group (only when expanded)
          // Don't add them here - let the expansion handle showing them
        });
      });
      
      setGroupedDataByYear(processedGroupedData);
      
      // Set available years and current year
      const years = allYears.map(y => parseInt(y)).sort((a, b) => b - a);
      setAvailableYears(years);
      if (years.length > 0 && !years.includes(currentYear)) {
        setCurrentYear(years[0]);
      }
      
    } catch (e) {
      console.error(e);
    } finally {
      if (globalStore.setLoading) globalStore.setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <MainLayout title="Manajemen Laporan Limbah Cair">
      <h2 style={{ textAlign: "center" }}>Manajemen Laporan Limbah Cair</h2>
      
      <Form form={formInstance}>
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Form.Item name="form_nama_user" label="Nama Tempat">
              <Input
                placeholder="Masukan Nama Tempat"
                onChange={handleChangeInput}
                name="nama_user"
                allowClear={true}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label=" ">
              <Space>
                <Button type="primary" onClick={getData} icon={<ReloadOutlined />}>
                  Filter
                </Button>
              </Space>
            </Form.Item>
          </Col>
        </Row>
      </Form>

      {/* Purple Dashboard Tracker */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        color: 'white',
        boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ 
            margin: 0, 
            color: 'white', 
            fontSize: '24px',
            fontWeight: 'bold'
          }}>
            🎯 Dashboard Laporan Limbah Cair {currentYear}
          </h3>
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
              disabled={availableYears.length === 0 || currentYear <= Math.min(...availableYears)}
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
              disabled={availableYears.length === 0 || currentYear >= Math.max(...availableYears)}
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
        
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <div style={{ 
              backgroundColor: 'rgba(255,255,255,0.2)', 
              borderRadius: '8px', 
              padding: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>
                {(() => {
                  const currentYearGroupedData = groupedDataByYear[currentYear.toString()] || [];
                  return currentYearGroupedData.filter(item => item.isGroup).length;
                })()}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>Total Fasilitas</div>
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <div style={{ 
              backgroundColor: 'rgba(255,255,255,0.2)', 
              borderRadius: '8px', 
              padding: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>
                {(() => {
                  const currentYearGroupedData = groupedDataByYear[currentYear.toString()] || [];
                  let totalReports = 0;
                  currentYearGroupedData.forEach(item => {
                    if (item.isGroup && item.facilityData) {
                      totalReports += item.facilityData.filter((report: any) => 
                        report && 
                        report.tanggalPengajuan && 
                        !report.key?.toString().includes('placeholder')
                      ).length;
                    }
                  });
                  return totalReports;
                })()}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>Total Laporan</div>
            </div>
          </Col>
        </Row>

        {/* Monthly Progress Bar */}
        <div style={{ marginTop: '20px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '12px', color: 'white' }}>📊 Progress Pelaporan Bulanan {currentYear}</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(12, 1fr)', 
            gap: '8px'
          }}>
            {Array.from({length: 12}, (_, i) => {
              const monthNum = i + 1;
              const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
              const currentYearData = getCurrentYearData();
              
              // Count facilities that have reported for this specific month
              const facilitiesReportedThisMonth = currentYearData.filter(item => 
                item.isGroup && item.reportedMonths && item.reportedMonths.includes(monthNum)
              ).length;
              
              // Total facilities (groups) available
              const totalFacilities = currentYearData.filter(item => item.isGroup).length;
              
              // Calculate percentage
              const percentage = totalFacilities > 0 ? Math.round((facilitiesReportedThisMonth / totalFacilities) * 100) : 0;
              
              return (
                <div key={monthNum} style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderRadius: '6px',
                  padding: '8px 4px',
                  textAlign: 'center',
                  fontSize: '12px'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{monthNames[i]}</div>
                  <div style={{ 
                    height: '40px',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '4px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: `${percentage}%`,
                      backgroundColor: percentage > 80 ? '#52c41a' : percentage > 50 ? '#faad14' : '#ff4d4f',
                      transition: 'height 0.3s ease'
                    }}></div>
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      color: 'white',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
                    }}>
                      {percentage}%
                    </div>
                  </div>
                  <div style={{ marginTop: '4px', fontSize: '10px' }}>
                    {facilitiesReportedThisMonth}/{totalFacilities}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>



      {/* Limbah Cair Table with Enhanced Features */}
      <div style={{
         backgroundColor: '#ffffff',
         borderRadius: '12px',
         padding: '24px',
         boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
         border: '2px solid #667eea'
       }}>
             <h2 style={{ 
               fontSize: '20px', 
               fontWeight: 'bold', 
               marginBottom: '16px',
               color: '#667eea',
               display: 'flex',
               alignItems: 'center',
               gap: '8px'
             }}>
               💧 Detail Laporan Tahun {currentYear}
             </h2>
          <Table
            columns={columns}
            dataSource={getCurrentYearData()}
            onChange={onChange}
            expandable={{
              expandedRowKeys: expandedRowKeys,
              onExpand: (expanded, record) => handleExpand(expanded, record),
              expandIcon: ({ expanded, onExpand, record }) => {
                if (record.isGroup) {
                  return expanded ? (
                    <DownOutlined onClick={e => onExpand(record, e)} />
                  ) : (
                    <RightOutlined onClick={e => onExpand(record, e)} />
                  );
                }
                return null;
              },
              rowExpandable: (record) => !!record.isGroup
            }}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: getCurrentYearData().length,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} dari ${total} laporan`,
              pageSizeOptions: ['10', '15', '20', '50', '100'],
              onShowSizeChange: (current, size) => {
                setPageSize(size);
                setCurrentPage(1);
              },
              onChange: (page, size) => {
                setCurrentPage(page);
                if (size && size !== pageSize) {
                  setPageSize(size);
                }
              },
            }}
            scroll={{ x: 1200 }}
            rowClassName={(record) => {
              if (record.isGroup) return 'group-row';
              if (record.isDetailRow) return 'detail-row';
              return '';
            }}
          />
          </div>

      <Modal
        title="Detail Laporan Limbah Cair"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        width={800}
      >
        <ModalView />
      </Modal>
    </MainLayout>
  );
};

export default ManajemenLaporanLimbahCairPage;