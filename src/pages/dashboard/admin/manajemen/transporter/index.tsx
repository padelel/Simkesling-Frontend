import MainLayout from "@/components/MainLayout";
import { Button, Space, Modal, Tag, Row, Col, Input, Select, Card, Typography, Divider } from "antd";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Table } from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";
import api from "@/utils/HttpRequest";
import { useGlobalStore } from "@/stores/globalStore";
import {
  LoginOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  ExclamationCircleFilled,
  ReloadOutlined,
  SearchOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { MPengajuanTransporter } from "../../../../../models/MPengajuanTransporter";
import { usePengajuanTransporterStore } from "@/stores/pengajuanTransporterStore";
import { useRouter } from "next/router";
import { parsingDate } from "@/utils/common";
import cloneDeep from "clone-deep";
import { CSVLink } from "react-csv";

const { Title, Text } = Typography;

// Function to calculate time remaining with adaptive format
const calculateTimeRemaining = (endDate: string) => {
  if (!endDate) return "N/A";
  
  const now = new Date();
  const end = new Date(endDate);
  const diffTime = end.getTime() - now.getTime();
  
  if (diffTime <= 0) {
    return "Expired";
  }
  
  // Calculate all time units
  const years = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
  const months = Math.floor((diffTime % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
  const days = Math.floor((diffTime % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diffTime % (1000 * 60)) / 1000);
  
  // Adaptive format based on time remaining
  if (years >= 1) {
    // Show years and months for >= 1 year, but if months is 0, show years and days
    if (months > 0) {
      return `${years} tahun ${months} bulan`;
    } else {
      return `${years} tahun ${days} hari`;
    }
  } else if (months >= 1) {
    // Show months and days for >= 1 month but < 1 year
    return `${months} bulan ${days} hari`;
  } else if (days >= 1) {
    // Show days and hours for >= 1 day but < 1 month
    return `${days} hari ${hours} jam`;
  } else if (hours >= 1) {
    // Show hours and minutes for >= 1 hour but < 1 day
    return `${hours} jam ${minutes} menit`;
  } else {
    // Show minutes and seconds for < 1 hour
    return `${minutes} menit ${seconds} detik`;
  }
};

// Add CSS for group rows and improved styling
const groupRowStyles = `
  .group-row {
    background-color: #f8f9fa !important;
    font-weight: 600;
    border-left: 4px solid #1890ff;
  }
  .group-row:hover {
    background-color: #e6f7ff !important;
  }
  .ant-table-tbody > tr > td {
    padding: 12px 16px;
  }
  .ant-table-thead > tr > th {
    background-color: #fafafa;
    font-weight: 600;
    color: #262626;
  }
  .transporter-table .ant-table {
    border-radius: 8px;
    overflow: hidden;
  }
  .transporter-table .ant-table-container {
    border: 1px solid #f0f0f0;
    border-radius: 8px;
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = groupRowStyles;
  document.head.appendChild(styleElement);
}

interface DataType {
  status: any;
  namaTransporter: any;
  namaTempat: any;
  tanggalPengajuan: any;
  statusBerlaku: any;
  masaBerlakuBerakhir: any;
  created_at: any;
  updated_at: any;
  user: any;
  key: React.Key;
  name: string;
  age: number;
  address: string;
  isGroup?: boolean;
  children?: DataType[];
  [key: string]: any;
}

// const data = [
//   {
//     namaTransporter: {{nama_transporter}},
//     tanggalPengajuan: {{created_at}},
//     status: {{statusactive_transporter_tmp}},
//   },
//   {
//     namaTransporter: {{nama_transporter}},
//     tanggalPengajuan: {{created_at}},
//     status: {{statusactive_transporter_tmp}},
//   },

// ];

const { confirm } = Modal;

const showDeleteConfirm = () => {
  confirm({
    title: "Are you sure delete this task?",
    icon: <ExclamationCircleFilled />,
    content: "Some descriptions",
    okText: "Yes",
    okType: "danger",
    cancelText: "No",
    onOk() {
      console.log("OK");
    },
    onCancel() {
      console.log("Cancel");
    },
  });
};

const Index: React.FC = () => {
  const [datacsv, setDatacsv] = useState<any[]>([]);
  const globalStore = useGlobalStore();
  const [data, setData] = useState<DataType[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  
  // Filter states
  const [selectedStatusMOU, setSelectedStatusMOU] = useState<string[]>([]);
  const [selectedSisaMasaBerlaku, setSelectedSisaMasaBerlaku] = useState<string[]>([]);
  const [selectedPuskesmas, setSelectedPuskesmas] = useState<string[]>([]);
  const [selectedRumahSakit, setSelectedRumahSakit] = useState<string[]>([]);
  
  // Filter options
  const [statusMOUOptions, setStatusMOUOptions] = useState<{label: string, value: string}[]>([]);
  const [sisaMasaBerlakuOptions, setSisaMasaBerlakuOptions] = useState<{label: string, value: string}[]>([]);
  const [puskesmasOptions, setPuskesmasOptions] = useState<{label: string, value: string}[]>([]);
  const [rumahSakitOptions, setRumahSakitOptions] = useState<{label: string, value: string}[]>([]);

  const pengajuanTransporterStore = usePengajuanTransporterStore();
  const router = useRouter();

  const onChange: TableProps<DataType>["onChange"] = (
    pagination: any,
    filters: any,
    sorter: any,
    extra: any
  ) => {
    console.log("params", pagination, filters, sorter, extra);
    
    if (pagination) {
      setCurrentPage(pagination.current || 1);
      if (pagination.pageSize && pagination.pageSize !== pageSize) {
        setPageSize(pagination.pageSize);
        setCurrentPage(1); // Reset to first page when page size changes
      }
    }
  };

  const columns: ColumnsType<DataType> = [
    {
      title: "Transporter",
      dataIndex: "namaTransporter",
      defaultSortOrder: "descend",
      sorter: (a: any, b: any) =>
        b.namaTransporter.length - a.namaTransporter.length,
      width: 200,
      render: (text: string, record: any) => {
        if (record.isGroup) {
          return <Text strong style={{ color: '#1890ff' }}>{text}</Text>;
        }
        return <Text>{text}</Text>;
      },
    },
    {
      title: "Nama Puskesmas/RS",
      dataIndex: "namaTempat",
      sorter: (a: any, b: any) => a.namaTempat.length - b.namaTempat.length,
      width: 250,
      render: (text: string, record: any) => {
        if (record.isGroup) {
          return <Text strong style={{ color: '#262626' }}>{text}</Text>;
        }
        return <Text>{text}</Text>;
      },
    },
    {
      title: "Sisa Masa Berlaku MOU",
      dataIndex: "masaBerlakuBerakhir",
      width: 200,
      render: (_: any, record: any) => {
        if (record.isGroup) return '';
        const timeRemaining = calculateTimeRemaining(record.masaBerlakuBerakhir);
        let color = "green";
        
        if (timeRemaining === "Expired") {
          color = "red";
        } else if (timeRemaining.includes("hari") && !timeRemaining.includes("bulan") && !timeRemaining.includes("tahun")) {
          const days = parseInt(timeRemaining.split(" ")[0]);
          if (days <= 30) {
            color = "orange";
          }
        }
        
        return (
          <Tag color={color} style={{ borderRadius: '6px', padding: '4px 8px' }}>
            {timeRemaining}
          </Tag>
        );
      },
    },
    {
      title: "Status MOU",
      dataIndex: "statusBerlaku",
      width: 150,
      sorter: (a: any, b: any) =>
        (a.masa_berlaku_sudah_berakhir || '')
          .toString()
          .localeCompare((b.masa_berlaku_sudah_berakhir || '').toString()),
      render: (status: any, record: any) => {
        if (record.isGroup) return '';
        
        let sts = "-- ups --";
        let color = "-";
        if (status == "harih") {
          color = "volcano";
          sts = "Kadaluarsa";
        }
        if (status == "1bulan") {
          color = "orange";
          sts = "Segera Expire";
        }
        if (status == "belum") {
          color = "green";
          sts = "Berlaku";
        }

        return (
          <Tag color={color} style={{ borderRadius: '6px', padding: '4px 8px' }}>
            {sts.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Created at",
      dataIndex: "created_at",
      width: 150,
      sorter: (a: any, b: any) => a.created_at.localeCompare(b.created_at),
      render: (_: any, record: any) => {
        if (record.isGroup) return '';
        return <Text type="secondary">{parsingDate(record.created_at)}</Text>;
      },
    },
    {
      title: "Updated at",
      dataIndex: "updated_at",
      width: 150,
      sorter: (a: any, b: any) => a.updated_at.localeCompare(b.updated_at),
      render: (_: any, record: any) => {
        if (record.isGroup) return '';
        return <Text type="secondary">{parsingDate(record.updated_at)}</Text>;
      },
    },
    {
      title: "Action",
      key: "action",
      width: 120,
      fixed: 'right',
      render: (_: any, record: DataType) => {
        // Don't show actions for group rows
        if (record.isGroup) {
          return null;
        }

        const toFormPage = (param: DataType) => {
          if (pengajuanTransporterStore.simpenSementara) {
            pengajuanTransporterStore.simpenSementara(param as any);
            router.push(
              "/dashboard/admin/manajemen/transporter/PengajuanTransporter?action=edit"
            );
          }
        };
        const toViewPage = (param: DataType) => {
          if (pengajuanTransporterStore.simpenSementara) {
            pengajuanTransporterStore.simpenSementara(param as any);
            router.push(
              "/dashboard/admin/manajemen/transporter/ViewPengajuanTransporter"
            );
          }
        };
        return (
          <Space size="small">
            <Button
              onClick={() => toViewPage(record)}
              icon={<EyeOutlined />}
              type="primary"
              size="small"
              style={{ borderRadius: '6px' }}>
              View
            </Button>
          </Space>
        );
      },
    },
  ];

  const getData = async () => {
    if (globalStore.setLoading) globalStore.setLoading(true);
    try {
      const response = await api.post("/user/transporter/data");
      const responseData = response.data.data.values;

      const transformedData = responseData.map((item: any) => ({
        ...item,
        namaTransporter: item.nama_transporter,
        namaTempat: item.user && item.user.nama_user 
          ? `${item.user.nama_user} (${item.user.tipe_tempat || 'N/A'})` 
          : item.user && item.user.nama_tempat
          ? `${item.user.nama_tempat} (${item.user.tipe_tempat || 'N/A'})`
          : 'Data User Tidak Tersedia',
        status: item.status_transporter,
        tanggalBerakhir: item.tgl_akhir,
        statusBerlaku: item.masa_berlaku_sudah_berakhir,
        masaBerlakuBerakhir: item.masa_berlaku_terakhir,
        created_at: item.created_at,
        updated_at: item.updated_at,
        key: item.id_transporter_tmp ? item.id_transporter_tmp.toString() : item.id_transporter?.toString() || Math.random().toString(),
      }));

      // Group data by hospital/puskesmas (namaTempat)
      const groupedData = transformedData.reduce((acc: any, item: any) => {
        const tempat = item.namaTempat;
        if (!acc[tempat]) {
          acc[tempat] = {
            key: `group-${tempat}`,
            namaTransporter: `${0} Transporter`,
            namaTempat: tempat,
            masaBerlakuBerakhir: '',
            statusBerlaku: '',
            created_at: '',
            updated_at: '',
            isGroup: true,
            children: []
          };
        }
        acc[tempat].children.push({
          ...item,
          key: `${tempat}-${item.key}`
        });
        acc[tempat].namaTransporter = `${acc[tempat].children.length} Transporter`;
        return acc;
      }, {});

      const groupedArray = Object.values(groupedData) as DataType[];

      setData(groupedArray);
      setData2(groupedArray);
      
      // Reset pagination when data is loaded
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      if (globalStore.setLoading) globalStore.setLoading(false);
    }
  };

  // -- search -- \\
  const [search, setSearch] = useState("");
  const [data2, setData2] = useState<DataType[]>([]);
  const handleChangeInput = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    console.log(event);
    setSearch(event.target.value);
  };
  const doSearch = () => {
    let filteredData = [...data2];

    // Filter grouped data
    const processedData = filteredData.map((group: DataType) => {
      if (!group.isGroup || !group.children) {
        return group;
      }

      let filteredChildren = group.children;

      // Filter by search text
      if (search) {
        filteredChildren = filteredChildren.filter((item: DataType) =>
          item.namaTransporter?.toLowerCase().includes(search.toLowerCase()) ||
          item.namaTempat?.toLowerCase().includes(search.toLowerCase()) ||
          item.status?.toString().toLowerCase().includes(search.toLowerCase())
        );
      }

      // Filter by Status MOU
      if (selectedStatusMOU.length > 0) {
        filteredChildren = filteredChildren.filter((item: DataType) =>
          selectedStatusMOU.includes(item.statusBerlaku?.toString() || '')
        );
      }

      // Filter by Sisa Masa Berlaku
      if (selectedSisaMasaBerlaku.length > 0) {
        filteredChildren = filteredChildren.filter((item: DataType) => {
          const timeRemaining = calculateTimeRemaining(item.masaBerlakuBerakhir);
          return selectedSisaMasaBerlaku.some(filter => {
            switch (filter) {
              case 'expired':
                return timeRemaining === 'Expired';
              case 'less_than_30_days':
                return timeRemaining.includes('hari') && !timeRemaining.includes('bulan') && !timeRemaining.includes('tahun');
              case 'less_than_6_months':
                return timeRemaining.includes('bulan') && !timeRemaining.includes('tahun');
              case 'more_than_6_months':
                return timeRemaining.includes('tahun') || (timeRemaining.includes('bulan') && parseInt(timeRemaining) >= 6);
              default:
                return false;
            }
          });
        });
      }

      // Filter by Puskesmas
      if (selectedPuskesmas.length > 0) {
        filteredChildren = filteredChildren.filter((item: DataType) =>
          selectedPuskesmas.some(puskesmas => 
            item.namaTempat?.toLowerCase().includes(puskesmas.toLowerCase()) &&
            item.namaTempat?.toLowerCase().includes('puskesmas')
          )
        );
      }

      // Filter by Rumah Sakit
      if (selectedRumahSakit.length > 0) {
        filteredChildren = filteredChildren.filter((item: DataType) =>
          selectedRumahSakit.some(rs => 
            item.namaTempat?.toLowerCase().includes(rs.toLowerCase()) &&
            (item.namaTempat?.toLowerCase().includes('rumah sakit') || 
             item.namaTempat?.toLowerCase().includes('rs '))
          )
        );
      }

      // Return group with filtered children, update count
      if (filteredChildren.length > 0) {
        return {
          ...group,
          children: filteredChildren,
          namaTransporter: `${filteredChildren.length} Transporter`
        };
      }
      return null;
    }).filter((item): item is DataType => item !== null); // Remove null groups with type guard

    setData(processedData);
    
    // Reset pagination when search is performed
    setCurrentPage(1);
  };

  // Function to populate filter options from data
  const populateFilterOptions = () => {
    if (data2.length === 0) return;

    const statusMOUSet = new Set<string>();
    const puskesmasSet = new Set<string>();
    const rumahSakitSet = new Set<string>();

    data2.forEach((group: DataType) => {
      if (group.isGroup && group.children) {
        group.children.forEach((item: DataType) => {
          // Collect Status MOU
          if (item.statusBerlaku) {
            statusMOUSet.add(item.statusBerlaku.toString());
          }

          // Collect Puskesmas and Rumah Sakit
          if (item.namaTempat) {
            const namaTempat = item.namaTempat.toLowerCase();
            if (namaTempat.includes('puskesmas')) {
              const name = item.namaTempat.split('(')[0].trim();
              puskesmasSet.add(name);
            } else if (namaTempat.includes('rumah sakit') || namaTempat.includes('rs ')) {
              const name = item.namaTempat.split('(')[0].trim();
              rumahSakitSet.add(name);
            }
          }
        });
      }
    });

    // Set Status MOU options with proper mapping
    const statusMOUMapping = [
      { label: 'Berlaku', value: 'belum' },
      { label: 'Segera Expire', value: '1bulan' },
      { label: 'Kadaluarsa', value: 'harih' }
    ];

    // Filter only existing statuses from data
    const availableStatuses = statusMOUMapping.filter(status => 
      statusMOUSet.has(status.value)
    );

    // Add any unknown statuses that might exist in data
    Array.from(statusMOUSet).forEach(status => {
      if (!statusMOUMapping.some(mapping => mapping.value === status)) {
        availableStatuses.push({
          label: status,
          value: status
        });
      }
    });

    setStatusMOUOptions(availableStatuses);

    // Set Sisa Masa Berlaku options (predefined categories)
    setSisaMasaBerlakuOptions([
      { label: 'Expired', value: 'expired' },
      { label: 'Kurang dari 30 hari', value: 'less_than_30_days' },
      { label: 'Kurang dari 6 bulan', value: 'less_than_6_months' },
      { label: 'Lebih dari 6 bulan', value: 'more_than_6_months' }
    ]);

    // Set Puskesmas options
    setPuskesmasOptions(Array.from(puskesmasSet).map(name => ({
      label: name,
      value: name
    })));

    // Set Rumah Sakit options
    setRumahSakitOptions(Array.from(rumahSakitSet).map(name => ({
      label: name,
      value: name
    })));
  };

  // Function to reset all filters
  const resetFilters = () => {
    setSelectedStatusMOU([]);
    setSelectedSisaMasaBerlaku([]);
    setSelectedPuskesmas([]);
    setSelectedRumahSakit([]);
    setSearch('');
    setCurrentPage(1);
  };

  const handleGenerateCsv = () => {
    let dataCsv = data.map((v) => {
      let val = cloneDeep(v);
      let user = cloneDeep(val.user);
      for (let key in user) {
        if (!val.hasOwnProperty(key)) {
          val[key] = user[key];
        }
      }
      return val;
    });
    setDatacsv(dataCsv);
    console.log(dataCsv);
  };

  useEffect(() => {
    doSearch();
  }, [search]);

  useEffect(() => {
    doSearch();
  }, [selectedStatusMOU, selectedSisaMasaBerlaku, selectedPuskesmas, selectedRumahSakit]);

  useEffect(() => {
    populateFilterOptions();
  }, [data2]);

  useEffect(() => {
    getData();
  }, []);

  return (
    <MainLayout title="Manajemen Transporter">
      <div style={{ padding: '0 24px' }}>
        {/* Header Section */}
        <Card 
          style={{ 
            marginBottom: 24, 
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}
        >
          <Row align="middle" justify="space-between" gutter={[16, 16]}>
            <Col>
              <Title level={4} style={{ margin: 0, color: '#262626' }}>
                Data Transporter
              </Title>
              <Text type="secondary">
                Kelola data transporter dan status MOU
              </Text>
            </Col>
          </Row>
          
          <Divider style={{ margin: '16px 0' }} />
          
          {/* Controls Section */}
          <Row justify="space-between" align="middle" gutter={[16, 16]}>
            <Col flex="auto">
              <Row gutter={[12, 12]} align="middle">
                <Col>
                  <Text strong style={{ color: '#595959' }}>Filter & Pencarian:</Text>
                </Col>
                <Col flex="1" style={{ maxWidth: 300 }}>
                  <Input
                    onChange={handleChangeInput}
                    value={search}
                    name="search"
                    placeholder="Cari RS/Puskesmas atau Transporter..."
                    prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                    style={{ borderRadius: 8 }}
                    allowClear
                  />
                </Col>
              </Row>
              
              {/* Multi Select Filters */}
              <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
                <Col xs={24} sm={12} md={6}>
                  <Text strong style={{ color: '#595959', fontSize: 12 }}>Status MOU:</Text>
                  <Select
                    mode="multiple"
                    placeholder="Pilih Status MOU"
                    value={selectedStatusMOU}
                    onChange={setSelectedStatusMOU}
                    options={statusMOUOptions}
                    style={{ width: '100%', marginTop: 4 }}
                    size="small"
                    allowClear
                  />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Text strong style={{ color: '#595959', fontSize: 12 }}>Sisa Masa Berlaku:</Text>
                  <Select
                    mode="multiple"
                    placeholder="Pilih Sisa Masa Berlaku"
                    value={selectedSisaMasaBerlaku}
                    onChange={setSelectedSisaMasaBerlaku}
                    options={sisaMasaBerlakuOptions}
                    style={{ width: '100%', marginTop: 4 }}
                    size="small"
                    allowClear
                  />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Text strong style={{ color: '#595959', fontSize: 12 }}>Puskesmas:</Text>
                  <Select
                    mode="multiple"
                    placeholder="Pilih Puskesmas"
                    value={selectedPuskesmas}
                    onChange={setSelectedPuskesmas}
                    options={puskesmasOptions}
                    style={{ width: '100%', marginTop: 4 }}
                    size="small"
                    allowClear
                  />
                </Col>
                <Col xs={24} sm={12} md={6}>
                  <Text strong style={{ color: '#595959', fontSize: 12 }}>Rumah Sakit:</Text>
                  <Select
                    mode="multiple"
                    placeholder="Pilih Rumah Sakit"
                    value={selectedRumahSakit}
                    onChange={setSelectedRumahSakit}
                    options={rumahSakitOptions}
                    style={{ width: '100%', marginTop: 4 }}
                    size="small"
                    allowClear
                  />
                </Col>
              </Row>
              
              {/* Reset Filter Button */}
              <Row style={{ marginTop: 12 }}>
                <Col>
                  <Button 
                    onClick={resetFilters}
                    size="small"
                    style={{ 
                      borderRadius: 6,
                      borderColor: '#ff4d4f',
                      color: '#ff4d4f'
                    }}
                    ghost
                  >
                    Reset Filter
                  </Button>
                </Col>
              </Row>
            </Col>
            
            <Col>
              <Space size="middle">
                <CSVLink
                  data={data}
                  asyncOnClick={true}
                  filename={`Laporan Transporter - ${new Date().toISOString().split('T')[0]}.csv`}
                  onClick={async (event: any, done: () => void) => {
                    await handleGenerateCsv();
                    done();
                  }}
                  style={{ textDecoration: 'none' }}
                >
                  <Button 
                    icon={<DownloadOutlined />}
                    style={{ 
                      borderRadius: 8,
                      borderColor: '#52c41a',
                      color: '#52c41a'
                    }}
                    ghost
                  >
                    Export Excel
                  </Button>
                </CSVLink>
                
                <Button
                  icon={<ReloadOutlined />}
                  onClick={getData}
                  style={{ 
                    borderRadius: 8,
                    backgroundColor: '#fa8c16',
                    borderColor: '#fa8c16',
                    color: 'white'
                  }}
                  loading={globalStore.loading}
                >
                  Reload Data
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Table Section */}
        <Card 
          style={{ 
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
          }}
          bodyStyle={{ padding: 0 }}
        >
          <div className="transporter-table">
            <Table
              scroll={{ x: 1200 }}
              columns={columns}
              dataSource={data}
              expandable={{
                childrenColumnName: 'children',
                defaultExpandAllRows: false,
                rowExpandable: (record) => !!(record.children && record.children.length > 0),
              }}
              rowClassName={(record) => record.isGroup ? 'group-row' : ''}
              onChange={onChange}
              pagination={{
                 current: currentPage,
                 pageSize: pageSize,
                 total: data.length,
                 showSizeChanger: true,
                 showQuickJumper: true,
                 showTotal: (total, range) => 
                   `Menampilkan ${range[0]}-${range[1]} dari ${total} data`,
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
                 }
               }}
              loading={globalStore.loading}
              locale={{
                emptyText: (
                  <div style={{ padding: '40px 0', textAlign: 'center' }}>
                    <Text type="secondary" style={{ fontSize: 16 }}>
                      {search ? 'Tidak ada data yang sesuai dengan pencarian' : 'Belum ada data transporter'}
                    </Text>
                  </div>
                )
              }}
            />
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Index;
