import MainLayout from "@/components/MainLayout";
import { Button, Space, Modal, Tag, Row, Col, Input } from "antd";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Table } from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";
import api from "@/utils/HttpRequest";
import {
  LoginOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
  ExclamationCircleFilled,
  ReloadOutlined,
} from "@ant-design/icons";
import { MPengajuanTransporter } from "../../../../models/MPengajuanTransporter";
import { usePengajuanTransporterStore } from "@/stores/pengajuanTransporterStore";
import { useRouter } from "next/router";
import ModalValidasiTransporter from "@/components/admin/validasi/ModalValidasiTransporter";
import { parsingDate } from "@/utils/common";
import { useGlobalStore } from "@/stores/globalStore";

interface DataType {
  status: any;
  namaTransporter: any;
  namaPuskesmas: any;
  tanggalPengajuan: any;
  key: React.Key;
  name: string;
  age: number;
  address: string;
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
  const globalStore = useGlobalStore();
  const [data, setData] = useState<DataType[]>([]);
  const pengajuanTransporterStore = usePengajuanTransporterStore();
  const router = useRouter();

  const columns: ColumnsType<DataType> = [
    {
      title: "Nama Puskesmas / Rumah Sakit",
      dataIndex: "namaPuskesmas",
      defaultSortOrder: "ascend",
      sorter: (a: any, b: any) =>
        a.namaPuskesmas.length - b.namaPuskesmas.length,
    },
    {
      title: "Nama Transporter",
      dataIndex: "namaTransporter",
      // defaultSortOrder: "descend",
      sorter: (a: any, b: any) =>
        a.namaTransporter.length - b.namaTransporter.length,
    },
    {
      title: "Tanggal Pengajuan",
      dataIndex: "tanggalPengajuan",
      // defaultSortOrder: "descend",
      sorter: (a: any, b: any) =>
        a.tanggalPengajuan.toString().localeCompare(b.tanggalPengajuan),
    },
    {
      title: "Status Pengajuan",
      dataIndex: "status",
      sorter: (a: any, b: any) => a.status.toString().localeCompare(b.status),

      // specify the condition of filtering result
      // here is that finding the name started with `value`
      render: (status: any) => {
        let sts = "-- ups --";
        let color = "-";
        if (status == 1) {
          color = "geekblue";
          sts = "Menunggu";
        }
        if (status == 2) {
          color = "green";
          sts = "Diterima";
        }
        if (status == 0) {
          color = "volcano";
          sts = "Ditolak";
        }
        return (
          <>
            <Tag color={color}>{sts.toUpperCase()}</Tag>
          </>
        );
      },
    },
    {
      title: "Catatan",
      dataIndex: "catatan",
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: MPengajuanTransporter) => {
        // console.log(record);

        const toFormPage = (param: MPengajuanTransporter) => {
          if (pengajuanTransporterStore.simpenSementara) {
            pengajuanTransporterStore.simpenSementara(param);
            router.push(
              "/dashboard/admin/validasi/ValidasiTransporter?action=validasi"
            );
          }
        };
        return (
          <Space size="middle">
            <Button
              onClick={() => toFormPage(record)}
              icon={<EditOutlined />}
              style={{ backgroundColor: "yellow" }}>
              Validasi
            </Button>
          </Space>
        );
      },
    },
  ];

  const getData = async () => {
    if (globalStore.setLoading) globalStore.setLoading(true);
    try {
      const response = await api.post("/user/pengajuan-transporter/data");
      const responseData = response.data.data.values;
      console.log(responseData);

      const transformedData = responseData.map((item: any) => ({
        ...item,
        namaPuskesmas: item.user ? item.user.nama_user : "",
        namaTransporter: item.nama_transporter,
        tanggalPengajuan: parsingDate(item.created_at),
        status: item.status_transporter_tmp,
        catatan: item.catatan,
        key: item.id_transporter_tmp.toString(),
      }));

      setData(transformedData);
      setData2(transformedData);
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
    const tmpData = data2.filter((val) => {
      if (
        val.namaTransporter
          .toString()
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        val.namaPuskesmas
          .toString()
          .toLowerCase()
          .includes(search.toLowerCase())
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
    <MainLayout title="Validasi Transporter">
      <Row justify="end">
        <Col span={6}>
          <Input
            onChange={handleChangeInput}
            value={search}
            name="search"
            placeholder="Search RS/Puskesmass"
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
      <div style={{ marginTop: "20px" }}>
        <Table
          scroll={{ x: 800 }}
          columns={columns}
          dataSource={data}
          onChange={onChange}
        />
      </div>
    </MainLayout>
  );
};

export default Index;
