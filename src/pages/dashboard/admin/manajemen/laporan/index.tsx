import React, { useEffect, useState } from "react";
import MainLayout from "@/components/MainLayout";
import { Button, Space, Modal, Col, Row, Form, Select, Input } from "antd";
import { Table } from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";
import { Excel } from "antd-table-saveas-excel";
import api from "@/utils/HttpRequest";
import ModalView from "@/components/admin/laporan/ModalView";
import { useRouter } from "next/router";
import { CSVLink, CSVDownload } from "react-csv";
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
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = groupRowStyles;
  document.head.appendChild(styleElement);
}

// interface DataType {
//   idUser: any;
//   namaPemusnah: any;
//   metodePemusnahan: any;
//   ukuranPenyimpananTps: any;
//   ukuranPemusnahanSendiri: any;
//   beratLimbah: any;
//   limbahB3Covid: any;
//   limbahB3NonCovid: any;
//   debitLimbahCair: any;
//   kapasitasIpal: any;
//   memenuhiSyarat: any;
//   catatan: any;
//   periode: any;
//   namaTransporter: any;
//   tanggalPengajuan: any;
//   key: React.Key;
// }

// const data = [
//   {
//     key: "1",
//     nomorLaporan: "128673123",
//     tanggalPengangkutan: "17-08-2023",
//     namaTransporter: "John Brown",
//     beratLimbah: 30,
//     metodePemusnahan: "Pembakaran",
//   },
//   {
//     key: "2",
//     nomorLaporan: "128673129",
//     tanggalPengangkutan: "17-09-2023",
//     namaTransporter: "John Brown",
//     beratLimbah: 35,
//     metodePemusnahan: "Pembakaran",
//   },
//   {
//     key: "3",
//     nomorLaporan: "128673129",
//     tanggalPengangkutan: "17-08-2023",
//     namaTransporter: "Denis Brown",
//     beratLimbah: 40,
//     metodePemusnahan: "Pembakaran",
//   },
//   {
//     key: "4",
//     nomorLaporan: "128673123",
//     tanggalPengangkutan: "17-10-2023",
//     namaTransporter: "John Brown",
//     beratLimbah: 50,
//     metodePemusnahan: "Pembakaran",
//   },
// ];

interface DataType {
  statusBerlaku: any;
  status: any;
  namaTransporter: any;
  namaPemusnah: any;
  namaTempat: any;
  tanggalPengajuan: any;
  tanggalBerakhir: any;
  key: React.Key;
  name: string;
  age: number;
  address: string;
  isGroup?: boolean;
  isYearGroup?: boolean;
  children?: DataType[];
  [key: string]: any;
}

// const onChange: TableProps<DataType>["onChange"] = (
const onChange = (pagination: any, filters: any, sorter: any, extra: any) => {
  console.log("params", pagination, filters, sorter, extra);
};

