import React, { useEffect, useState } from "react";
import MainLayout from "@/components/MainLayout";
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Space,
  Spin,
  Table,
  Tag,
} from "antd";
import dynamic from "next/dynamic";
import cloneDeep from "clone-deep";
import api from "@/utils/HttpRequest";
import { useGlobalStore } from "@/stores/globalStore";

const DashboardAdminLimbahCairPage: React.FC = () => {
  const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
  const globalStore = useGlobalStore();
  const [tableData, setTableData] = useState<any[]>([]);
  const [formInstance] = Form.useForm();
  const [chartWidth, setChartWidth] = useState(800);
  const [chartHeight, setChartHeight] = useState(400);
  const [judulChart, setJudulChart] = useState("");
  const currentBulan = new Date().getMonth() + 1;

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  function getMonthName(month: number) {
    return monthNames[month];
  }

  const tmpSeriesLimbahCair = [
    {
      name: "Sudah Lapor Limbah Cair",
      data: Array(12).fill(0),
    },
    {
      name: "Belum Lapor Limbah Cair",
      data: Array(12).fill(0),
    },
  ];

  const [seriesLimbahCair, setSeriesLimbahCair] = useState(cloneDeep(tmpSeriesLimbahCair));

  const optionsLimbahCair = {
    chart: {
      id: "admin-limbah-cair-bar",
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
    colors: ["#2e7d32", "#d32f2f"], // Green for sudah lapor, Red for belum lapor
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
      text: `Grafik Status Pelaporan Limbah Cair Puskesmas & RS ${getMonthName(currentBulan)} ${judulChart}`,
      align: "center" as const,
    },
  };

  let tmpForm = {
    tahun: "",
    total_puskesmas_rs: 0,
    total_puskesmas_rs_sudah_lapor_limbah_cair: 0,
    total_puskesmas_rs_belum_lapor_limbah_cair: 0,
    total_transporter: 0,
  };
  const [form, setForm] = useState(cloneDeep(tmpForm));

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
      let url = "/user/dashboard-admin/limbah-cair/data";

      let responsenya = await api.post(url, dataForm);

      let tmpDataLimbahCair = cloneDeep(tmpSeriesLimbahCair);

      const sudahLaporData = responsenya.data?.data?.values?.total_chart_puskesmas_rs_sudah_lapor_limbah_cair || 
        responsenya.data?.data?.values?.total_chart_puskesmas_rs_sudah_lapor || Array(12).fill(0);

      const belumLaporData = responsenya.data?.data?.values?.total_chart_puskesmas_rs_belum_lapor_limbah_cair || 
        responsenya.data?.data?.values?.total_chart_puskesmas_rs_belum_lapor || Array(12).fill(0);

      tmpDataLimbahCair[0].data = sudahLaporData;
      tmpDataLimbahCair[1].data = belumLaporData;

      setSeriesLimbahCair(tmpDataLimbahCair);

      let tahun = responsenya.data?.data?.values?.laporan_periode_tahun;
      setJudulChart(tahun || form.tahun || new Date().getFullYear().toString());

      const updatedForm = {
        ...form,
        tahun: form.tahun,
        total_puskesmas_rs: responsenya.data?.data?.values?.total_puskesmas_rs || 0,
        total_puskesmas_rs_sudah_lapor_limbah_cair: responsenya.data?.data?.values?.total_puskesmas_rs_sudah_lapor_limbah_cair || 
          responsenya.data?.data?.values?.total_puskesmas_rs_sudah_lapor || 0,
        total_puskesmas_rs_belum_lapor_limbah_cair: responsenya.data?.data?.values?.total_puskesmas_rs_belum_lapor_limbah_cair || 
          responsenya.data?.data?.values?.total_puskesmas_rs_belum_lapor || 0,
        total_transporter: responsenya.data?.data?.values?.total_transporter || 0,
      };
      setForm(updatedForm);

      const notificationData = responsenya.data?.data?.values?.notif_user_laporan_bulanan || [];
      const transformedTableData = notificationData.map((item: any, index: number) => {
        const missingMonths = item.missing_months_cair || [];
        const reportedMonths = item.reported_months_cair || [];
        const monthNamesShort = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        const missingMonthNames = missingMonths.map((month: number) => monthNamesShort[month - 1]).join(', ');
        const reportedMonthNames = reportedMonths.map((month: number) => monthNamesShort[month - 1]).join(', ');

        const isFullyReported = missingMonths.length === 0 && reportedMonths.length === 12;
        const isPartiallyReported = reportedMonths.length > 0 && missingMonths.length > 0;
        const isNotReported = reportedMonths.length === 0;

        let statusText = '';
        let statusColor = '';

        if (isFullyReported) {
          statusText = 'Sudah Lapor Lengkap';
          statusColor = 'green';
        } else if (isPartiallyReported) {
          statusText = `Sebagian Lapor (${reportedMonths.length}/12)`;
          statusColor = 'orange';
        } else {
          statusText = 'Belum Lapor';
          statusColor = 'red';
        }

        return {
          key: index + 1,
          no: index + 1,
          namaFasilitas: item.nama_user || '-',
          jenisInstansi: item.tipe_tempat || '-',
          kecamatan: item.kecamatan || '-',
          kelurahan: item.kelurahan || '-',
          statusLaporan: statusText,
          statusColor: statusColor,
          missingCount: missingMonths.length,
          reportedCount: reportedMonths.length,
          missingMonthNames: missingMonthNames || '-',
          reportedMonthNames: reportedMonthNames || '-',
          isFullyReported,
          isPartiallyReported,
          isNotReported
        };
      });

      setTableData(transformedTableData);
    } catch (e: any) {
      console.error('LIMBAH CAIR API ERROR', e);
    } finally {
      if (globalStore.setLoading) globalStore.setLoading(false);
    }
  };

  const styleCardGraph = {
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)",
    borderRadius: "8px",
  };

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
      title: 'Status Pelaporan',
      key: 'statusLaporan',
      width: 150,
      align: 'center' as const,
      render: (record: any) => (
        <Tag color={record.statusColor}>
          {record.statusLaporan}
        </Tag>
      ),
      sorter: (a: any, b: any) => {
        const statusOrder = { 'green': 3, 'orange': 2, 'red': 1 };
        return (statusOrder[a.statusColor as keyof typeof statusOrder] || 0) - 
               (statusOrder[b.statusColor as keyof typeof statusOrder] || 0);
      },
      filters: [
        { text: 'Sudah Lapor Lengkap', value: 'green' },
        { text: 'Sebagian Lapor', value: 'orange' },
        { text: 'Belum Lapor', value: 'red' },
      ],
      onFilter: (value: any, record: any) => record.statusColor === value,
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
      title: 'Detail Bulan',
      key: 'detailBulan',
      width: 200,
      render: (record: any) => (
        <div>
          {record.reportedMonthNames && record.reportedMonthNames !== '-' && (
            <div style={{ marginBottom: '4px' }}>
              <Tag color="green" style={{ fontSize: '10px' }}>Sudah: {record.reportedMonthNames}</Tag>
            </div>
          )}
          {record.missingMonthNames && record.missingMonthNames !== '-' && (
            <div>
              <Tag color="red" style={{ fontSize: '10px' }}>Belum: {record.missingMonthNames}</Tag>
            </div>
          )}
        </div>
      ),
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
    <MainLayout title="Dashboard Admin - Limbah Cair">
      <Spin spinning={globalStore.isloading}>
        <h2>Dashboard Admin - Limbah Cair</h2>

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
                width: 350,
                backgroundColor: "#e3f2fd",
                textAlign: "center"
              }}>
              <h2 style={{ margin: 0, color: "#1976d2" }}>
                {form.total_puskesmas_rs}
              </h2>
            </Card>

            <Card
              title={`Sudah Lapor Limbah Cair ${getMonthName(currentBulan)}`}
              style={{
                width: 350,
                backgroundColor: "#e8f5e8",
                textAlign: "center"
              }}>
              <h2 style={{ margin: 0, color: "#2e7d32" }}>
                {form.total_puskesmas_rs_sudah_lapor_limbah_cair}
              </h2>
            </Card>

            <Card
              title={`Belum Lapor Limbah Cair ${getMonthName(currentBulan)}`}
              style={{
                width: 350,
                backgroundColor: "#ffebee",
                textAlign: "center"
              }}>
              <h2 style={{ margin: 0, color: "#d32f2f" }}>
                {form.total_puskesmas_rs_belum_lapor_limbah_cair}
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
                  options={optionsLimbahCair}
                  type="bar"
                  width={chartWidth}
                  height={chartHeight}
                  series={seriesLimbahCair}
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
             <strong>Keterangan:</strong> Grafik menampilkan perbandingan jumlah Puskesmas & Rumah Sakit yang <span style={{color: '#2e7d32', fontWeight: 'bold'}}>sudah melapor</span> dan <span style={{color: '#d32f2f', fontWeight: 'bold'}}>belum melapor</span> limbah cair dalam rentang satu tahun (per bulan)
           </p>
          </div>
        </div>

        {/* Table for all facilities with comprehensive reporting status */}
        <div style={{ marginTop: 40, padding: '0 20px' }}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span>Daftar Semua Rumah Sakit/Puskesmas</span>
                <Tag color="blue">{tableData.length} Total</Tag>
                <Tag color="green">{tableData.filter(item => item.isFullyReported).length} Lengkap</Tag>
                <Tag color="orange">{tableData.filter(item => item.isPartiallyReported).length} Sebagian</Tag>
                <Tag color="red">{tableData.filter(item => item.isNotReported).length} Belum</Tag>
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
                <Tag color="green">Semua Fasilitas Sudah Melaporkan Lengkap</Tag>
                <p style={{ marginTop: '10px', fontSize: '14px' }}>
                  Semua puskesmas dan rumah sakit telah melaporkan limbah cair secara lengkap
                </p>
              </div>
            )}
          </Card>
        </div>
      </Spin>
    </MainLayout>
  );
};

export default DashboardAdminLimbahCairPage;