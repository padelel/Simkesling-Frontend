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
import { MLaporanBulanan } from "@/models/MLaporanBulanan";
import { useLaporanBulananStore } from "@/stores/laporanBulananStore";
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
// import Search from "antd/es/input/Search";

interface DataType {
  namaTransporter: any;
  tanggalPelaporan: any;
  periode_nama: any;
  beratLimbahTotal: any;

  key: React.Key;
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
  const [data, setData] = useState<DataType[]>([]);
  const [dataSearch, setDataSearch] = useState<DataType[]>([]);
  const laporanBulananStore = useLaporanBulananStore();
  const globalStore = useGlobalStore();
  const router = useRouter();

  // Fungsi untuk mengurutkan bulan secara kronologis
  const getMonthOrder = (monthName: string): number => {
    const months = [
      'januari', 'februari', 'maret', 'april', 'mei', 'juni',
      'juli', 'agustus', 'september', 'oktober', 'november', 'desember'
    ];
    return months.indexOf(monthName.toLowerCase());
  };

  const sortPeriode = (a: any, b: any) => {
    const monthOrderA = getMonthOrder(a.periode_nama);
    const monthOrderB = getMonthOrder(b.periode_nama);
    
    // Jika bulan tidak ditemukan, letakkan di akhir
    if (monthOrderA === -1 && monthOrderB === -1) return 0;
    if (monthOrderA === -1) return 1;
    if (monthOrderB === -1) return -1;
    
    return monthOrderA - monthOrderB;
  };

  const columns: ColumnsType<DataType> = [
    {
      title: "Periode (Bulan)",
      dataIndex: "periode_nama",
      defaultSortOrder: "ascend",
      sorter: sortPeriode,
    },
    {
      title: "Tahun",
      dataIndex: "tahun",
      // defaultSortOrder: "descend",
      sorter: (a: any, b: any) => b.tahun - a.tahun,
    },
    {
      title: "Nama Transporter",
      dataIndex: "namaTransporter",
      // defaultSortOrder: "descend",
      // sorter: (a: any, b: any) => a.namaTransporter - b.namaTransporter,
    },
    {
      title: "Berat Limbah Total",
      dataIndex: "beratLimbahTotal",
      // defaultSortOrder: "descend",
      sorter: (a: any, b: any) =>
        parseFloat(b.beratLimbahTotal) - parseFloat(a.beratLimbahTotal),
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
      render: (_: any, record: MLaporanBulanan) => {
        // console.log(record);

        const toFormPage = (param: MLaporanBulanan) => {
          if (laporanBulananStore.simpenSementara) {
            laporanBulananStore.simpenSementara(param);
            router.push("/dashboard/user/limbah-padat/PageTambahLimbah?action=edit");
          }
        };
        const toViewPage = (param: MLaporanBulanan) => {
          if (laporanBulananStore.simpenSementara) {
            laporanBulananStore.simpenSementara(param);
            router.push("/dashboard/user/limbah-padat/PageViewLimbah?action=view");
          }
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
      const response = await api.post("/user/laporan-bulanan/data");
      const responseData = response.data.data.values;

      const transformedData = responseData.map((item: any) => ({
        ...item,
        periode_nama: item.periode_nama,
        tahun: item.tahun,
        namaTransporter: item.nama_transporter,
        beratLimbahTotal: item.berat_limbah_total,
        created_at: item.created_at,
        updated_at: item.updated_at,
        key: item.id_laporan_bulanan.toString(),
      }));

      setData(transformedData);
      setData2(transformedData);
      setDataSearch(transformedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      if (globalStore.setLoading) globalStore.setLoading(false);
    }
  };
  // const doSearch = async (e: any) => {
  //   // console.log(e.target.value);
  //   let tmpdata = dataSearch.filter((val) => {
  //     // console.log(val);
  //     return val.beratLimbahTotal.toString().includes(e.target.value);
  //   });
  //   console.log(tmpdata);
  //   setData(cloneDeep(tmpdata));
  // };

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
        val.namaTransporter
          .toString()
          .toLowerCase()
          .includes(search.toLowerCase()) ||
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
    <MainLayout title="Laporan Limbah B3">
      <Row justify="end">
        <Col span={6}>
          <Input
            onChange={handleChangeInput}
            value={search}
            style={{ boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)" }}
            name="search"
            placeholder="Cari Berdasrkan Nama Transporter"
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
          href="/dashboard/user/limbah-padat/PageTambahLimbah?action=create"
          passHref>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Button
              type="primary"
              size="large"
              icon={<PlusCircleOutlined />}
              style={{ boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)" }}>
              Tambah Laporan Limbah B3
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