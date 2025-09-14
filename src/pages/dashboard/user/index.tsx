import React, { useEffect } from "react";
import { useState, createContext, useContext } from "react";
import MainLayout from "@/components/MainLayout";
import { useUserLoginStore } from "@/stores/userLoginStore";
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Select,
  Space,
  Spin,
} from "antd";
import dynamic from "next/dynamic";
import cloneDeep from "clone-deep";
import api from "@/utils/HttpRequest";
import { useGlobalStore } from "@/stores/globalStore";

const DashboardPage: React.FC = () => {
  const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
  const globalStore = useGlobalStore();
  const userLoginStore = useUserLoginStore();
  const messageLimbah = "Anda belum mengisi data limbah periode";
  const [pesan, setPesan] = useState("");
  const [judulChart, setJudulChart] = useState("");
  const [lapor, setLapor] = useState(false);

  const [formInstance] = Form.useForm();

  const tmpSeries = [
    {
      name: "Berat Total Limbah", //will be displayed on the y-axis
      data: [],
    },
  ];

  const [series, setSeries] = useState(cloneDeep(tmpSeries));
  const [chartWidth, setChartWidth] = useState(700);
  const [chartHeight, setChartHeight] = useState(400);
  const options = {
    chart: {
      id: "simple-bar",
      type: 'bar' as const,
      height: 350,
      stacked: true,
      toolbar: {
        show: true
      },
      zoom: {
        enabled: true
      }
    },
    responsive: [{
      breakpoint: 480,
      options: {
        legend: {
          position: 'bottom' as const,
          offsetX: -10,
          offsetY: 0
        }
      }
    }],
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 10,
        dataLabels: {
          total: {
            enabled: true,
            style: {
              fontSize: '13px',
              fontWeight: 900
            }
          }
        }
      },
    },
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
        text: "Berat Limbah (Kg)",
      },
    },
    legend: {
      position: 'right' as const,
      offsetY: 40
    },
    fill: {
      opacity: 1
    },
    title: {
      text: judulChart, // Judul chart "Berat Total Limbah"
      align: "center" as const,
    },
  };

  let tmpForm = {
    periode: "",
    tahun: "",
  };

  const [form, setForm] = useState(cloneDeep(tmpForm));

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
      dataForm.append("periode", form.periode);
      dataForm.append("tahun", form.tahun);
      let url = "/user/dashboard-user/data";
      let responsenya = await api.post(url, dataForm);
      let tmpData = responsenya.data.data.values.total_limbah_chart_year;
      console.log(tmpData)
      
      // Validasi dan format data untuk ApexCharts
      if (tmpData && Array.isArray(tmpData)) {
        const validatedData = tmpData.map(item => ({
          name: item.name || '',
          data: Array.isArray(item.data) ? item.data.map(val => parseFloat(val) || 0) : []
        }));
        setSeries(validatedData);
      } else {
        setSeries([]);
      }
      let tmpPesan = "";
      let tmpJudulChart = "";
      if (responsenya.data.data.values.sudah_lapor) {
        tmpPesan = `Anda Sudah Mengisi Laporan Pada Periode ${responsenya.data.data.values.laporan_periode_nama} ${responsenya.data.data.values.laporan_periode_tahun}`;
        tmpJudulChart = `Berat Total Limbah Tahun ${responsenya.data.data.values.laporan_periode_tahun}
       ${userLoginStore.user?.nama_user}`;
      } else {
        tmpPesan = `Anda Belum Mengisi Laporan Pada Periode ${responsenya.data.data.values.laporan_periode_nama} ${responsenya.data.data.values.laporan_periode_tahun}`;
        tmpJudulChart = `Berat Total Limbah Tahun ${responsenya.data.data.values.laporan_periode_tahun}
       ${userLoginStore.user?.nama_user}`;
      }
      setPesan(tmpPesan);
      setJudulChart(tmpJudulChart);
      setLapor(responsenya.data.data.values.sudah_lapor);
      console.log(responsenya);
      console.log(tmpJudulChart);
    } catch (e) {
      console.error(e);
    } finally {
      if (globalStore.setLoading) globalStore.setLoading(false);
    }
  };

  // Gaya khusus untuk card peringatan (warning)
  const warningCardStyle = {
    backgroundColor: "#ffc107", // Warna peringatan (warning)
    borderColor: "#ffc107",
    color: "#333", // Warna teks
  };

  const warningCardHeadStyle = {
    backgroundColor: "#ffc107", // Warna latar kepala card
    color: "#333", // Warna teks kepala card
  };

  const warningCardBodyStyle = {
    padding: "12px", // Atur padding sesuai keinginan Anda
  };

  useEffect(() => {
    hitDashboard();
    const handleResize = () => {
      // Periksa lebar layar dan atur lebar chart sesuai dengan kondisi tertentu
      if (window.innerWidth < 700) {
        setChartWidth(300);
        setChartHeight(400);
      } else {
        setChartWidth(700);
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
    <MainLayout title={"Dashboard"}>
      <Spin spinning={globalStore.isloading}>
        <h2>Laporan Limbah</h2>

        <Form form={formInstance}>
          <br />
          <Space wrap>
            <Form.Item name="form_periode" label="Periode">
              <Select
                placeholder="Pilih Bulan Periode"
                onChange={(v) => handleChangePeriode(v, "periode", event)}
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
                placeholder="Masukan Tahun"
                onChange={handleChangeInput}
                maxLength={4}
                name="tahun"
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" onClick={hitDashboard}>
                Filter
              </Button>
            </Form.Item>
          </Space>
        </Form>

        {!lapor && (
          <Alert
            message="Pemberitahuan"
            description={pesan}
            type="warning"
            showIcon
          />
        )}
        {lapor && (
          <Alert
            message="Pemberitahuan"
            description={pesan}
            type="success"
            showIcon
          />
        )}

        <div
          style={{ marginTop: 30, display: "flex", justifyContent: "center" }}>
          <Row>
            <Col>
              {typeof window !== undefined && (
                <Chart
                  options={options}
                  type="bar"
                  width={chartWidth}
                  height={chartHeight}
                  series={series}
                />
              )}
            </Col>
          </Row>
        </div>
      </Spin>
    </MainLayout>
  );
};

export default DashboardPage;
