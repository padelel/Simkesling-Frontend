import MainLayout from "@/components/MainLayout";
import { Button, Space, Modal, Tag, Row, Col, Input, Select } from "antd";
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
} from "@ant-design/icons";
import { MPengajuanTransporter } from "../../../../../models/MPengajuanTransporter";
import { usePengajuanTransporterStore } from "@/stores/pengajuanTransporterStore";
import { useRouter } from "next/router";
import { parsingDate } from "@/utils/common";
import cloneDeep from "clone-deep";
import { CSVLink } from "react-csv";

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

// Add CSS for group rows
const groupRowStyles = `
  .group-row {
    background-color: #f5f5f5 !important;
    font-weight: bold;
  }
  .group-row:hover {
    background-color: #e6f7ff !important;
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

const onChange: TableProps<DataType>["onChange"] = (
  pagination: any,
  filters: any,
  sorter: any,
  extra: any
) => {
  console.log("params", pagination, filters, sorter, extra);
};

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

  const pengajuanTransporterStore = usePengajuanTransporterStore();
  const router = useRouter();

  const columns: ColumnsType<DataType> = [
    {
      title: "Transporter",
      dataIndex: "namaTransporter",
      defaultSortOrder: "descend",
      sorter: (a: any, b: any) =>
        b.namaTransporter.length - a.namaTransporter.length,
    },
    {
      title: "Nama Puskesmas/RS",
      dataIndex: "namaTempat",
      // defaultSortOrder: "descend",
      sorter: (a: any, b: any) => a.namaTempat.length - b.namaTempat.length,
    },

    {
      title: "Sisa Masa Berlaku MOU",
      dataIndex: "masaBerlakuBerakhir",
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
          <Tag color={color}>{timeRemaining}</Tag>
        );
      },
    },
    {
      title: "Status MOU",
      dataIndex: "statusBerlaku",
      // defaultSortOrder: "descend",
      sorter: (a: any, b: any) =>
        (a.masa_berlaku_sudah_berakhir || '')
          .toString()
          .localeCompare((b.masa_berlaku_sudah_berakhir || '').toString()),
      render: (status: any) => {
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
          <>
            <Tag color={color}>{sts.toUpperCase()}</Tag>
          </>
        );
      },
    },
    {
      title: "Created at",
      dataIndex: "created_at",
      // defaultSortOrder: "descend",
      sorter: (a: any, b: any) => a.created_at.localeCompare(b.created_at),
      render: (_: any, record: any) => {
        if (record.isGroup) return '';
        return parsingDate(record.created_at);
      },
    },
    {
      title: "Updated at",
      dataIndex: "updated_at",
      // defaultSortOrder: "descend",
      sorter: (a: any, b: any) => a.updated_at.localeCompare(b.updated_at),
      render: (_: any, record: any) => {
        if (record.isGroup) return '';
        return parsingDate(record.updated_at);
      },
    },

    {
      title: "Action",
      key: "action",
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
          <Space size="middle">
            {/* <Button
              onClick={() => toFormPage(record)}
              icon={<EditOutlined />}
              style={{ backgroundColor: "yellow" }}
            >
              Edit
            </Button> */}
            <Button
              onClick={() => toViewPage(record)}
              icon={<EyeOutlined />}
              type="primary">
              View
            </Button>
            {/* <Button
              onClick={showDeleteConfirm}
              icon={<DeleteOutlined />}
              type="primary"
              danger
            >
              Delete
            </Button> */}
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
        namaTempat: `${item.user.nama_user} (${item.user.tipe_tempat})`,
        status: item.status_transporter,
        tanggalBerakhir: item.tgl_akhir,
        statusBerlaku: item.masa_berlaku_sudah_berakhir,
        masaBerlakuBerakhir: item.masa_berlaku_terakhir,
        created_at: item.created_at,
        updated_at: item.updated_at,
        key: item.id_transporter_tmp.toString(),
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
    getData();
  }, []);

  return (
    <MainLayout title="Manajemen Transporter">
      <Row justify="end" gutter={[16, 16]}>
        <Col>
          <CSVLink
            style={{ marginRight: 15 }}
            data={data}
            asyncOnClick={true}
            filename={`Laporan Limbah - ${new Date().toISOString()}.csv`}
            onClick={async (event: any, done: () => void) => {
              await handleGenerateCsv();
              done();
            }}>
            <Button>Export Excel</Button>
          </CSVLink>
        </Col>

        <Col span={6}>
          <Input
            onChange={handleChangeInput}
            value={search}
            name="search"
            placeholder="Search RS/Puskesmas"
          />
        </Col>
        <Col>
          <Button
            icon={<ReloadOutlined />}
            style={{ marginLeft: 15, backgroundColor: "orange" }}
            onClick={getData}>
            Reload
          </Button>
        </Col>
      </Row>

      {/* <div style={{ display: "flex", justifyContent: "center" }}>
        <Link
          href="/dashboard/admin/manajemen/transporter/PengajuanTransporter"
          passHref
        >
          <Button type="primary">Tambah Transporter</Button>
        </Link>
      </div> */}

      <div style={{ marginTop: "20px" }}>
        <Table
          scroll={{ x: 800 }}
          columns={columns}
          dataSource={data}
          expandable={{
            childrenColumnName: 'children',
            defaultExpandAllRows: false,
            rowExpandable: (record) => !!(record.children && record.children.length > 0),
          }}
          rowClassName={(record) => record.isGroup ? 'group-row' : ''}
          onChange={onChange}
        />
      </div>
    </MainLayout>
  );
};

export default Index;
