import MainLayout from "@/components/MainLayout";
import {
  Button,
  Space,
  Modal,
  Popconfirm,
  notification,
  Tag,
  Row,
  Col,
  Input,
} from "antd";
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
  PlusSquareTwoTone,
  ReloadOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { MPengajuanTransporter } from "../../../../models/MPengajuanTransporter";
import { usePengajuanTransporterStore } from "@/stores/pengajuanTransporterStore";
import { useRouter } from "next/router";
import { useGlobalStore } from "@/stores/globalStore";
import cloneDeep from "clone-deep";
import { url } from "inspector";
// import Search from "antd/es/input/Search"
import { parsingDate } from "@/utils/common";
import Search from "antd/es/input/Search";

type NotificationType = "success" | "info" | "warning" | "error";

interface DataType {
  status: any;
  namaTransporter: any;
  tanggalPengajuan: any;
  key: React.Key;
  name: string;
  age: number;
  address: string;
}

const onChange: TableProps<DataType>["onChange"] = (
  pagination: any,
  filters: any,
  sorter: any,
  extra: any
) => {
  console.log("params", pagination, filters, sorter, extra);
};

const Index: React.FC = () => {
  const [apicontext, contextHolder] = notification.useNotification();
  const [dataSearch, setDataSearch] = useState<DataType[]>([]);
  const openNotificationWithIcon = (type: NotificationType) => {
    apicontext[type]({
      message: "Transporter Berhasil Dihapus",
      description: "Transporter Telah Berhasil Dihapus",
      duration: 3,
    });
  };

  let tmpForm = {
    oldid: "",
  };

  const [form, setForm] = useState({ oldid: 0 });
  const [data, setData] = useState<DataType[]>([]);
  const pengajuanTransporterStore = usePengajuanTransporterStore();
  const globalStore = useGlobalStore();
  const [modal1Open, setModal1Open] = useState(false);

  const router = useRouter();

  const { confirm } = Modal;
  // const handleViewClick = (idTransporter: string) => {
  //   // console.log("View clicked for id_transporter:", idTransporter);

  // };

  const handleDelete = async (idTransporter: string) => {
    try {
      let dataForm: any = new FormData();
      console.log(idTransporter);
      dataForm.append("oldid", idTransporter);
      let url = "/user/pengajuan-transporter/delete";
      let responsenya = await api.post(url, dataForm);
      openNotificationWithIcon("success");
    } catch (error) {
      console.error("Error hapus Data:", error);
    } finally {
      getData();
    }
  };

  const columns: ColumnsType<DataType> = [
    {
      title: "Nama Transporter",
      dataIndex: "namaTransporter",
      // defaultSortOrder: "ascend",
      sorter: (a: any, b: any) =>
        a.namaTransporter
          .toUpperCase()
          .localeCompare(b.namaTransporter.toUpperCase()),
    },
    {
      title: "Tanggal Pengajuan",
      dataIndex: "tanggalPengajuan",
      // defaultSortOrder: "descend",
      sorter: (a: any, b: any) =>
        b.tanggalPengajuan.localeCompare(a.tanggalPengajuan),
    },
    {
      title: "Status Pengajuan",
      dataIndex: "status",
      defaultSortOrder: "descend",
      // filterSearch: true,
      // onFilter: (value: boolean, record) => record.name.includes("1"),
      // filters: [
      //   {
      //     text: "Menunggu",
      //     value: "1",
      //   },
      //   {
      //     text: "Ditolak",
      //     value: "0",
      //   },
      //   {
      //     text: "Menunggu",
      //     value: "MENUNGGU",
      //   },
      //   {
      //     text: "Ditolak",
      //     value: "DITOLAK",
      //   },
      // ],

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
      // sorter: (a: any, b: any) => a.status.localeCompare(b.status),
    },
    {
      title: "Catatan",
      dataIndex: "catatan",
      defaultSortOrder: "ascend",
      // sorter: (a: any, b: any) => a.catatan.length - b.catatan.length,
    },

    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => {
        // console.log(record)

        const toFormPage = (param: MPengajuanTransporter) => {
          if (pengajuanTransporterStore.simpenSementara) {
            pengajuanTransporterStore.simpenSementara(param);
            router.push(
              "/dashboard/user/pengajuantransporter/PagePengajuanTransporter?action=edit"
            );
          }
        };
        const toViewPage = (param: MPengajuanTransporter) => {
          if (pengajuanTransporterStore.simpenSementara) {
            pengajuanTransporterStore.simpenSementara(param);
            router.push(
              "/dashboard/user/pengajuantransporter/view-pengajuan-transporter"
            );
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
            <Popconfirm
              title="Hapus Transporter"
              description="Apakah anda yakin untuk menghapus Transporter Anda?"
              onConfirm={() => {
                // setForm({ oldid: record.id_transporter_tmp }) // Set oldid when delete button is clicked
                handleDelete(record.id_transporter_tmp?.toString() ?? "");
              }}>
              <Button icon={<DeleteOutlined />} type="primary" danger>
                Delete
              </Button>
            </Popconfirm>
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

      const transformedData = responseData.map((item: any) => ({
        ...item,
        namaTransporter: item.nama_transporter,
        tanggalPengajuan: parsingDate(item.created_at),
        status: item.status_transporter_tmp,
        catatan: item.catatan,
        key: item.id_transporter_tmp.toString(),
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
  //   const searchTerm = e.target.value.toLowerCase(); // Konversi ke huruf kecil

  //   let tmpdata = dataSearch.filter((val) => {
  //     const namaTransporterLowerCase = val.namaTransporter
  //       .toString()
  //       .toLowerCase(); // Konversi ke huruf kecil
  //     return namaTransporterLowerCase.includes(searchTerm);
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
        val.status.toString().toLowerCase().includes(search.toLowerCase())
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
    <MainLayout title="Pengajuan Transporter">
      <Row justify="end">
        <Col span={6}>
          <Input
            onChange={handleChangeInput}
            value={search}
            name="search"
            placeholder="Search"
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
          href="/dashboard/user/pengajuantransporter/PagePengajuanTransporter"
          passHref>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 20,
            }}>
            <Button
              type="primary"
              size="large"
              icon={<PlusCircleOutlined />}
              style={{ boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)" }}>
              Tambah Transporter
            </Button>
          </div>
        </Link>
      </div>

      <div
        style={{
          overflowX: "auto",
        }}>
        {/* <Search
          style={{
            width: 300,
            marginBottom: 20,
          }}
          placeholder="Cari Nama Transporter"
          onChange={(e) => doSearch(e)}
        /> */}
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
