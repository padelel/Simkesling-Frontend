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
import { ResponseLaporanRekapitulasi } from "@/models/MLaporanRekapitulasi";

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
}

// const onChange: TableProps<DataType>["onChange"] = (
const onChange = (pagination: any, filters: any, sorter: any, extra: any) => {
  console.log("params", pagination, filters, sorter, extra);
};

const Index: React.FC = () => {
  const globalStore = useGlobalStore();
  const laporanBulananStore = useLaporanBulananStore();
  const [data, setData] = useState<any[]>([]);
  const [dataResp, setDataResp] = useState<ResponseLaporanRekapitulasi>();
  const [datacsv, setDatacsv] = useState<any[]>([]);
  const router = useRouter();
  const [formInstance] = Form.useForm();
  let tmpForm = {
    periode: "",
    tahun: "",
    search_tempat: "",
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

  const tmpArr: any[] = [
    {
      title: "Periode",
      dataIndex: "periode_nama",
    },
    {
      title: "Total",
      dataIndex: "total",
    },
    {
      title: "Total B3Padat",
      dataIndex: "total_b3padat",
    },
    {
      title: "Total Covid",
      dataIndex: "total_covid",
    },
    {
      title: "Total B3 Non Medis",
      dataIndex: "total_limbah_b3_nonmedis",
    },
    {
      title: "Total Jarum",
      dataIndex: "total_limbah_jarum",
    },
    {
      title: "Total Sludge IPAL",
      dataIndex: "total_limbah_sludge_ipal",
    },
    // {
    //   title: "Total Non Covid",
    //   dataIndex: "total_noncovid",
    // },
  ];
  const [columns, setColumns] = useState<any[]>(cloneDeep(tmpArr)) as any[];

  const getData = async () => {
    try {
      if (globalStore.setLoading) globalStore.setLoading(true);
      let dataForm: any = new FormData();
      dataForm.append("periode", form.periode ?? null);
      dataForm.append("tahun", form.tahun ?? null);
      dataForm.append("search_tempat", form.search_tempat ?? null);
      const response = await api.post<ResponseLaporanRekapitulasi>(
        "/user/laporan-rekapitulasi/data",
        dataForm
      );
      const responseData = response.data.data;
      setDataResp(response.data);
      console.log(responseData);

      let tmpColumns: any[] = [
        {
          title: "Periode",
          dataIndex: "periode_nama",
        },
        {
          title: "Total",
          dataIndex: "total",
        },
        {
          title: "Total B3Padat",
          dataIndex: "total_b3padat",
        },
        {
          title: "Total Covid",
          dataIndex: "total_covid",
        },
        {
          title: "Total B3 Non Medis",
          dataIndex: "total_limbah_b3_nonmedis",
        },
        {
          title: "Total Jarum",
          dataIndex: "total_limbah_jarum",
        },
        {
          title: "Total Sludge IPAL",
          dataIndex: "total_limbah_sludge_ipal",
        },
        // {
        //   title: "Total Non Covid",
        //   dataIndex: "total_noncovid",
        // },
      ];
      response.data.data.users.map((val) => {
        let nama = val.nama_user
          .toLowerCase()
          .replaceAll(" ", "_")
          .replaceAll("-", "_")
          .replaceAll("'", "")
          .replaceAll('"', "");
        let jsn = {
          title: val.nama_user,
          dataIndex: `user_${val.id_user}`,
          children: [
            {
              title: "B3Padat",
              dataIndex: `b3padat_${val.id_user}_${nama}`,
            },
            {
              title: "Limbah Covid",
              dataIndex: `covid_${val.id_user}_${nama}`,
            },
            {
              title: "Total B3 Non Medis",
              dataIndex: `b3nonmedis_${val.id_user}_${nama}`,
            },
            {
              title: "Total Jarum",
              dataIndex: `jarum_${val.id_user}_${nama}`,
            },
            {
              title: "Total Sludge IPAL",
              dataIndex: `sludgeipal_${val.id_user}_${nama}`,
            },
            // {
            //   title: "Limbah Non Covid",
            //   dataIndex: `noncovid_${val.id_user}_${nama}`,
            // },
          ],
        };
        tmpColumns.push(jsn);
      });
      let tmpData: any[] = [];
      responseData.laporan.forEach((val) => {
        let jsn = {
          periode_nama: "",
          total: 0,
          total_b3padat: 0,
          total_covid: 0,
          total_limbah_b3_nonmedis: 0,
          total_limbah_jarum: 0,
          total_limbah_sludge_ipal: 0,
          // total_noncovid: 0,
        } as any;
        jsn.periode_nama = val.periode_nama;
        jsn.total = val.total_limbah;
        jsn.total_b3padat = val.total_limbah_b3;
        jsn.total_covid = val.total_limbah_covid;
        jsn.total_limbah_b3_nonmedis = val.total_limbah_b3_nonmedis;
        jsn.total_limbah_jarum = val.total_limbah_jarum;
        jsn.total_limbah_sludge_ipal = val.total_limbah_sludge_ipal;
        // jsn.total_noncovid = val.total_limbah_noncovid;

        val.users.forEach((v) => {
          let nama =
            v.nama_user != null
              ? v.nama_user
                  .toLowerCase()
                  .replaceAll(" ", "_")
                  .replaceAll("-", "_")
                  .replaceAll("'", "")
                  .replaceAll('"', "")
              : "";
          // @ts-ignore
          jsn[`b3padat_${v.id_user}_${nama}`] = v.limbah_b3;
          // @ts-ignore
          jsn[`covid_${v.id_user}_${nama}`] = v.limbah_covid;
          // @ts-ignore
          jsn[`b3nonmedis_${v.id_user}_${nama}`] = v.limbah_b3_nonmedis;
          // @ts-ignore
          jsn[`jarum_${v.id_user}_${nama}`] = v.limbah_jarum;
          // @ts-ignore
          jsn[`sludgeipal_${v.id_user}_${nama}`] = v.limbah_sludge_ipal;
          // @ts-ignore
          // jsn[`noncovid_${v.id_user}_${nama}`] = v.limbah.;
        });
        tmpData.push(jsn);
        // val.users.forEach(v => {
        //   v.limbah_b3
        //   v.limbah_covid
        //   v.limbah_noncovid
        // })
        // let tmpJsn = {
        //   title: val.periode_nama,
        //   dataIndex: `periode_${val.periode}`,
        // };
        // tmpColumns.push(tmpJsn);
      });
      setData(tmpData);
      console.log(tmpData);
      // setColumns(tmpColumns);
      // setColumns([
      //   {
      //     title: "Periode",
      //     dataIndex: "periode_nama",
      //   },
      //   {
      //     title: "Total",
      //     dataIndex: "total",
      //   },
      //   {
      //     title: "Total B3Padat",
      //     dataIndex: "total_b3padat",
      //   },
      //   {
      //     title: "Total Covid",
      //     dataIndex: "total_covid",
      //   },
      //   {
      //     title: "Total Non Covid",
      //     dataIndex: "total_noncovid",
      //   },
      //   {
      //     title: "RS A",
      //     dataIndex: "rsa",
      //     children: [
      //       {
      //         title: "B3Padat",
      //         dataIndex: "b3padat",
      //       },
      //       {
      //         title: "Limbah Covid",
      //         dataIndex: "covid",
      //       },
      //       {
      //         title: "Limbah Non Covid",
      //         dataIndex: "noncovid",
      //       },
      //     ],
      //   },
      //   {
      //     title: "RS B",
      //     dataIndex: "rsb",
      //     children: [
      //       {
      //         title: "B3Padat",
      //         dataIndex: "b3padat",
      //       },
      //       {
      //         title: "Limbah Covid",
      //         dataIndex: "covid",
      //       },
      //       {
      //         title: "Limbah Non Covid",
      //         dataIndex: "noncovid",
      //       },
      //     ],
      //   },
      // ]);
      setColumns(tmpColumns);
      console.log(tmpColumns);

      // const transformedData = responseData.map((item: any) => ({
      //   ...item,
      //   idUser: item.id_user,
      //   namaTempat: item.user.nama_user,
      //   namaTransporter: item.nama_transporter,
      //   namaPemusnah: item.nama_pemusnah,
      //   metodePemusnahan: item.metode_pemusnah,
      //   ukuranPenyimpananTps: item.ukuran_penyimpanan_tps,
      //   ukuranPemusnahanSendiri: item.ukuran_pemusnahan_sendiri,
      //   beratLimbah: item.berat_limbah_total,
      //   limbahB3Covid: item.limbah_b3_covid,
      //   limbahB3NonCovid: item.limbah_b3_noncovid,
      //   debitLimbahCair: item.debit_limbah_cair,
      //   kapasitasIpal: item.kapasitasIpal,
      //   memenuhiSyarat: item.memenuhi_syarat,
      //   catatan: item.catatan,
      //   periode: item.periode_nama,
      //   tahun: item.tahun,
      //   tanggalPengajuan: parsingDate(item.created_at),
      //   tanggalRevisi: parsingDate(item.updated_at),
      //   key: new Date().toISOString().toString(),
      // }));

      // setData(transformedData);
      // setData2(transformedData);
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
    const tmpData = data2.filter((val) => {
      if (
        val.namaTransporter
          .toString()
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        val.namaTempat
          .toString()
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        val.namaPemusnah.toString().toLowerCase().includes(search.toLowerCase())
      ) {
        return true;
      }
    });
    setData(tmpData);
  };

  useEffect(() => {
    doSearch();
  }, [search]);

  // useEffect(() => {
  //   getData();
  // }, []);

  return (
    <MainLayout title="Tabel Laporan Rakapitulasi">
      <>
        <Row justify="end">
          {/* <Col span={6}>
            <Input
              onChange={handleChangeInputs}
              value={search}
              name="search"
              placeholder="Search"
            />
          </Col> */}
          <Col>
            <Button
              icon={<ReloadOutlined />}
              style={{ marginLeft: 15, backgroundColor: "orange" }}
              onClick={getData}
            >
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
                    <Form.Item name="form_tempat" label="Search Nama Instansi">
                      <Input
                        allowClear={true}
                        placeholder="Masukan Nama Instansi"
                        onChange={handleChangeInput}
                        name="search_tempat"
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
                }}
              >
                <CSVLink
                  data={data}
                  asyncOnClick={true}
                  filename={`Laporan Limbah - ${new Date().toISOString()}.csv`}
                  onClick={async (event: any, done: () => void) => {
                    await handleGenerateCsv();
                    done();
                  }}
                >
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
          bordered
          pagination={false}
          key={new Date().toISOString().toString()}
          defaultExpandAllRows={true}
          scroll={{ x: 800 }}
          columns={columns}
          dataSource={data}
          onChange={onChange}
          footer={() => {
            return (
              <>
                <div>
                  <span>
                    Tahun: <b>{dataResp?.data.tahun}</b>
                  </span>
                  <ul>
                    <li>
                      Total Limbah B3Padat:{" "}
                      <b>{dataResp?.data.total_seluruh_limbah_b3}</b>
                    </li>
                    <li>
                      Total Limbah Covid:{" "}
                      <b>{dataResp?.data.total_seluruh_limbah_covid}</b>
                    </li>
                    <li>
                      Total Limbah B3 NonMedis:{" "}
                      <b>{dataResp?.data.total_seluruh_limbah_b3_nonmedis}</b>
                    </li>
                    <li>
                      Total Limbah Jarum:{" "}
                      <b>{dataResp?.data.total_seluruh_limbah_jarum}</b>
                    </li>
                    <li>
                      Total Limbah Sludge IPAL:{" "}
                      <b>{dataResp?.data.total_seluruh_limbah_sludge_ipal}</b>
                    </li>
                    <li>
                      Total Limbah Seluruhnya:{" "}
                      <b>{dataResp?.data.total_seluruh_limbah}</b>
                    </li>
                  </ul>
                </div>
              </>
            );
          }}
        />
      </div>
    </MainLayout>
  );
};

export default Index;
