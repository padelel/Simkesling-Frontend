import React, { useEffect, useState, useMemo, useCallback } from "react";
import MainLayout from "@/components/MainLayout";
import { Button, Space, Modal, Col, Row, Form, Input, Tag } from "antd";
import { Table } from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";
import api from "@/utils/HttpRequest";
import ModalView from "@/components/admin/laporan/ModalView";
import { getLaporanLabData } from "../../../../../../api/laporan-lab";
import { useRouter } from "next/router";
import cloneDeep from "clone-deep";
import { MLaporanBulanan } from "@/models/MLaporanBulanan";
import { useLaporanBulananStore } from "@/stores/laporanBulananStore";
import { useLaporanLabStore } from "@/stores/laporanLabStore";
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

interface DataType {
  statusBerlaku: any;
  status_laporan_lab: any;
  namaTempat: any;
  tanggalDibuat: any;
  key: React.Key;
  name: string;
  age: number;
  address: string;
  isGroup?: boolean;
  isYearGroup?: boolean;
  children?: DataType[];
  [key: string]: any;
}

const ManajemenLaporanLimbahPadatPage: React.FC = () => {
  const router = useRouter();
  const globalStore = useGlobalStore();
  const laporanBulananStore = useLaporanBulananStore();
  const laporanLabStore = useLaporanLabStore();
  const [groupedDataByYear, setGroupedDataByYear] = useState<{ [key: string]: DataType[] }>({});
  const [dataExport, setDataExport] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formInstance] = Form.useForm();
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  // Add pagination state management
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);
  const [form, setForm] = useState<any>({
    nama_user: "",
  });

  // Inject styles only once on component mount
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const existingStyle = document.getElementById('limbah-padat-styles');
      if (!existingStyle) {
        const styleElement = document.createElement('style');
        styleElement.id = 'limbah-padat-styles';
        styleElement.textContent = groupRowStyles;
        document.head.appendChild(styleElement);
      }
    }
  }, []);

  // Memoize the getReportedMonths function to avoid recalculation on every render
