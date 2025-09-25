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

const DashboardLimbahCairPage: React.FC = () => {
  const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
  const globalStore = useGlobalStore();
  const userLoginStore = useUserLoginStore();
  const messageLimbah = "Anda belum mengisi data limbah periode";
  const [pesan, setPesan] = useState("");
  const [judulChartLimbahCair, setJudulChartLimbahCair] = useState("");
  const [lapor, setLapor] = useState(false);

  const [formInstance] = Form.useForm();

  const tmpSeriesLimbahCair = [
    {
      name: "pH",
      data: [] as (number | null)[],
      color: '#FF6B6B' // Red
    },
    {
      name: "BOD (mg/l)",
      data: [] as (number | null)[],
      color: '#4ECDC4' // Teal
    },
    {
      name: "COD (mg/l)",
      data: [] as (number | null)[],
      color: '#45B7D1' // Blue
    },
    {
      name: "TSS (mg/l)",
      data: [] as (number | null)[],
      color: '#96CEB4' // Green
    },
    {
      name: "Minyak & Lemak (mg/l)",
      data: [] as (number | null)[],
      color: '#FFEAA7' // Yellow
    },
    {
      name: "Amoniak (mg/l)",
      data: [] as (number | null)[],
      color: '#DDA0DD' // Plum
    },
    {
      name: "Total Coliform (MPN/100ml)",
      data: [] as (number | null)[],
      color: '#FFA07A' // Light Salmon
    },
    {
      name: "Debit Air Limbah (M³/bulan)",
      data: [] as (number | null)[],
      color: '#20B2AA' // Light Sea Green
    },
  ];

  const [seriesLimbahCair, setSeriesLimbahCair] = useState(cloneDeep(tmpSeriesLimbahCair));
  const [chartWidth, setChartWidth] = useState(700);
  const [chartHeight, setChartHeight] = useState(400);
  
  const optionsLimbahCair = {
    chart: {
      id: "limbah-cair-bar",
      type: 'bar' as const,
      height: 450,
      stacked: true,
      toolbar: {
        show: true
      },
      zoom: {
        enabled: true
      }
    },
    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FFA07A', '#20B2AA'],
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
            formatter: function (val: any) {
              return val ? parseFloat(val.toFixed(1)).toString() : '0';
            }
          }
        }
      },
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: any) {
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
        text: "Nilai Parameter",
      },
    },
    legend: {
      position: 'right' as const,
      offsetY: 40,
      fontSize: '12px',
      markers: {
        size: 6,
        strokeWidth: 0,
        fillColors: undefined,
        shape: 'circle' as const
      }
    },
    fill: {
      opacity: 0.8
    },
    title: {
      text: judulChartLimbahCair,
      align: "center" as const,
      style: {
        fontSize: '16px',
        fontWeight: 'bold'
      }
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: function (val: any, opts: any) {
          if (val === null || val === undefined) return 'Tidak ada data';
          const seriesName = opts?.series?.[opts?.seriesIndex]?.name || '';
          if (seriesName && seriesName.includes('pH')) {
            return parseFloat(val.toFixed(1)).toString();
          } else if (seriesName && seriesName.includes('Coliform')) {
            return parseFloat(val.toFixed(0)).toString() + ' MPN/100ml';
          } else if (seriesName && seriesName.includes('Debit')) {
            return parseFloat(val.toFixed(2)).toString() + ' M³/bulan';
          } else {
            return parseFloat(val.toFixed(1)).toString() + ' mg/l';
          }
        }
      }
    }
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
      let url = "/user/limbah-cair/data";
      let responsenya = await api.post(url, dataForm);
      
      console.log('Full Response:', responsenya.data);
      
      // Get limbah cair data from response
      let tmpDataLimbahCair = responsenya.data.data?.values || responsenya.data.data || [];
      console.log('Limbah Cair Data:', tmpDataLimbahCair);
      
      // Process data for chart - group by month and calculate averages
      const monthlyData = Array(12).fill(null).map(() => ({
        ph: [] as number[],
        bod: [] as number[],
        cod: [] as number[],
        tss: [] as number[],
        minyak_lemak: [] as number[],
        amoniak: [] as number[],
        total_coliform: [] as number[],
        debit_air_limbah: [] as number[]
      }));
      
      // Group data by month
      if (Array.isArray(tmpDataLimbahCair)) {
        tmpDataLimbahCair.forEach((item: any) => {
          const monthIndex = (parseInt(item.periode) || 1) - 1;
          if (monthIndex >= 0 && monthIndex < 12) {
            const ph = parseFloat(item.ph);
            const bod = parseFloat(item.bod);
            const cod = parseFloat(item.cod);
            const tss = parseFloat(item.tss);
            const minyakLemak = parseFloat(item.minyak_lemak);
            const amoniak = parseFloat(item.amoniak);
            const totalColiform = parseFloat(item.total_coliform);
            const debitAirLimbah = parseFloat(item.debit_air_limbah);
            
            // Only add non-zero and valid values
            if (!isNaN(ph) && ph > 0) monthlyData[monthIndex].ph.push(ph);
            if (!isNaN(bod) && bod > 0) monthlyData[monthIndex].bod.push(bod);
            if (!isNaN(cod) && cod > 0) monthlyData[monthIndex].cod.push(cod);
            if (!isNaN(tss) && tss > 0) monthlyData[monthIndex].tss.push(tss);
            if (!isNaN(minyakLemak) && minyakLemak > 0) monthlyData[monthIndex].minyak_lemak.push(minyakLemak);
            if (!isNaN(amoniak) && amoniak > 0) monthlyData[monthIndex].amoniak.push(amoniak);
            if (!isNaN(totalColiform) && totalColiform > 0) monthlyData[monthIndex].total_coliform.push(totalColiform);
            if (!isNaN(debitAirLimbah) && debitAirLimbah > 0) monthlyData[monthIndex].debit_air_limbah.push(debitAirLimbah);
          }
        });
      }
      
      // Calculate averages for each month, return null for months with no data
      const calculateAverage = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
      
      console.log('Monthly Data:', monthlyData);
      
      // Format data untuk ApexCharts menggunakan data yang sudah diproses
      const allSeries = [
        {
          name: "pH",
          data: monthlyData.map(month => calculateAverage(month.ph)),
          color: '#FF6B6B'
        },
        {
          name: "BOD (mg/l)",
          data: monthlyData.map(month => calculateAverage(month.bod)),
          color: '#4ECDC4'
        },
        {
          name: "COD (mg/l)",
          data: monthlyData.map(month => calculateAverage(month.cod)),
          color: '#45B7D1'
        },
        {
          name: "TSS (mg/l)",
          data: monthlyData.map(month => calculateAverage(month.tss)),
          color: '#96CEB4'
        },
        {
          name: "Minyak & Lemak (mg/l)",
          data: monthlyData.map(month => calculateAverage(month.minyak_lemak)),
          color: '#FFEAA7'
        },
        {
          name: "Amoniak (mg/l)",
          data: monthlyData.map(month => calculateAverage(month.amoniak)),
          color: '#DDA0DD'
        },
        {
          name: "Total Coliform (MPN/100ml)",
          data: monthlyData.map(month => calculateAverage(month.total_coliform)),
          color: '#FFA07A'
        },
        {
          name: "Debit Air Limbah (M³/bulan)",
          data: monthlyData.map(month => calculateAverage(month.debit_air_limbah)),
          color: '#20B2AA'
        }
      ];
      
      // Filter out series that have no data (all null values)
      const validatedDataLimbahCair = allSeries.filter(series => 
        series.data.some(value => value !== null && value !== undefined)
      );
      
      console.log('Validated Data for Chart:', validatedDataLimbahCair);
       setSeriesLimbahCair(validatedDataLimbahCair);
      
      // Set chart title and message
      const currentYear = form.tahun || new Date().getFullYear().toString();
      const hasData = tmpDataLimbahCair && Array.isArray(tmpDataLimbahCair) && tmpDataLimbahCair.length > 0;
      
      let tmpPesan = "";
      let tmpJudulChartLimbahCair = "";
      
      if (hasData) {
        tmpPesan = `Data limbah cair ditemukan untuk tahun ${currentYear}`;
        tmpJudulChartLimbahCair = `Parameter Limbah Cair Tahun ${currentYear}\n${userLoginStore.user?.nama_user || 'User'}`;
        setLapor(true);
      } else {
        tmpPesan = `Belum ada data limbah cair untuk tahun ${currentYear}`;
        tmpJudulChartLimbahCair = `Parameter Limbah Cair Tahun ${currentYear}\n${userLoginStore.user?.nama_user || 'User'}`;
        setLapor(false);
      }
      
      setPesan(tmpPesan);
      setJudulChartLimbahCair(tmpJudulChartLimbahCair);
      console.log(responsenya);
      console.log(tmpJudulChartLimbahCair);
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
    <MainLayout title={"Dashboard Limbah Cair"}>
      <Spin spinning={globalStore.isloading}>
        <h2>Laporan Limbah Cair</h2>

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
                  options={optionsLimbahCair}
                  type="bar"
                  width={chartWidth}
                  height={chartHeight}
                  series={seriesLimbahCair}
                />
              )}
            </Col>
          </Row>
          
          {/* Legend dengan Batas Maksimum */}
          <div style={{ marginTop: 20, maxWidth: '800px', width: '100%' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Keterangan Parameter dan Batas Maksimum</h3>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8} lg={6}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ width: '20px', height: '20px', backgroundColor: '#FF6B6B', marginRight: '8px', borderRadius: '3px' }}></div>
                  <span><strong>pH:</strong> Batas 6-9</span>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ width: '20px', height: '20px', backgroundColor: '#4ECDC4', marginRight: '8px', borderRadius: '3px' }}></div>
                  <span><strong>BOD:</strong> Max 30 mg/l</span>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ width: '20px', height: '20px', backgroundColor: '#45B7D1', marginRight: '8px', borderRadius: '3px' }}></div>
                  <span><strong>COD:</strong> Max 100 mg/l</span>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ width: '20px', height: '20px', backgroundColor: '#96CEB4', marginRight: '8px', borderRadius: '3px' }}></div>
                  <span><strong>TSS:</strong> Max 30 mg/l</span>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ width: '20px', height: '20px', backgroundColor: '#FFEAA7', marginRight: '8px', borderRadius: '3px' }}></div>
                  <span><strong>Minyak & Lemak:</strong> Max 5 mg/l</span>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ width: '20px', height: '20px', backgroundColor: '#DDA0DD', marginRight: '8px', borderRadius: '3px' }}></div>
                  <span><strong>Amoniak:</strong> Max 10 mg/l</span>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ width: '20px', height: '20px', backgroundColor: '#FFA07A', marginRight: '8px', borderRadius: '3px' }}></div>
                  <span><strong>Total Coliform:</strong> Max 3000 MPN/100ml</span>
                </div>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ width: '20px', height: '20px', backgroundColor: '#20B2AA', marginRight: '8px', borderRadius: '3px' }}></div>
                  <span><strong>Debit Air Limbah:</strong> M³/bulan</span>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </Spin>
    </MainLayout>
  );
};

export default DashboardLimbahCairPage;