const Index: React.FC = () => {
  const globalStore = useGlobalStore();
  const laporanBulananStore = useLaporanBulananStore();
  const [data, setData] = useState<any[]>([]);
  const [datacsv, setDatacsv] = useState<any[]>([]);
  const router = useRouter();
  const [formInstance] = Form.useForm();
  let tmpForm = {
    periode: "",
    tahun: "",
  };

  const [form, setForm] = useState(cloneDeep(tmpForm));

  const handleGenerateCsv = () => {
    // const excel = new Excel();
    // excel
    //   .addSheet("sheet 1")
    //   .addColumns(kolom)
    //   .addDataSource(data, {
    //     str2Percent: true,
    //   })
    //   .saveAs("Excel.xlsx");

    let dataCsv = data.map((v) => {
      let val = cloneDeep(v);
      let user = cloneDeep(val.user);
      for (let key in user) {
        if (!val.hasOwnProperty(key)) {
          val[key] = user[key];
        }
      }
      delete val["file_logbook"];
      delete val["file_manifest"];
      delete val["user"];
      return val;
    });
    setDatacsv(dataCsv);
    console.log(dataCsv);
  };

  const columns: any = [
    {
      title: "Nama Puskesmas / RS",
      dataIndex: "namaTempat",
      // defaultSortOrder: "descend",
      sorter: (a: any, b: any) =>
        a.namaTempat.toUpperCase().localeCompare(b.namaTempat.toUpperCase()),
    },
    {
      title: "Nama Transporter",
      dataIndex: "namaTransporter",
      // defaultSortOrder: "descend",
      sorter: (a: any, b: any) =>
        a.namaTransporter
          .toUpperCase()
          .localeCompare(b.namaTransporter.toUpperCase()),
    },

    {
      title: "Tahun",
      dataIndex: "tahun",
      // defaultSortOrder: "descend",
      sorter: (a: any, b: any) =>
        a.tahun.toUpperCase().localeCompare(b.tahun.toUpperCase()),
    },
    {
      title: "periode",
      dataIndex: "periode",
      // defaultSortOrder: "descend",
      sorter: (a: any, b: any) => {
        // Map month names to numbers for proper sorting
        const monthOrder: { [key: string]: number } = {
          'januari': 1, 'februari': 2, 'maret': 3, 'april': 4,
          'mei': 5, 'juni': 6, 'juli': 7, 'agustus': 8,
          'september': 9, 'oktober': 10, 'november': 11, 'desember': 12
        };
        
        const aMonth = monthOrder[a.periode.toLowerCase()] || 0;
        const bMonth = monthOrder[b.periode.toLowerCase()] || 0;
        
        return aMonth - bMonth;
      },
    },
    {
      title: "Tanggal Pengajuan",
      dataIndex: "tanggalPengajuan",
      // defaultSortOrder: "descend",
      sorter: (a: any, b: any) =>
        a.tanggalPengajuan
          .toUpperCase()
          .localeCompare(b.tanggalPengajuan.toUpperCase()),
    },
    {
      title: "Tanggal Revisi",
      dataIndex: "tanggalRevisi",
      // defaultSortOrder: "descend",
      sorter: (a: any, b: any) =>
        a.tanggalRevisi
          .toUpperCase()
          .localeCompare(b.tanggalRevisi.toUpperCase()),
    },
    // {
    //   title: "Metode Pemusnahan",
    //   dataIndex: "metodePemusnahan",
    //   defaultSortOrder: "descend",
    //   sorter: (a: any, b: any) => a.metodePemusnahan - b.metodePemusnahan,
    // },
    // {
    //   title: "Berat Limbah Padat",
    //   dataIndex: "beratLimbah",
    //   // defaultSortOrder: "descend",
    //   sorter: (a: any, b: any) => b.beratLimbah.localeCompare(a.beratLimbah),
    // },
    // {
    //   title: "Debit Limbah Cair",
    //   dataIndex: "debitLimbahCair",
    //   // defaultSortOrder: "descend",
    //   sorter: (a: any, b: any) =>
    //     b.debitLimbahCair.localeCompare(a.debitLimbahCair),
    // },
    // {
    //   title: "Limbah B3 Non Covid",
    //   dataIndex: "limbahB3NonCovid",
    //   defaultSortOrder: "descend",
    //   sorter: (a: any, b: any) =>
    //     a.limbahB3NonCovid.localeCompare(b.limbahB3NonCovid),
    // },

    {
      title: "Action",
      key: "action",
      // fixed: "right",
      render: (_: any, record: DataType) => {
        // Don't show actions for group rows (location groups and year groups)
        if (record.isGroup || record.isYearGroup) {
          return null;
        }

        // console.log(record);
        const toViewPage = (param: MLaporanBulanan) => {
          if (laporanBulananStore.simpenSementara) {
            laporanBulananStore.simpenSementara(param as any);
            router.push("/dashboard/admin/manajemen/laporan/ViewLaporan");
          }
        };
        return (
          <Space size="middle">
            <Button
              onClick={() => toViewPage(record as any)}
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
    try {
      if (globalStore.setLoading) globalStore.setLoading(true);
      let dataForm: any = new FormData();
      dataForm.append("periode", form.periode);
      dataForm.append("tahun", form.tahun);
      const response = await api.post("/user/laporan-bulanan/data", dataForm);
      const responseData = response.data.data.values;
      console.log(responseData);

      const transformedData = responseData.map((item: any) => ({
        ...item,
        idUser: item.id_user,
        namaTempat: `${item.user.nama_user} (${item.user.tipe_tempat})`,
        namaTransporter: item.nama_transporter,
        namaPemusnah: item.nama_pemusnah,
        metodePemusnahan: item.metode_pemusnah,
        ukuranPenyimpananTps: item.ukuran_penyimpanan_tps,
        ukuranPemusnahanSendiri: item.ukuran_pemusnahan_sendiri,
        beratLimbah: item.berat_limbah_total,
        limbahB3Covid: item.limbah_b3_covid,
        limbahB3NonCovid: item.limbah_b3_noncovid,
        debitLimbahCair: item.debit_limbah_cair,
        kapasitasIpal: item.kapasitasIpal,
        memenuhiSyarat: item.memenuhi_syarat,
        catatan: item.catatan,
        periode: item.periode_nama,
        tahun: item.tahun,
        tanggalPengajuan: parsingDate(item.created_at),
        tanggalRevisi: parsingDate(item.updated_at),
        key: item.id_laporan_bulanan.toString(),
      }));

      // Group data by hospital/puskesmas (namaTempat) and then by year
      const groupedData = transformedData.reduce((acc: any, item: any) => {
        const tempat = item.namaTempat;
        const tahun = item.tahun;
        
        // Create location group if it doesn't exist
        if (!acc[tempat]) {
          acc[tempat] = {
            key: `group-${tempat}`,
            namaTempat: tempat,
            namaTransporter: `0 Laporan`,
            namaPemusnah: '',
            tahun: '',
            periode: '',
            tanggalPengajuan: '',
            tanggalRevisi: '',
            isGroup: true,
            children: {},
            totalCount: 0
          };
        }
        
        // Create year group if it doesn't exist
        if (!acc[tempat].children[tahun]) {
          acc[tempat].children[tahun] = {
            key: `year-${tempat}-${tahun}`,
            namaTempat: `Tahun ${tahun}`,
            namaTransporter: `0 Laporan`,
            namaPemusnah: '',
            tahun: tahun,
            periode: '',
            tanggalPengajuan: '',
            tanggalRevisi: '',
            isYearGroup: true,
            children: []
          };
        }
        
        // Add item to year group
        acc[tempat].children[tahun].children.push({
          ...item,
          key: `${tempat}-${tahun}-${item.key}`
        });
        
        // Update counts
        acc[tempat].children[tahun].namaTransporter = `${acc[tempat].children[tahun].children.length} Laporan`;
        acc[tempat].totalCount += 1;
        acc[tempat].namaTransporter = `${acc[tempat].totalCount} Laporan`;
        
        return acc;
      }, {});

      // Convert nested structure to array format
      const groupedArray = Object.values(groupedData).map((locationGroup: any) => ({
        ...locationGroup,
        children: Object.values(locationGroup.children)
      })) as DataType[];

       setData(groupedArray);
       setData2(groupedArray);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      if (globalStore.setLoading) globalStore.setLoading(false);
    }
  };

  const handleChangePeriode = (val: any, name: string, event: any) => {
    const periode = parseInt(val);
    console.log(val);
    console.log(periode);
    setForm({
      ...form,
      [name]: val,
    });
  };

  const handleChangeInput = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    // console.log(event);
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const hitDashboard = async () => {
    let dataForm: any = new FormData();
  };

  // -- search -- \\
  const [search, setSearch] = useState("");
  const [data2, setData2] = useState<DataType[]>([]);
  const handleChangeInputs = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    console.log(event);
    setSearch(event.target.value);
  };
  const doSearch = () => {
    let filteredData = [...data2];

    // Filter nested grouped data (location -> year -> reports)
    const processedData = filteredData.map((locationGroup: DataType) => {
      if (!locationGroup.isGroup || !locationGroup.children) {
        return locationGroup;
      }

      let filteredYearGroups: DataType[] = [];
      let totalCount = 0;

      // Process each year group within the location group
      locationGroup.children.forEach((yearGroup: DataType) => {
        if (!yearGroup.isYearGroup || !yearGroup.children) {
          return;
        }

        let filteredReports = yearGroup.children;

        // Filter by search text within year group
        if (search) {
          filteredReports = filteredReports.filter((item: DataType) =>
            item.namaTransporter?.toLowerCase().includes(search.toLowerCase()) ||
            item.namaTempat?.toLowerCase().includes(search.toLowerCase())
          );
        }

        // If year group has matching reports, include it
        if (filteredReports.length > 0) {
          filteredYearGroups.push({
            ...yearGroup,
            children: filteredReports,
            namaTransporter: `${filteredReports.length} Laporan`
          });
          totalCount += filteredReports.length;
        }
      });

      // Return location group with filtered year groups
      if (filteredYearGroups.length > 0) {
        return {
          ...locationGroup,
          children: filteredYearGroups,
          namaTransporter: `${totalCount} Laporan`
        };
      }
      return null;
    }).filter((item): item is DataType => item !== null); // Remove null groups with type guard

    setData(processedData);
  };

  useEffect(() => {
    doSearch();
  }, [search]);

  useEffect(() => {
    getData();
  }, []);

  return (
    <MainLayout title="Tabel Laporan">
      <>
        <Row justify="end">
          <Col span={6}>
            <Input
              onChange={handleChangeInputs}
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
        <table>
          <tbody>
            <tr>
              <td>
                {" "}
                <Form form={formInstance}>
                  <br />
                  <Space wrap>
                    <Form.Item name="form_periode" label="Periode">
                      <Select
                        allowClear={true}
                        onClear={() =>
                          handleChangePeriode("", "periode", event)
                        }
                        placeholder="Pilih Bulan Periode"
                        onChange={(v) =>
                          handleChangePeriode(v, "periode", event)
                        }
                        style={{ width: 200 }}
                        // onChange={handleChange}
                        options={[
                          { value: 1, label: "Januari" },
                          { value: 2, label: "Februari" },
                          { value: 3, label: "Maret" },
                          { value: 4, label: "April" },
                          { value: 5, label: "Mei" },
                          { value: 6, label: "Juni" },
                          { value: 7, label: "Juli" },
                          { value: 8, label: "Agustus" },
                          { value: 9, label: "September" },
                          { value: 10, label: "Oktober" },
                          { value: 11, label: "November" },
                          { value: 12, label: "Desember" },
                        ]}
                      />
                    </Form.Item>
                    <Form.Item name="form_tahun" label="Tahun">
                      <Input
                        allowClear={true}
                        placeholder="Masukan Tahun"
                        onChange={handleChangeInput}
                        maxLength={4}
                        name="tahun"
                      />
                    </Form.Item>
                    <Form.Item>
                      <Button type="primary" onClick={getData}>
                        Filter
                      </Button>
                    </Form.Item>
                  </Space>
                </Form>
              </td>
              <td
                style={{
                  paddingLeft: 10,
                }}>
                <CSVLink
                  data={data}
                  asyncOnClick={true}
                  filename={`Laporan Limbah - ${new Date().toISOString()}.csv`}
                  onClick={async (event: any, done: () => void) => {
                    await handleGenerateCsv();
                    done();
                  }}>
                  <Button>Export Excel</Button>
                </CSVLink>
              </td>
            </tr>
          </tbody>
        </table>
      </>
      {/* <div>
        <Button type="primary" onClick={handleGenerateCsv}>
          Export Excel
        </Button>
        <CSVDownload data={datacsv} target="_blank" />
      </div> */}
      <div style={{ marginTop: "20px" }}>
        <Table
          key={new Date().toISOString().toString()}
          scroll={{ x: 800 }}
          columns={columns}
          dataSource={data}
          expandable={{
            childrenColumnName: 'children',
            defaultExpandAllRows: false,
            rowExpandable: (record) => !!(record.children && record.children.length > 0),
          }}
          rowClassName={(record) => {
            if (record.isGroup) return 'group-row';
            if (record.isYearGroup) return 'year-group-row';
            return '';
          }}
          onChange={onChange}
        />
      </div>
    </MainLayout>
  );
};

export default Index;
