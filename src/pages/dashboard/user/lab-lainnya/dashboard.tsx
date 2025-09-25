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

const DashboardLabLainnyaPage: React.FC = () => {
  const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
  const globalStore = useGlobalStore();
  const userLoginStore = useUserLoginStore();
  const messageLab = "Anda belum mengisi data pemeriksaan lab periode";
  const [pesan, setPesan] = useState("");
  const [judulChart, setJudulChart] = useState("");
  const [lapor, setLapor] = useState(false);

  const [formInstance] = Form.useForm();

  const tmpSeries = [
    {
      name: "Total Pemeriksaan Lab", //will be displayed on the y-axis
      data: [] as number[],
    },
  ];

  const [series, setSeries] = useState(cloneDeep(tmpSeries));
  const [chartWidth, setChartWidth] = useState(700);
  const [chartHeight, setChartHeight] = useState(400);
  
  // Create options with proper structure to avoid hasOwnProperty issues
  const getChartOptions = () => {
    return {
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
              },
              formatter: function (val: number) {
                return val ? parseFloat(val.toFixed(1)).toString() : '0';
              }
            }
          }
        },
      },
      dataLabels: {
        enabled: true,
        formatter: function (val: number) {
          return val ? parseFloat(val.toFixed(1)).toString() : '0';
        },
        style: {
          fontSize: '12px',
          colors: ['#fff']
        }
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
          text: "Jumlah Pemeriksaan",
        },
      },
      legend: {
        position: 'right' as const,
        offsetY: 40
      },
      fill: {
        opacity: 1
      },
      tooltip: {
        y: {
          formatter: function (val: number) {
            return val ? parseFloat(val.toFixed(1)).toString() + ' Pemeriksaan' : '0 Pemeriksaan';
          }
        }
      },
      title: {
        text: String(judulChart || ''), // Ensure string type
        align: "center" as const,
      },
    };
  };

  let tmpForm = {
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
      dataForm.append("tahun", form.tahun);
      let url = "/user/dashboard-user/data-lab";
      let responsenya = await api.post(url, dataForm);
      let tmpData = responsenya.data.data.values.total_lab_chart_year;
      console.log('Lab Data:', tmpData);
      
      // Validasi dan format data untuk ApexCharts - Lab Lainnya
        try {
          let processedSeries = [];
          
          if (tmpData && Array.isArray(tmpData) && tmpData.length > 0) {
            for (const item of tmpData) {
              if (item && item.name) {
                const cleanData = [];
                
                if (Array.isArray(item.data) && item.data.length > 0) {
                  for (let i = 0; i < 12; i++) {
                    const val = item.data[i];
                    if (val === null || val === undefined || val === '' || isNaN(val)) {
                      cleanData.push(0);
                    } else {
                      cleanData.push(Number(val));
                    }
                  }
                } else {
                  // Default 12 months with 0
                  for (let i = 0; i < 12; i++) {
                    cleanData.push(0);
                  }
                }
                
                // Create simple object
                processedSeries.push({
                  name: String(item.name),
                  data: cleanData
                });
              }
            }
          }
          
          // Set default if no valid data
          if (processedSeries.length === 0) {
            processedSeries = [{
              name: 'Data Pemeriksaan Lab',
              data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
            }];
          }
          
          setSeries(processedSeries);
        } catch (error) {
          console.error('Error processing chart data:', error);
          setSeries([{
            name: 'Data Pemeriksaan Lab',
            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
          }]);
        }
      
      let tmpPesan = "";
      let tmpJudulChart = "";
      if (responsenya.data.data.values.sudah_lapor) {
        tmpPesan = `Anda Sudah Mengisi Laporan Pada Periode ${responsenya.data.data.values.laporan_periode_nama} ${responsenya.data.data.values.laporan_periode_tahun}`;
        tmpJudulChart = `Total Pemeriksaan Lab Lainnya Tahun ${responsenya.data.data.values.laporan_periode_tahun}
       ${userLoginStore.user?.nama_user}`;
      } else {
        tmpPesan = `Anda Belum Mengisi Laporan Pada Periode ${responsenya.data.data.values.laporan_periode_nama} ${responsenya.data.data.values.laporan_periode_tahun}`;
        tmpJudulChart = `Total Pemeriksaan Lab Lainnya Tahun ${responsenya.data.data.values.laporan_periode_tahun}
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
    <MainLayout title={"Dashboard Pemeriksaan Lab Lainnya"}>
      <Spin spinning={globalStore.isloading}>
        <h2>Laporan Pemeriksaan Lab Lainnya</h2>

        <Form form={formInstance}>
          <br />
          <Space wrap>
            <Form.Item name="form_tahun" label="Tahun">
              <Input
                placeholder="Masukan Tahun (contoh: 2024)"
                onChange={handleChangeInput}
                maxLength={4}
                name="tahun"
                style={{ width: 200 }}
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
          style={{ marginTop: 30, display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
          <Row>
            <Col>
              {typeof window !== undefined && (
                <Chart
                  options={getChartOptions()}
                  type="bar"
                  width={chartWidth}
                  height={chartHeight}
                  series={series}
                />
              )}
            </Col>
          </Row>
          
          {/* Keterangan Satuan Data */}
          <div style={{ marginTop: 20, textAlign: 'center', padding: '16px', backgroundColor: '#f0f2f5', borderRadius: '8px', maxWidth: '600px' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
              <strong>Keterangan:</strong> Semua data pemeriksaan lab dalam grafik menggunakan satuan <strong>Jumlah Pemeriksaan</strong>
            </p>
          </div>
        </div>
      </Spin>
    </MainLayout>
  );
};

export default DashboardLabLainnyaPage;