const getReportedMonths = useCallback((facilityData: any[]) => {
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
  }, []);

  // Memoize the renderMonthTags function to avoid recalculation on every render
  const renderMonthTags = useCallback((reportedMonths: number[]) => {
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
  }, []);

  // Memoize the data processing logic to avoid recalculation on every render
  const processedData = useMemo(() => {
    if (!dataExport || dataExport.length === 0) {
      return { processedGroupedData: {}, availableYears: [] };
    }

    // Group data by year and location
    const groupedData: { [key: string]: { [key: string]: any[] } } = {};
    
    dataExport.forEach((item: any, index: number) => {
      let year: string;
      // Prioritize tahun column first, then fall back to date fields
      if (item.tahun) {
        year = item.tahun.toString();
      } else {
        // Fallback to date fields if tahun column is not available
        const dateField = item.tanggal_pengajuan || item.created_at || item.tanggal_laporan;
        
        if (dateField) {
          year = new Date(dateField).getFullYear().toString();
        } else {
          year = new Date().getFullYear().toString(); // Use current year as fallback
        }
      }
      
      const location = item.nama_user || item.user?.nama_user || 'Unknown Location';
      
      if (!groupedData[year]) {
        groupedData[year] = {};
      }
      if (!groupedData[year][location]) {
        groupedData[year][location] = [];
      }
      
      const processedItem = {
        key: item.id_laporan_lab || item.id || Math.random().toString(),
        namaTempat: item.nama_user || item.user?.nama_user || '-',
        periode: item.periode || item.periode_nama || '-',
        tahun: item.tahun || year || '-',
        tanggalDibuat: item.created_at || '-',
        ...item
      };
      
      groupedData[year][location].push(processedItem);
    });

    // Process each year separately to ensure proper separation
    const processedGroupedData: { [key: string]: DataType[] } = {};
    
    Object.keys(groupedData).forEach(year => {
      processedGroupedData[year] = [];
      
      const yearData = groupedData[year];
      
      if (yearData && Object.keys(yearData).length > 0) {
        Object.keys(yearData).sort().forEach(location => {
          const facilityData = yearData[location];
          
          if (facilityData.length > 0) {
            const reportedMonths = getReportedMonths(facilityData);
            
            // Add location group header with children
            const groupItem = {
              key: `group-${year}-${location}`,
              namaTempat: location,
              isGroup: true,
              reportedMonths: reportedMonths,
              facilityData: facilityData,
              namaLab: '',
              jenisPemeriksaan: '',
              totalPemeriksaan: '',
              periode: '',
              tahun: year,
              tanggalDibuat: '',
              name: '',
              age: 0,
              address: '',
              children: facilityData.map(item => ({
                ...item,
                key: item.key || item.id_laporan_lab || item.id || Math.random().toString(),
                tahun: year // Ensure year is correctly set
              }))
            };
            
            processedGroupedData[year].push(groupItem);
          }
        });
      }
    });

    const availableYears = Object.keys(processedGroupedData)
      .map(year => parseInt(year))
      .sort((a, b) => b - a);

    return { processedGroupedData, availableYears };
  }, [dataExport, getReportedMonths]);

  // Memoize event handlers to prevent unnecessary re-renders
  const onChange: TableProps<DataType>['onChange'] = (pagination, filters, sorter, extra) => {
    // Handle table changes if needed
  };

  const handleExpand = useCallback((expanded: boolean, record: DataType) => {
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
  }, [expandedRowKeys]);

  const showModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleOk = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleCancel = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const handleChangeInput = useCallback((
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setForm(prevForm => ({
      ...prevForm,
      [name]: value,
    }));
  }, []);

  const handleChangeSelect = useCallback((val: any, name: string, event: any) => {
    setForm(prevForm => ({
      ...prevForm,
      [name]: val,
    }));
  }, []);

  // Year navigation functions
  const handlePreviousYear = () => {
    if (availableYears.length > 0 && currentYear > Math.min(...availableYears)) {
      setCurrentYear(currentYear - 1);
      setExpandedRowKeys([]); // Reset expanded rows when changing year
      setCurrentPage(1); // Reset pagination when changing year
    }
  };

  const handleNextYear = () => {
    if (availableYears.length > 0 && currentYear < Math.max(...availableYears)) {
      setCurrentYear(currentYear + 1);
      setExpandedRowKeys([]); // Reset expanded rows when changing year
      setCurrentPage(1); // Reset pagination when changing year
    }
  };

  const getCurrentYearData = () => {
    return groupedDataByYear[currentYear.toString()] || [];
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
                📍 {text} ({reportedMonths.length}/12 bulan dilaporkan)
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
            colSpan: 5,
            className: 'year-group-row'
          };
        }
        if (record.isGroup) {
          return {
            colSpan: 5,
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
        if (record.isPlaceholder || record.status_laporan_lab === 'Belum Melapor') {
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
      title: "Tanggal Dibuat",
      dataIndex: "tanggalDibuat",
      key: "tanggalDibuat",
      render: (text, record) => {
        if (record.isGroup || record.isYearGroup) {
          return null;
        }
        // Handle placeholder data
        if (record.isPlaceholder || record.status_laporan_lab === 'Belum Melapor') {
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
      title: "Action",
      key: "action",
      render: (_, record) => {
        if (record.isGroup || record.isYearGroup) {
          return null;
        }
        // Handle placeholder data - show different action for facilities that haven't reported
        if (record.isPlaceholder || record.status_laporan_lab === 'Belum Melapor') {
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

  const handleView = useCallback((record: any) => {
    if (laporanLabStore.simpenSementara) {
      laporanLabStore.simpenSementara(record);
    }
    
    // Build query parameters for filtering
    const queryParams = new URLSearchParams();
    if (record.periode) {
      queryParams.set('periode', record.periode.toString());
    }
    if (record.tahun) {
      queryParams.set('tahun', record.tahun.toString());
    }
    
    const queryString = queryParams.toString();
    const url = `/dashboard/admin/manajemen/laporan/lab-lainnya/ViewLaporan${queryString ? `?${queryString}` : ''}`;
    
    router.push(url);
  }, [laporanLabStore, router]);

  const getData = useCallback(async () => {
    if (globalStore.setLoading) globalStore.setLoading(true);
    try {
      // Fetch all healthcare facilities first
      const allFacilitiesResponse = await api.post("/user/puskesmas-rumahsakit/data");
      const allFacilities = allFacilitiesResponse.data.data.values || [];
    
      // Fetch lab reports data using the correct API
      const params: any = {};
      if (form.nama_user && form.nama_user.trim()) {
        // Note: The backend API might need to be updated to support nama_user filtering
        // For now, we'll fetch all data and filter on frontend
      }
      
      const responsenya = await getLaporanLabData(params);
      
      // Handle lab report response structure
      let rawData = [];
      if (responsenya && responsenya.data && responsenya.data.data && Array.isArray(responsenya.data.data)) {
        rawData = responsenya.data.data;
      } else if (responsenya && responsenya.data && Array.isArray(responsenya.data)) {
        rawData = responsenya.data;
      } else if (responsenya && Array.isArray(responsenya)) {
        rawData = responsenya;
      } else {
        rawData = [];
      }
       
       // Filter by nama_user if provided (frontend filtering)
       if (form.nama_user && form.nama_user.trim()) {
         const searchTerm = form.nama_user.trim().toLowerCase();
         const originalCount = rawData.length;
         rawData = rawData.filter((item: any) => {
           const facilityName = item.user?.nama_user || item.nama_user || '';
           const matches = facilityName.toLowerCase().includes(searchTerm);
           return matches;
         });
       }
       
       // Create a map of facilities that have reported
       const reportedFacilities = new Set();
       const reportsByFacility: { [key: string]: any[] } = {};
       const yearsInData = new Set<string>();
       
       rawData.forEach((item: any) => {
         const facilityName = item.user?.nama_user || item.nama_user || 'Unknown';
         reportedFacilities.add(facilityName);
         
         // Extract year from lab data
         let year: string;
         if (item.tahun) {
           year = item.tahun.toString();
         } else {
           const dateField = item.created_at || item.updated_at;
           if (dateField) {
             year = new Date(dateField).getFullYear().toString();
           } else {
             year = new Date().getFullYear().toString(); // Use current year as fallback
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
         yearsArray.push(new Date().getFullYear().toString()); // Use current year if no data
       }
       
       // Filter facilities based on nama_user filter if provided
       let filteredFacilities = allFacilities;
       if (form.nama_user && form.nama_user.trim()) {
         const searchTerm = form.nama_user.trim().toLowerCase();
         const originalFacilityCount = filteredFacilities.length;
         filteredFacilities = allFacilities.filter((facility: any) => 
           facility.nama_user && facility.nama_user.toLowerCase().includes(searchTerm)
         );
       }
       
       let placeholderCount = 0;
       filteredFacilities.forEach((facility: any) => {
         const facilityName = facility.nama_user;
         
         yearsArray.forEach(year => {
           // Check if this facility has reported for this specific year
           const hasReportedForYear = rawData.some((item: any) => {
             const itemFacilityName = item.user?.nama_user || item.nama_user || 'Unknown';
             let itemYear: string;
             if (item.tahun) {
               itemYear = item.tahun.toString();
             } else {
               const dateField = item.created_at || item.updated_at;
               if (dateField) {
                 itemYear = new Date(dateField).getFullYear().toString();
               } else {
                 itemYear = new Date().getFullYear().toString(); // Use current year as fallback
               }
             }
             return itemFacilityName === facilityName && itemYear === year;
           });
           
           if (!hasReportedForYear) {
             placeholderCount++;
             enhancedData.push({
               key: `placeholder-${facilityName}-${year}`,
               id_laporan_lab: null,
               id_user: null,
               nama_user: facilityName,
               periode: 'Belum melapor',
               tahun: year,
               created_at: null,
               updated_at: null,
               status_laporan_lab: 'Belum Melapor',
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
         const beforeFilterCount = finalData.length;
         finalData = enhancedData.filter((item: any) => {
           const facilityName = item.nama_user || item.user?.nama_user || '';
           return facilityName.toLowerCase().includes(searchTerm);
         });
       }
       
       if (!Array.isArray(finalData) || finalData.length === 0) {
         setDataExport([]);
         setGroupedDataByYear({});
         return;
       }
       
       setDataExport(finalData);
    } catch (e) {
      setDataExport([]);
    } finally {
      if (globalStore.setLoading) globalStore.setLoading(false);
    }
  }, [form, api, getLaporanLabData]);



  // Effect to process data when dataExport changes
  useEffect(() => {
    if (processedData.processedGroupedData && Object.keys(processedData.processedGroupedData).length > 0) {
      setGroupedDataByYear(processedData.processedGroupedData);
      setAvailableYears(processedData.availableYears);
      
      // Reset expanded rows when data changes
      setExpandedRowKeys([]);
      
      // Reset pagination to first page when data changes
      setCurrentPage(1);
    } else {
      setGroupedDataByYear({});
    }
  }, [processedData]);

  // Separate effect to handle year switching to prevent infinite loops
  useEffect(() => {
    if (processedData.processedGroupedData && Object.keys(processedData.processedGroupedData).length > 0) {
      // Check if current year has data
      const currentYearHasData = processedData.processedGroupedData[currentYear];
      
      // If current year has no data and there are available years, switch to the first available year
      if (!currentYearHasData && processedData.availableYears.length > 0) {
        const firstAvailableYear = processedData.availableYears[0];
        if (firstAvailableYear !== currentYear) {
          setCurrentYear(firstAvailableYear);
        }
      }
    }
  }, [processedData.processedGroupedData, processedData.availableYears]);

  // Effect to fetch data on component mount
  useEffect(() => {
    getData();
  }, [getData]);

  return (
    <MainLayout title="Manajemen Laporan Lab Lainnya">
      <h2 style={{ textAlign: "center" }}>Manajemen Laporan Lab Lainnya</h2>
      
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

      {/* Dashboard Section */}
       {groupedDataByYear && groupedDataByYear[currentYear.toString()] && groupedDataByYear[currentYear.toString()].length > 0 && (
              <div style={{ marginBottom: '48px' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '12px',
                  padding: '24px',
                  marginBottom: '24px',
                  color: 'white',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '16px'
                  }}>
                    <h1 style={{ 
                      fontSize: '24px', 
                      fontWeight: 'bold', 
                      margin: '0',
                      color: 'white'
                    }}>
                      🎯 Dashboard Laporan Lab Lainnya {currentYear}
                    </h1>
                    
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
                  
                  {/* Summary Statistics */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                    gap: '16px',
                    marginBottom: '20px'
                  }}>
                    {(() => {
                      // Get all data for current year from the original grouped data
                      const currentYearGroupedData = groupedDataByYear[currentYear.toString()] || [];
                      const totalFacilities = currentYearGroupedData.filter(item => item.isGroup).length;
                      
                      // Count actual reports from all facility data stored in group headers
                      let totalReports = 0;
                      currentYearGroupedData.forEach(item => {
                        if (item.isGroup && item.facilityData) {
                          // Count valid reports from facilityData
                          totalReports += item.facilityData.filter(report => 
                            report && 
                            report.id_laporan_lab && // Check if it has a valid ID
                            !report.key?.toString().includes('placeholder') && // Exclude placeholder entries
                            !report.isPlaceholder // Exclude placeholder entries
                          ).length;
                        }
                      });
                      
                      return (
                        <>
                          <div style={{ 
                            backgroundColor: 'rgba(255,255,255,0.2)', 
                            padding: '16px', 
                            borderRadius: '8px',
                            textAlign: 'center'
                          }}>
                            <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>{totalFacilities}</div>
                            <div style={{ fontSize: '14px', opacity: 0.9 }}>Total Fasilitas</div>
                          </div>
                          <div style={{ 
                            backgroundColor: 'rgba(255,255,255,0.2)', 
                            padding: '16px', 
                            borderRadius: '8px',
                            textAlign: 'center'
                          }}>
                            <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>{totalReports}</div>
                            <div style={{ fontSize: '14px', opacity: 0.9 }}>Total Laporan</div>
                          </div>
                        </>
                      );
                    })()}
                  </div>

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

                {/* 2024 Table with Enhanced Features */}
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
                    📋 Detail Laporan Tahun {currentYear}
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
                      rowExpandable: (record) => record.isGroup,
                      childrenColumnName: 'children'
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
                        if (size !== pageSize) {
                          setPageSize(size);
                        }
                      }
                    }}
                    scroll={{ x: 1200 }}
                    rowClassName={(record) => {
                      if (record.isGroup) return 'group-row';
                      return 'detail-row';
                    }}
                  />
                </div>
              </div>
            )}



      <Modal
        title="Detail Laporan"
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

export default React.memo(ManajemenLaporanLimbahPadatPage);