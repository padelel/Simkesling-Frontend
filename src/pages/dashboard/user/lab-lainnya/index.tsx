import MainLayout from "@/components/MainLayout";
import { Button, Space, Modal, Input, Row, Col } from "antd";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Table } from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";
import api from "../../../../utils/HttpRequest";
import {
  LoginOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  ExclamationCircleFilled,
  PlusCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { MPengajuanTransporter } from "../../../../models/MPengajuanTransporter";
import { usePengajuanTransporterStore } from "@/stores/pengajuanTransporterStore";
import { useRouter } from "next/router";
import { MLaporanLab } from "@/models/MLaporanLab";
import { useLaporanLabStore } from "@/stores/laporanLabStore";
import { useGlobalStore } from "@/stores/globalStore";
import cloneDeep from "clone-deep";
import { parsingDate } from "@/utils/common";

// Function to format date with day, month name, and time
const formatDateWithDayMonthYearTime = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const monthName = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${dayName}, ${day} ${monthName} ${year} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    return 'N/A';
  }
};

interface DataType {
  namaLab: any;
  tanggalPelaporan: any;
  periode_nama: any;
  totalPemeriksaan: any;

  key: React.Key;
}

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
  const [data, setData] = useState<DataType[]>([]);
  const [dataSearch, setDataSearch] = useState<DataType[]>([]);
  const laporanLabStore = useLaporanLabStore();
  const globalStore = useGlobalStore();
  const router = useRouter();

  const columns: ColumnsType<DataType> = [
    {
      title: "Periode (Bulan)",
      dataIndex: "periode_nama",
      // defaultSortOrder: "descend",
      // sorter: (a: any, b: any) => a.periode_nama - b.periode_nama,
    },
    {
      title: "Tahun",
      dataIndex: "tahun",
      // defaultSortOrder: "descend",
      sorter: (a: any, b: any) => b.tahun - a.tahun,
    },
    {
      title: "Tanggal Dibuat",
      dataIndex: "created_at",
      defaultSortOrder: "descend",
      sorter: (a: any, b: any) => b.created_at.localeCompare(a.created_at),
      render: (text: string) => formatDateWithDayMonthYearTime(text),
    },
    {
      title: "Tanggal Diubah",
      dataIndex: "updated_at",
      // defaultSortOrder: "descend",
      sorter: (a: any, b: any) => b.updated_at.localeCompare(a.updated_at),
      render: (text: string) => formatDateWithDayMonthYearTime(text),
    },

    {
      title: "Action",
      key: "action",
      render: (_: any, record: MLaporanLab) => {
        // console.log(record);

        const toFormPage = (param: MLaporanLab) => {
          if (laporanLabStore.simpenSementara) {
            laporanLabStore.simpenSementara(param);
            router.push("/dashboard/user/lab-lainnya/PageTambahLab?action=edit");
          }
        };
        const toViewPage = (param: MLaporanLab) => {
          // Navigate using ID parameter instead of store
          router.push(`/dashboard/user/lab-lainnya/PageViewLab?id=${param.id_laporan_lab}`);
        };
        return (
          <Space size="middle">
            <Button
              onClick={() => toFormPage(record)}
              icon={<EditOutlined />}
              style={{ backgroundColor: "yellow" }}>
              Edit
            </Button>
            <Button
              onClick={() => toViewPage(record)}
              icon={<EyeOutlined />}
              type="primary">
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
      const response = await api.post("/user/laporan-lab/data");
      const responseData = response.data.data;

      // Check if responseData exists and has data property
      if (!responseData || !responseData.data || !Array.isArray(responseData.data)) {
        console.warn("No data found or data is not an array:", responseData);
        setData([]);
        setData2([]);
        setDataSearch([]);
        return;
      }

      const transformedData = responseData.data.map((item: any) => ({
        ...item,
        periode_nama: item.periode_nama,
        tahun: item.tahun,
        created_at: item.created_at,
        updated_at: item.updated_at,
        key: item.id_laporan_lab.toString(),
      }));

      setData(transformedData);
      setData2(transformedData);
      setDataSearch(transformedData);
    } catch (error) {
      console.error("Error fetching data:", error);
      setData([]);
      setData2([]);
      setDataSearch([]);
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
    const tmpData = data2.filter((val) => {
      if (
        val.periode_nama.toString().toLowerCase().includes(search.toLowerCase())
      ) {
        return true;
      }
    });
    setData(tmpData);
  };

  useEffect(() => {
    doSearch();
  }, [search]);

  useEffect(() => {
    getData();
  }, []);

  return (
    <MainLayout title="Laporan Pemeriksaan Lab Lainnya">
      <Row justify="end">
        <Col span={6}>
          <Input
            onChange={handleChangeInput}
            value={search}
            style={{ boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)" }}
            name="search"
            placeholder="Cari Berdasarkan Periode"
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
      <div>
        <Link
          href="/dashboard/user/lab-lainnya/PageTambahLab?action=create"
          passHref>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Button
              type="primary"
              size="large"
              icon={<PlusCircleOutlined />}
              style={{ boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)" }}>
              Tambah Laporan Pemeriksaan Lab Lainnya
            </Button>
          </div>
        </Link>
      </div>

      <div
        style={{ marginTop: "20px", marginBottom: "20px", overflowX: "auto" }}>
        <Table
          scroll={{ x: 800 }} // Set a minimum width to trigger horizontal scrolling
          columns={columns}
          dataSource={data}
          onChange={onChange}
        />
      </div>
    </MainLayout>
  );
};

export default Index;