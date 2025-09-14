import React, { useEffect, useState } from "react";
// import Chart from "react-apexcharts";
import MainLayout from "@/components/MainLayout";
import Diagram from "@/components/admin/dashboard/Diagram";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Select,
  Space,
  Spin,
  Table,
  TableProps,
  Tag,
} from "antd";
import TabelNotifikasi from "@/components/admin/dashboard/TabelNotifikasi";
import CardTahunan from "@/components/admin/dashboard/CardTahunan";
import CardBulanan from "@/components/admin/dashboard/Cardbulanan";
import dynamic from "next/dynamic";
import cloneDeep from "clone-deep";
import api from "@/utils/HttpRequest";
import { useGlobalStore } from "@/stores/globalStore";
import PieChart from "@/components/admin/dashboard/DiagramPie";

const onChange = (pagination: any, filters: any, sorter: any, extra: any) => {
  console.log("params", pagination, filters, sorter, extra);
};

const DashboardPage: React.FC = () => {
  const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
  const globalStore = useGlobalStore();
  const [data, setData] = useState<any[]>([]);
  const [tahunChart, setTahunChart] = useState("");
  const [periode, setPeriode] = useState("");
  const [formInstance] = Form.useForm();
  const [chartWidth, setChartWidth] = useState(800);
  const [chartHeight, setChartHeight] = useState(400);
  const [judulChart, setJudulChart] = useState("");
  const options = {
    chart: {
      id: "simple-bar",
    },
    colors: ["#feb019d9", "#008ffbd9", "#00e396d9"],
    xaxis: {
      categories: [
        "Januari",
        "Februari",
        "Maret",
        "April",
        "Mei",
        "Juni",
        "Juli",
        "Agustus",
        "September",
        "Oktober",
        "November",
        "Desember",
      ],
    },
    yaxis: {
      title: {
        text: "Jumlah Laporan",
      },
    },
    title: {
      text: `Grafik Pelaporan Limbah Puskesmas & RS ${judulChart}`, // Judul chart "Berat Total Limbah"
      align: "center",
    },
  };

  let tmp_form = {
    laporan_periode: "",
    laporan_periode_nama: "",
    laporan_periode_tahun: "",
    total_laporan_perperiode: 0,
    total_puskesmas_rs_belum_lapor: 0,
    total_puskesmas_rs_sudah_lapor: 0,
    total_transporter: 0,
    total_puskesmas_rs: 0,
  };
  const [form, setForm] = useState(cloneDeep(tmp_form));

  const tmpSeries = [
    {
      name: "Total Puskesmas & RS Belum Lapor", //will be displayed on the y-axis
      data: [],
    },
    {
      name: "Total Puskesmas & RS", //will be displayed on the y-axis
      data: [],
    },
    {
      name: "Total Puskesmas & RS Sudah Lapor", //will be displayed on the y-axis
      data: [],
    },
  ];

  const [series, setSeries] = useState(cloneDeep(tmpSeries));

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
    if (globalStore.setLoading) globalStore.setLoading(true);
    try {
      let dataForm: any = new FormData();
      dataForm.append("periode", form.laporan_periode);
      dataForm.append("tahun", form.laporan_periode_tahun);
      let url = "/user/dashboard-admin/data";
      let responsenya = await api.post(url, dataForm);
      let tmpData = cloneDeep(tmpSeries);
      tmpData[1].data = responsenya.data.data.values.total_chart_puskesmas_rs;
      tmpData[2].data =
        responsenya.data.data.values.total_chart_puskesmas_rs_sudah_lapor;
      tmpData[0].data =
        responsenya.data.data.values.total_chart_puskesmas_rs_belum_lapor;
      setSeries(tmpData);
      let tahun = responsenya.data.data.values.laporan_periode_tahun;
      setJudulChart(tahun);
      console.log(tahunChart);
      console.log(responsenya.data.data.values);
      setForm({
        laporan_periode: responsenya.data.data.values.laporan_periode,
        laporan_periode_nama: responsenya.data.data.values.laporan_periode_nama,
        laporan_periode_tahun:
          responsenya.data.data.values.laporan_periode_tahun,
        total_laporan_perperiode:
          responsenya.data.data.values.total_laporan_perperiode,
        total_puskesmas_rs_belum_lapor:
          responsenya.data.data.values.total_puskesmas_rs_belum_lapor,
        total_puskesmas_rs_sudah_lapor:
          responsenya.data.data.values.total_puskesmas_rs_sudah_lapor,
        total_transporter: responsenya.data.data.values.total_transporter,
        total_puskesmas_rs: responsenya.data.data.values.total_puskesmas_rs,
      });

      const responseData =
        responsenya.data.data.values.notif_user_laporan_bulanan;
      const transformedData = responseData.map((item: any) => ({
        ...item,
        namaUser: item.nama_user,
        namaTempat: item.tipe_tempat,
        kec: item.kecamatan,
        kel: item.kelurahan,
        sudahLapor: item.sudah_lapor,
      }));

      setData(transformedData);
    } catch (e) {
      console.error(e);
    } finally {
      if (globalStore.setLoading) globalStore.setLoading(false);
    }
  };

  const columns: any = [
    {
      title: "Nama Tempat",
      dataIndex: "namaUser",
      // defaultSortOrder: "descend",
      sorter: (a: any, b: any) =>
        a.namaUser.toUpperCase().localeCompare(b.namaUser.toUpperCase()),
    },
    {
      title: "Jenis Instansi",
      dataIndex: "namaTempat",
      // defaultSortOrder: "descend",
      sorter: (a: any, b: any) =>
        a.namaTempat.toUpperCase().localeCompare(b.namaTempat.toUpperCase()),
    },
    {
      title: "Kecamatan",
      dataIndex: "kec",
      // defaultSortOrder: "descend",
      sorter: (a: any, b: any) =>
        a.kec.toUpperCase().localeCompare(b.kec.toUpperCase()),
    },
    {
      title: "Kelurahan",
      dataIndex: "kel",
      // defaultSortOrder: "descend",
      sorter: (a: any, b: any) =>
        a.kel.toUpperCase().localeCompare(b.kel.toUpperCase()),
    },
    {
      title: "Status Laporan",
      dataIndex: "sudahLapor",
      render: (status: any) => {
        let sts = "-- ups --";
        let color = "-";
        if (status == false) {
          color = "volcano";
          sts = "Belum lapor";
        }
        if (status == true) {
          color = "green";
          sts = "Sudah Lapor";
        }

        return (
          <>
            <Tag color={color}>{sts.toUpperCase()}</Tag>
          </>
        );
      },
    },
  ];

  const getData = async () => {
    if (globalStore.setLoading) globalStore.setLoading(true);
    try {
      const response = await api.post("/user/dashboard-admin/data");
      const responseData = response.data.data.values.notif_user_laporan_bulanan;

      const transformedData = responseData.map((item: any) => ({
        ...item,
        namaUser: item.nama_user,
        namaTempat: item.tipe_tempat,
        kec: item.kecamatan,
        kel: item.kelurahan,
        sudahLapor: item.sudah_lapor,
      }));

      setData(transformedData);
      console.log(transformedData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      if (globalStore.setLoading) globalStore.setLoading(false);
    }
  };

  const styleCardGraph = {
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)",
    borderRadius: "8px", // Optional: Untuk membulatkan sudut card
    // padding: "5px", // Optional: Atur padding sesuai kebutuhan
  };

  useEffect(() => {
    // getData();
    hitDashboard();

    const handleResize = () => {
      // Periksa lebar layar dan atur lebar chart sesuai dengan kondisi tertentu
      if (window.innerWidth < 700) {
        setChartWidth(300);
        setChartHeight(400);
      } else {
        setChartWidth(800);
      }
    };

    // Tambahkan event listener untuk mengikuti perubahan ukuran layar
    window.addEventListener("resize", handleResize);

    // Panggil handleResize saat komponen pertama kali dimuat
    handleResize();

    // Hapus event listener saat komponen dibongkar
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  return (
    <MainLayout title="Dashboard">
      <Spin spinning={globalStore.isloading}>
        <Form form={formInstance}>
          <br />
          <Space
            wrap
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}>
            <Form.Item name="form_periode" label="Periode">
              <Select
                placeholder="Pilih Bulan Periode"
                onChange={(v) =>
                  handleChangePeriode(v, "laporan_periode", event)
                }
                style={{ width: 200 }}
                allowClear={true}
                onClear={(v) =>
                  handleChangePeriode("", "laporan_periode", event)
                }
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
                placeholder="Masukan Tahun"
                onChange={handleChangeInput}
                maxLength={4}
                name="laporan_periode_tahun"
                allowClear={true}
                onClear={handleChangeInput}
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" onClick={hitDashboard}>
                Filter
              </Button>
            </Form.Item>
          </Space>
        </Form>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}>
          <Space direction="vertical" size={5}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}>
              <Space direction="horizontal" size={5}>
                <Card
                  title="Instansi Belum Lapor"
                  style={{
                    width: "100%",
                    backgroundColor: "burlywood",
                  }}>
                  <h1 style={{ textAlign: "center" }}>
                    {form.total_puskesmas_rs}
                  </h1>
                </Card>

                <Card
                  title="Instansi Sudah Lapor"
                  style={{ width: "100%", backgroundColor: "coral" }}>
                  <h1 style={{ textAlign: "center" }}>
                    {form.total_puskesmas_rs_sudah_lapor}
                  </h1>
                </Card>

                <Card
                  title="Instansi Belum Lapor"
                  style={{ width: "100%", backgroundColor: "salmon" }}>
                  <h1 style={{ textAlign: "center" }}>
                    {form.total_puskesmas_rs_belum_lapor}
                  </h1>
                </Card>

                <Card
                  title="Total Transporter"
                  style={{ width: "100%", backgroundColor: "hotpink" }}>
                  <h1 style={{ textAlign: "center" }}>
                    {form.total_transporter}
                  </h1>
                </Card>
              </Space>
            </div>

            <div style={{ display: "flex", justifyContent: "center" }}>
              <Row>
                <Col>
                  {typeof window !== undefined && (
                    <Card style={styleCardGraph}>
                      <Chart
                        options={options}
                        type="bar"
                        width={chartWidth}
                        height={chartHeight}
                        series={series}
                      />
                    </Card>
                  )}
                </Col>
              </Row>
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <Card style={styleCardGraph}>
                <table>
                  <tbody>
                    <tr>
                      <td>
                        <h4
                          style={{
                            display: "flex",
                            justifyContent: "center",
                          }}>
                          Notifikasi Laporan Limbah
                        </h4>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <Table
                          scroll={{ x: 800 }}
                          columns={columns}
                          dataSource={data}
                          onChange={onChange}
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Card>
            </div>
          </Space>
        </div>
      </Spin>
    </MainLayout>
  );
};

export default DashboardPage;
