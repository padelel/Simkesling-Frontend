import React, { useEffect, useState } from "react";
import MainLayout from "@/components/MainLayout";
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
  Tag,
} from "antd";
import dynamic from "next/dynamic";
import cloneDeep from "clone-deep";
import api from "@/utils/HttpRequest";
import { useGlobalStore } from "@/stores/globalStore";

const DashboardAdminLimbahPadatPage: React.FC = () => {
  const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
  const globalStore = useGlobalStore();
  const [data, setData] = useState<any[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [formInstance] = Form.useForm();
  const [chartWidth, setChartWidth] = useState(800);
  const [chartHeight, setChartHeight] = useState(400);
  const [judulChart, setJudulChart] = useState("");

  const options = {
    chart: {
      id: "admin-limbah-padat-bar",
      type: 'bar' as const,
      height: 400,
      stacked: false,
      toolbar: {
        show: true
      },
      zoom: {
        enabled: true
      }
    },
    colors: ["#00e396", "#feb019"], // Green for sudah lapor, Orange for belum lapor
    xaxis: {
      categories: [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember",
      ],
    },
    yaxis: {
      title: {
        text: "Jumlah Puskesmas & RS",
      },
    },
    legend: {
      show: true,
      position: 'top' as const,
      horizontalAlign: 'center' as const,
      floating: false,
      fontSize: '14px',
      markers: {
        width: 12,
        height: 12,
        strokeWidth: 0,
        strokeColor: '#fff',
        fillColors: undefined,
        radius: 2,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        endingShape: 'rounded'
      },
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    title: {
      text: `Grafik Status Pelaporan Limbah Padat Puskesmas & RS ${judulChart}`,
      align: "center" as const,
    },
  };

  let tmpForm = {
    tahun: "",
    total_puskesmas_rs: 0,
    total_puskesmas_rs_sudah_lapor: 0,
    total_puskesmas_rs_belum_lapor: 0,
    total_transporter: 0,
  };
  const [form, setForm] = useState(cloneDeep(tmpForm));

  const tmpSeries = [
    {
      name: "Sudah Lapor Limbah Padat",
      data: Array(12).fill(0),
    },
    {
      name: "Belum Lapor Limbah Padat",
      data: Array(12).fill(0),
    },
  ];

  const [series, setSeries] = useState(cloneDeep(tmpSeries));

  const handleChangeInput = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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
      let url = "/user/dashboard-admin/limbah-padat/data";
      let responsenya = await api.post(url, dataForm);
      
      // Process response data here
      console.log('Admin Limbah Padat Data:', responsenya.data);
      
      let tmpData = cloneDeep(tmpSeries);
      
      // Data untuk yang sudah lapor limbah padat
      const sudahLaporData = responsenya.data.data.values.total_chart_puskesmas_rs_sudah_lapor_limbah_padat || 
        responsenya.data.data.values.total_chart_puskesmas_rs_sudah_lapor_padat ||
        responsenya.data.data.values.total_chart_puskesmas_rs_sudah_lapor || Array(12).fill(0);
      
      // Data untuk yang belum lapor limbah padat
      const belumLaporData = responsenya.data.data.values.total_chart_puskesmas_rs_belum_lapor_limbah_padat ||
        responsenya.data.data.values.total_chart_puskesmas_rs_belum_lapor_padat ||
        responsenya.data.data.values.total_chart_puskesmas_rs_belum_lapor || Array(12).fill(0);
      
      tmpData[0].data = sudahLaporData;
      tmpData[1].data = belumLaporData;
      
      setSeries(tmpData);
      
      // Set chart title
      let tahun = responsenya.data.data.values.laporan_periode_tahun;
      setJudulChart(tahun || form.tahun || new Date().getFullYear().toString());
      
      // Update form with statistics data
      setForm({
        ...form,
        tahun: form.tahun,
        total_puskesmas_rs: responsenya.data.data.values.total_puskesmas_rs || 0,
        total_puskesmas_rs_sudah_lapor: responsenya.data.data.values.total_puskesmas_rs_sudah_lapor_limbah_padat ||
          responsenya.data.data.values.total_puskesmas_rs_sudah_lapor_padat ||
          responsenya.data.data.values.total_puskesmas_rs_sudah_lapor || 0,
        total_puskesmas_rs_belum_lapor: responsenya.data.data.values.total_puskesmas_rs_belum_lapor_limbah_padat ||
          responsenya.data.data.values.total_puskesmas_rs_belum_lapor_padat ||
          responsenya.data.data.values.total_puskesmas_rs_belum_lapor || 0,
        total_transporter: responsenya.data.data.values.total_transporter || 0,
      });
      
      // Process table data for facilities that haven't reported solid waste
      const notificationData = responsenya.data.data.values.notif_user_laporan_bulanan || [];
      const belumLaporLimbahPadat = notificationData.filter((item: any) => {
        // Use missing_months_padat if available (from new lookup system)
        if (item.missing_months_padat && Array.isArray(item.missing_months_padat)) {
          return item.missing_months_padat.length > 0; // Has missing months
        }
        // Fallback to old logic
        return (item.sudah_lapor_limbah_padat === false || item.sudah_lapor_limbah_padat === 0) ||
               (item.sudah_lapor_padat === false || item.sudah_lapor_padat === 0) ||
               (item.sudah_lapor === false || item.sudah_lapor === 0);
      });
      
      const transformedTableData = belumLaporLimbahPadat.map((item: any, index: number) => {
        // Get missing months info
        const missingMonths = item.missing_months_padat || [];
        const reportedMonths = item.reported_months_padat || [];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        const missingMonthNames = missingMonths.map((month: number) => monthNames[month - 1]).join(', ');
        
        return {
          key: index + 1,
          no: index + 1,
          namaFasilitas: item.nama_user || '-',
          jenisInstansi: item.tipe_tempat || '-',
          kecamatan: item.kecamatan || '-',
          kelurahan: item.kelurahan || '-',
          statusLaporan: `Belum Lapor: ${missingMonthNames || 'Semua bulan'}`,
          missingCount: missingMonths.length,
          reportedCount: reportedMonths.length
        };
      });
      
      setTableData(transformedTableData);
      
    } catch (e) {
      console.error(e);
    } finally {
      if (globalStore.setLoading) globalStore.setLoading(false);
    }
  };

  const styleCardGraph = {
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)",
    borderRadius: "8px",
  };

  // Table columns for facilities that haven't reported
  const tableColumns = [
    {
      title: 'No',
      dataIndex: 'no',
      key: 'no',
      width: 60,
      align: 'center' as const,
    },
    {
      title: 'Nama Fasilitas',
      dataIndex: 'namaFasilitas',
      key: 'namaFasilitas',
      sorter: (a: any, b: any) => a.namaFasilitas.localeCompare(b.namaFasilitas),
    },
    {
      title: 'Jenis Instansi',
      dataIndex: 'jenisInstansi',
      key: 'jenisInstansi',
      sorter: (a: any, b: any) => a.jenisInstansi.localeCompare(b.jenisInstansi),
    },
    {
      title: 'Kecamatan',
      dataIndex: 'kecamatan',
      key: 'kecamatan',
      sorter: (a: any, b: any) => a.kecamatan.localeCompare(b.kecamatan),
    },
    {
      title: 'Kelurahan',
      dataIndex: 'kelurahan',
      key: 'kelurahan',
      sorter: (a: any, b: any) => a.kelurahan.localeCompare(b.kelurahan),
    },
    {
      title: 'Progress',
      key: 'progress',
      width: 120,
      align: 'center' as const,
      render: (record: any) => (
        <div>
          <Tag color="green">{record.reportedCount || 0}/12</Tag>
          <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
            {record.missingCount || 0} bulan tersisa
          </div>
        </div>
      ),
      sorter: (a: any, b: any) => (a.reportedCount || 0) - (b.reportedCount || 0),
    },
    {
      title: 'Bulan Belum Lapor',
      dataIndex: 'statusLaporan',
      key: 'statusLaporan',
      render: (status: string) => {
        const missingMonths = status.replace('Belum Lapor: ', '');
        return (
          <div>
            <Tag color="volcano">Belum Lapor</Tag>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              {missingMonths}
            </div>
          </div>
        );
      },
    },
  ];

  useEffect(() => {
    hitDashboard();

    const handleResize = () => {
      if (window.innerWidth < 700) {
        setChartWidth(300);
        setChartHeight(400);
      } else {
        setChartWidth(800);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <MainLayout title="Dashboard Admin - Limbah Padat">
      <Spin spinning={globalStore.isloading}>
        <h2>Dashboard Admin - Limbah Padat</h2>

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

        {/* Summary Cards */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: 30
        }}>
          <Space direction="horizontal" size={16} wrap>
            <Card
              title="Total Puskesmas & RS"
              style={{
                width: 200,
                backgroundColor: "#e3f2fd",
                textAlign: "center"
              }}>
              <h2 style={{ margin: 0, color: "#1976d2" }}>
                {form.total_puskesmas_rs}
              </h2>
            </Card>

            <Card
              title="Sudah Lapor Limbah Padat"
              style={{
                width: 200,
                backgroundColor: "#e8f5e8",
                textAlign: "center"
              }}>
              <h2 style={{ margin: 0, color: "#2e7d32" }}>
                {form.total_puskesmas_rs_sudah_lapor}
              </h2>
            </Card>

            <Card
              title="Belum Lapor Limbah Padat"
              style={{
                width: 200,
                backgroundColor: "#ffebee",
                textAlign: "center"
              }}>
              <h2 style={{ margin: 0, color: "#d32f2f" }}>
                {form.total_puskesmas_rs_belum_lapor}
              </h2>
            </Card>

            <Card
              title="Total Transporter"
              style={{
                width: 200,
                backgroundColor: "#fff3e0",
                textAlign: "center"
              }}>
              <h2 style={{ margin: 0, color: "#f57c00" }}>
                {form.total_transporter}
              </h2>
            </Card>
          </Space>
        </div>

        <div style={{ 
          display: "flex", 
          justifyContent: "center", 
          flexDirection: "column", 
          alignItems: "center",
          marginTop: 30 
        }}>
          <Row>
            <Col>
              <Card style={styleCardGraph}>
                <Chart
                  options={options}
                  type="bar"
                  width={chartWidth}
                  height={chartHeight}
                  series={series}
                />
              </Card>
            </Col>
          </Row>
          
          {/* Keterangan Grafik */}
          <div style={{ 
            marginTop: 20, 
            textAlign: 'center', 
            padding: '16px', 
            backgroundColor: '#f0f2f5', 
            borderRadius: '8px', 
            maxWidth: '700px',
            margin: '20px auto'
          }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
              <strong>Keterangan:</strong> Grafik menampilkan perbandingan jumlah Puskesmas & Rumah Sakit yang <span style={{color: '#00e396', fontWeight: 'bold'}}>sudah melapor</span> dan <span style={{color: '#feb019', fontWeight: 'bold'}}>belum melapor</span> limbah padat dalam rentang satu tahun (per bulan)
            </p>
          </div>
        </div>

        {/* Table for facilities that haven't reported solid waste */}
        <div style={{ marginTop: 40, padding: '0 20px' }}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Tag color="volcano">Belum Lapor</Tag>
                <span>Daftar Puskesmas & RS yang Belum Melaporkan Limbah Padat</span>
                <Tag color="blue">{tableData.length} Fasilitas</Tag>
              </div>
            }
            style={styleCardGraph}
          >
            {tableData.length > 0 ? (
              <Table
                columns={tableColumns}
                dataSource={tableData}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => 
                    `${range[0]}-${range[1]} dari ${total} fasilitas`,
                }}
                scroll={{ x: 800 }}
                size="middle"
              />
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px', 
                color: '#666' 
              }}>
                <Tag color="green">Semua Fasilitas Sudah Melaporkan</Tag>
                <p style={{ marginTop: '10px', fontSize: '14px' }}>
                  Tidak ada puskesmas atau rumah sakit yang belum melaporkan limbah padat
                </p>
              </div>
            )}
          </Card>
        </div>
      </Spin>
    </MainLayout>
  );
};

export default DashboardAdminLimbahPadatPage;