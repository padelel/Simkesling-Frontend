import React, { useEffect, useMemo, useCallback } from "react";
import { useState } from "react";
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
  message,
} from "antd";
import dynamic from "next/dynamic";
import api from "@/utils/HttpRequest";
import { useGlobalStore } from "@/stores/globalStore";

// Lazy load chart component for better performance
const Chart = dynamic(() => import("react-apexcharts"), { 
  ssr: false,
  loading: () => <div style={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Chart...</div>
});

// Types for better type safety
interface LimbahCairData {
  periode: string;
  tahun: string;
  ph: string;
  bod: string;
  cod: string;
  tss: string;
  minyak_lemak: string;
  amoniak: string;
  total_coliform: string;
  debit_air_limbah: string;
}

interface ChartSeries {
  name: string;
  data: (number | null)[];
  color: string;
}

interface MonthlyData {
  ph: number[];
  bod: number[];
  cod: number[];
  tss: number[];
  minyak_lemak: number[];
  amoniak: number[];
  total_coliform: number[];
  debit_air_limbah: number[];
}

const DashboardLimbahCairPage: React.FC = () => {
  const globalStore = useGlobalStore();
  const userLoginStore = useUserLoginStore();
  
  // State management
  const [pesan, setPesan] = useState("");
  const [judulChart, setJudulChart] = useState("");
  const [lapor, setLapor] = useState(false);
  const [series, setSeries] = useState<ChartSeries[]>([]);
  const [chartWidth, setChartWidth] = useState(700);
  const [chartHeight, setChartHeight] = useState(400);

  const [formInstance] = Form.useForm();

  // Form state
  const [form, setForm] = useState({
    tahun: new Date().getFullYear().toString(),
  });

  // Add state for tracking current date to detect changes
  const [currentDate, setCurrentDate] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  // Memoized constants to prevent recreation on every render
  const defaultSeriesTemplate = useMemo(() => [
    { name: "pH", data: [] as (number | null)[], color: '#FF6B6B' },
    { name: "BOD (mg/l)", data: [] as (number | null)[], color: '#4ECDC4' },
    { name: "COD (mg/l)", data: [] as (number | null)[], color: '#45B7D1' },
    { name: "TSS (mg/l)", data: [] as (number | null)[], color: '#96CEB4' },
    { name: "Minyak & Lemak (mg/l)", data: [] as (number | null)[], color: '#FFEAA7' },
    { name: "Amoniak (mg/l)", data: [] as (number | null)[], color: '#DDA0DD' },
    { name: "Total Coliform (MPN/100ml)", data: [] as (number | null)[], color: '#FFA07A' },
    { name: "Debit Air Limbah (M³/bulan)", data: [] as (number | null)[], color: '#20B2AA' },
  ], []);

  // Add state to store original data for detailed tooltips
  const [originalData, setOriginalData] = useState<LimbahCairData[]>([]);

  // Create options with proper structure to avoid hasOwnProperty issues
  const getChartOptions = () => {
    return {
      chart: {
        id: "limbah-cair-bar",
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
            // Removed total calculation
          }
        },
      },
      dataLabels: {
        enabled: false, // Disable data labels to reduce clutter
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
        offsetY: 40
      },
      fill: {
        opacity: 1
      },
      tooltip: {
        shared: true,
        intersect: false,
        custom: function({ series, seriesIndex, dataPointIndex, w }: any) {
          const monthNames = [
            "Januari", "Februari", "Maret", "April", "Mei", "Juni",
            "Juli", "Agustus", "September", "Oktober", "November", "Desember"
          ];
          
          const monthName = monthNames[dataPointIndex];
          const monthNumber = dataPointIndex + 1;
          
          // Find the original data for this month
          const monthData = originalData.find(item => 
            parseInt(item.periode) === monthNumber && 
            parseInt(item.tahun) === parseInt(form.tahun)
          );
          
          if (!monthData) {
            return `
              <div style="padding: 12px; background: white; border: 1px solid #ccc; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                <div style="font-weight: bold; margin-bottom: 8px; color: #333; border-bottom: 1px solid #eee; padding-bottom: 4px;">
                  ${monthName} ${form.tahun}
                </div>
                <div style="color: #666; font-style: italic;">
                  Tidak ada data laporan untuk bulan ini
                </div>
              </div>
            `;
          }
          
          return `
            <div style="padding: 12px; background: white; border: 1px solid #ccc; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); max-width: 300px;">
              <div style="font-weight: bold; margin-bottom: 8px; color: #333; border-bottom: 1px solid #eee; padding-bottom: 4px;">
                Detail Laporan ${monthName} ${form.tahun}
              </div>
              <div style="font-size: 12px; line-height: 1.4;">
                <div style="margin-bottom: 4px;"><strong>pH:</strong> ${monthData.ph || 'N/A'}</div>
                <div style="margin-bottom: 4px;"><strong>BOD:</strong> ${monthData.bod || 'N/A'} mg/l</div>
                <div style="margin-bottom: 4px;"><strong>COD:</strong> ${monthData.cod || 'N/A'} mg/l</div>
                <div style="margin-bottom: 4px;"><strong>TSS:</strong> ${monthData.tss || 'N/A'} mg/l</div>
                <div style="margin-bottom: 4px;"><strong>Minyak & Lemak:</strong> ${monthData.minyak_lemak || 'N/A'} mg/l</div>
                <div style="margin-bottom: 4px;"><strong>Amoniak:</strong> ${monthData.amoniak || 'N/A'} mg/l</div>
                <div style="margin-bottom: 4px;"><strong>Total Coliform:</strong> ${monthData.total_coliform || 'N/A'} MPN/100ml</div>
                <div><strong>Debit Air Limbah:</strong> ${monthData.debit_air_limbah || 'N/A'} M³/bulan</div>
              </div>
            </div>
          `;
        }
      },
      title: {
        text: String(judulChart || ''), // Ensure string type
        align: "center" as const,
      },
    };
  };

  // Optimized data processing function
  const processChartData = useCallback((data: LimbahCairData[]) => {
    console.log('Processing chart data:', data);
    console.log('Data length:', data?.length);
    console.log('Data type:', typeof data, 'Is Array:', Array.isArray(data));
    
    // Handle empty or invalid data - return default series with empty data
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.log('No data available for chart processing - returning default series');
      return defaultSeriesTemplate.map(template => ({
        ...template,
        data: Array(12).fill(null)
      }));
    }

    const monthlyData: MonthlyData[] = Array(12).fill(null).map(() => ({
      ph: [], bod: [], cod: [], tss: [],
      minyak_lemak: [], amoniak: [], total_coliform: [], debit_air_limbah: []
    }));

    // Process data efficiently
    data.forEach((item, index) => {
      console.log(`Processing item ${index}:`, item);
      
      if (!item || typeof item !== 'object') {
        console.warn('Invalid data item:', item);
        return;
      }

      // Parse periode - handle both string and number
      let periodeValue: number;
      if (typeof item.periode === 'string') {
        periodeValue = parseInt(item.periode);
      } else if (typeof item.periode === 'number') {
        periodeValue = item.periode;
      } else {
        console.warn('Invalid periode value:', item.periode);
        return;
      }
      
      const monthIndex = periodeValue - 1;
      
      console.log(`Item ${index} - periode: ${item.periode}, parsed: ${periodeValue}, monthIndex: ${monthIndex}`);
      
      if (monthIndex >= 0 && monthIndex < 12) {
        // Parse all parameter values with better error handling
        const parseValue = (value: any): number => {
          if (value === null || value === undefined || value === '') return 0;
          const parsed = parseFloat(value);
          return isNaN(parsed) ? 0 : parsed;
        };

        const values = {
          ph: parseValue(item.ph),
          bod: parseValue(item.bod),
          cod: parseValue(item.cod),
          tss: parseValue(item.tss),
          minyak_lemak: parseValue(item.minyak_lemak),
          amoniak: parseValue(item.amoniak),
          total_coliform: parseValue(item.total_coliform),
          debit_air_limbah: parseValue(item.debit_air_limbah)
        };

        console.log(`Parsed values for month ${monthIndex + 1}:`, values);

        // Add all values to monthly data
        Object.entries(values).forEach(([key, value]) => {
          monthlyData[monthIndex][key as keyof MonthlyData].push(value);
        });
        
        console.log(`Monthly data for month ${monthIndex + 1} after adding:`, monthlyData[monthIndex]);
      } else {
        console.warn(`Invalid month index ${monthIndex} for periode ${periodeValue}`);
      }
    });

    console.log('Final monthly data after processing all items:', monthlyData);

    // Calculate averages efficiently
    const calculateAverage = (arr: number[]) => {
      if (arr.length === 0) return null;
      const sum = arr.reduce((a, b) => a + b, 0);
      const avg = sum / arr.length;
      console.log(`Calculating average for array [${arr.join(', ')}] = ${avg}`);
      return avg;
    };

    const allSeries = defaultSeriesTemplate.map((template, index) => {
      const parameterKey = Object.keys(monthlyData[0])[index] as keyof MonthlyData;
      const seriesData = monthlyData.map(month => calculateAverage(month[parameterKey]));
      
      console.log(`Series ${template.name} (${parameterKey}):`, seriesData);
      console.log(`Series ${template.name} has data:`, seriesData.some(val => val !== null));
      
      return {
        ...template,
        data: seriesData
      };
    });

    console.log('Generated series:', allSeries);
    console.log('Chart has data:', allSeries.some(series => series.data.some(val => val !== null)));
    
    // Always return all series, even if they have no data
    return allSeries;
  }, [defaultSeriesTemplate]);

  // Form change handlers
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
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  // Main data fetching function
  const hitDashboard = async () => {
    if (globalStore.setLoading) globalStore.setLoading(true);
    
    try {
      const dataForm = new FormData();
      dataForm.append("tahun", form.tahun);
      
      console.log('Sending request with tahun:', form.tahun);
      const responsenya = await api.post("/user/limbah-cair/data", dataForm);
      
      // Debug: Log the full response structure
      console.log('Full API Response:', responsenya);
      console.log('Response data:', responsenya.data);
      
      // Fix: Handle the correct API response structure
      let tmpDataLimbahCair: LimbahCairData[] = [];
      
      if (responsenya.data?.data?.values) {
        tmpDataLimbahCair = Array.isArray(responsenya.data.data.values) 
          ? responsenya.data.data.values 
          : [];
      } else if (responsenya.data?.values) {
        tmpDataLimbahCair = Array.isArray(responsenya.data.values) 
          ? responsenya.data.values 
          : [];
      } else if (Array.isArray(responsenya.data?.data)) {
        tmpDataLimbahCair = responsenya.data.data;
      } else {
        tmpDataLimbahCair = [];
      }
      
      console.log('Processed tmpDataLimbahCair:', tmpDataLimbahCair);
      console.log('Is array?', Array.isArray(tmpDataLimbahCair));
      console.log('Length:', tmpDataLimbahCair.length);

      // Store original data for tooltip
      setOriginalData(tmpDataLimbahCair);

      // Process and update chart data
      console.log('About to process chart data with:', tmpDataLimbahCair);
      const processedSeries = processChartData(tmpDataLimbahCair);
      console.log('Processed Series:', processedSeries);
      console.log('Series Length:', processedSeries.length);
      
      // Check if any series has data
      const hasData = processedSeries.some(series => 
        series.data.some(value => value !== null && value !== undefined)
      );
      console.log('Chart has data:', hasData);
      
      setSeries(processedSeries);

      // Update reporting status and messages
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = form.tahun;
      
      // Ensure tmpDataLimbahCair is an array before using find
      const currentMonthReport = Array.isArray(tmpDataLimbahCair) 
        ? tmpDataLimbahCair.find((item) => 
            parseInt(item.periode) === currentMonth && parseInt(item.tahun) === parseInt(currentYear)
          )
        : null;
      
      const sudahLapor = !!currentMonthReport;
      const laporanPeriodeNama = new Date(0, currentMonth - 1).toLocaleString('id', { month: 'long' });
      
      // Set messages and titles
      let tmpPesan = "";
      let tmpJudulChart = "";
      if (sudahLapor) {
        tmpPesan = `Anda Sudah Mengisi Laporan Pada Periode ${laporanPeriodeNama} ${currentYear}`;
        tmpJudulChart = `Parameter Limbah Cair Tahun ${currentYear}
       ${userLoginStore.user?.nama_user}`;
      } else {
        tmpPesan = `Anda Belum Mengisi Laporan Pada Periode ${laporanPeriodeNama} ${currentYear}`;
        tmpJudulChart = `Parameter Limbah Cair Tahun ${currentYear}
       ${userLoginStore.user?.nama_user}`;
      }
      
      setPesan(tmpPesan);
      setJudulChart(tmpJudulChart);
      setLapor(sudahLapor);
      console.log(responsenya);
      console.log(tmpJudulChart);

    } catch (e) {
      console.error(e);
    } finally {
      if (globalStore.setLoading) globalStore.setLoading(false);
    }
  };

  useEffect(() => {
    // Initialize form with current year
    const currentYear = new Date().getFullYear().toString();
    setForm(prev => ({ ...prev, tahun: currentYear }));
    formInstance.setFieldsValue({ form_tahun: currentYear });
    
    // Initial data fetch
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

    // Set up interval to check for date changes every minute
    const dateCheckInterval = setInterval(() => {
      const now = new Date();
      const newMonth = now.getMonth() + 1;
      const newYear = now.getFullYear();
      
      // Check if month or year has changed
      if (newMonth !== currentDate.month || newYear !== currentDate.year) {
        console.log('Date changed detected:', { 
          old: currentDate, 
          new: { month: newMonth, year: newYear } 
        });
        
        // Update current date state
        setCurrentDate({ month: newMonth, year: newYear });
        
        // Update form with new year if year changed
        if (newYear !== currentDate.year) {
          const newYearString = newYear.toString();
          setForm(prev => ({ ...prev, tahun: newYearString }));
          formInstance.setFieldsValue({ form_tahun: newYearString });
        }
        
        // Refresh dashboard data
        hitDashboard();
      }
    }, 60000); // Check every minute

    // Hapus event listener dan interval saat komponen dibongkar
    return () => {
      window.removeEventListener("resize", handleResize);
      clearInterval(dateCheckInterval);
    };
  }, [currentDate.month, currentDate.year]); // Add dependencies for date changes

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

        <br />

        {!lapor && (
          <Alert
            message="Pemberitahuan"
            description={pesan}
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
        {lapor && (
          <Alert
            message="Pemberitahuan"
            description={pesan}
            type="success"
            showIcon
            style={{ marginBottom: 16 }}
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
              <strong>Keterangan:</strong> Data limbah cair menggunakan berbagai satuan: pH (tanpa satuan), BOD/COD/TSS/Minyak & Lemak/Amoniak dalam <strong>mg/l</strong>, Total Coliform dalam <strong>MPN/100ml</strong>, dan Debit Air Limbah dalam <strong>M³/bulan</strong>
            </p>
          </div>
        </div>
      </Spin>
    </MainLayout>
  );
};

export default DashboardLimbahCairPage;