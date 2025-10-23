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

const DashboardAdminLaporanLabPage: React.FC = () => {
  const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });
  const globalStore = useGlobalStore();
  const [tableData, setTableData] = useState<any[]>([]);
  const [formInstance] = Form.useForm();
  const [chartWidth, setChartWidth] = useState(800);
  const [chartHeight, setChartHeight] = useState(400);
  const [judulChart, setJudulChart] = useState("");
  const currentBulan = new Date().getMonth() + 1;

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  function getMonthName(month: number) {
    return monthNames[month];
  }

  const tmpSeriesLaporanLab = [
    {
      name: "Sudah Lapor Lab",
      data: Array(12).fill(0),
    },
    {
      name: "Belum Lapor Lab",
      data: Array(12).fill(0),
    },
  ];

  const [seriesLaporanLab, setSeriesLaporanLab] = useState(cloneDeep(tmpSeriesLaporanLab));

  const optionsLaporanLab = {
    chart: {
      id: "admin-laporan-lab-bar",
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
        text: "Jumlah Lab",
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
      text: `Grafik Status Pelaporan Lab ${judulChart}`,
      align: "center" as const,
    },
  };

  let tmpForm = {
    tahun: new Date().getFullYear().toString(),
    total_lab: 0,
    total_lab_sudah_lapor: 0,
    total_lab_belum_lapor: 0,
    total_pemeriksaan_lab: 0,
  };
  const [form, setForm] = useState(cloneDeep(tmpForm));

  const handleChangeInput = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    console.log('🔄 Form input changed:', {
      field: event.target.name,
      value: event.target.value,
      previousForm: form
    });
    
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const hitDashboard = async () => {
    console.log('🚀 Starting dashboard API call with form data:', form);
    
    // Reset chart data setiap kali berganti bulan
    const currentMonth = new Date().getMonth();
    const lastMonth = localStorage.getItem('lastMonthLaporanLab');
    
    if (lastMonth && parseInt(lastMonth) !== currentMonth) {
      console.log('🔄 Month changed, resetting chart data');
      setSeriesLaporanLab(cloneDeep(tmpSeriesLaporanLab));
    }
    
    // Simpan bulan saat ini ke localStorage
    localStorage.setItem('lastMonthLaporanLab', currentMonth.toString());
    
    if (globalStore.setLoading) globalStore.setLoading(true);
    try {
      let dataForm: any = new FormData();
      dataForm.append("tahun", form.tahun);
      
      console.log('📤 Sending API request with FormData:', {
        tahun: form.tahun,
        url: "/user/dashboard-admin/laporan-lab/data"
      });
      
      let url = "/user/dashboard-admin/laporan-lab/data";
      let responsenya = await api.post(url, dataForm);
      
      console.log('📥 Raw API Response:', responsenya);
      console.log('📊 API Response Data:', responsenya.data);
      console.log('🎯 API Response Values:', responsenya.data?.data?.values);
      
      // Log specific data fields that should be available
      const values = responsenya.data?.data?.values;
      if (values) {
        console.log('📈 Chart Data Analysis:', {
          total_chart_puskesmas_rs_sudah_lapor: values.total_chart_puskesmas_rs_sudah_lapor,
          total_chart_puskesmas_rs_belum_lapor: values.total_chart_puskesmas_rs_belum_lapor,
          total_chart_rs_sudah_lapor: values.total_chart_rs_sudah_lapor,
          total_chart_rs_belum_lapor: values.total_chart_rs_belum_lapor,
          total_chart_puskesmas_sudah_lapor: values.total_chart_puskesmas_sudah_lapor,
          total_chart_puskesmas_belum_lapor: values.total_chart_puskesmas_belum_lapor,
          notif_user_laporan_bulanan: values.notif_user_laporan_bulanan
        });
        
        console.log('📊 Summary Statistics:', {
          total_puskesmas_rs: values.total_puskesmas_rs,
          total_puskesmas_rs_sudah_lapor: values.total_puskesmas_rs_sudah_lapor,
          total_puskesmas_rs_belum_lapor: values.total_puskesmas_rs_belum_lapor,
          total_rs: values.total_rs,
          total_puskesmas: values.total_puskesmas,
          laporan_periode_tahun: values.laporan_periode_tahun
        });
      } else {
        console.error('❌ No values found in API response!');
      }
      
      let tmpDataLaporanLab = cloneDeep(tmpSeriesLaporanLab);
      
      // Data untuk yang sudah lapor lab - try multiple possible field names
      const sudahLaporData = values?.total_chart_puskesmas_rs_sudah_lapor || 
                            values?.total_chart_lab_sudah_lapor || 
                            Array(12).fill(0);
      
      // Data untuk yang belum lapor lab - try multiple possible field names  
      const belumLaporData = values?.total_chart_puskesmas_rs_belum_lapor || 
                            values?.total_chart_lab_belum_lapor || 
                            Array(12).fill(0);
      
      console.log('📊 Chart Data Processing:', {
        sudahLaporData,
        belumLaporData,
        sudahLaporDataType: typeof sudahLaporData,
        belumLaporDataType: typeof belumLaporData,
        sudahLaporLength: Array.isArray(sudahLaporData) ? sudahLaporData.length : 'not array',
        belumLaporLength: Array.isArray(belumLaporData) ? belumLaporData.length : 'not array'
      });
      
      tmpDataLaporanLab[0].data = sudahLaporData;
      tmpDataLaporanLab[1].data = belumLaporData;
      
      console.log('📈 Final Chart Series Data:', tmpDataLaporanLab);
      
      setSeriesLaporanLab(tmpDataLaporanLab);
      
      // Set chart title
      let tahun = values?.laporan_periode_tahun;
      const finalTahun = tahun || form.tahun || new Date().getFullYear().toString();
      console.log('📅 Chart Title Data:', {
        fromAPI: tahun,
        fromForm: form.tahun,
        fallback: new Date().getFullYear().toString(),
        final: finalTahun
      });
      setJudulChart(finalTahun);
      
      // Update form with statistics data
      const updatedForm = {
        ...form,
        tahun: form.tahun,
        total_lab: values?.total_puskesmas_rs || 0,
        total_lab_sudah_lapor: values?.total_puskesmas_rs_sudah_lapor || 0,
        total_lab_belum_lapor: values?.total_puskesmas_rs_belum_lapor || 0,
        total_pemeriksaan_lab: values?.total_laporan_perperiode || 0,
      };
      
      console.log('📝 Form Update:', {
        previousForm: form,
        updatedForm,
        apiValues: {
          total_puskesmas_rs: values?.total_puskesmas_rs,
          total_puskesmas_rs_sudah_lapor: values?.total_puskesmas_rs_sudah_lapor,
          total_puskesmas_rs_belum_lapor: values?.total_puskesmas_rs_belum_lapor,
          total_laporan_perperiode: values?.total_laporan_perperiode
        }
      });
      
      setForm(updatedForm);
      
      // Process table data for ALL labs (both reported and not reported)
      const notificationData = values?.notif_user_laporan_bulanan || [];
      console.log('📋 Table Data Processing:', {
        notificationData,
        notificationDataLength: notificationData.length,
        notificationDataType: typeof notificationData,
        isArray: Array.isArray(notificationData)
      });
      
      // Show ALL facilities instead of filtering only those that haven't reported
      const transformedTableData = notificationData.map((item: any, index: number) => {
        const missingMonths = item.missing_months_lab || [];
        const reportedMonths = item.reported_months_lab || [];
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        const missingMonthNames = missingMonths.map((month: number) => monthNames[month - 1]).join(', ');
        const reportedMonthNames = reportedMonths.map((month: number) => monthNames[month - 1]).join(', ');
        
        // Determine status based on reporting completion
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
        
        const transformedItem = {
          key: index + 1,
          no: index + 1,
          namaLab: item.nama_lab || item.nama_user || '-',
          jenisLab: item.jenis_lab || item.tipe_tempat || '-',
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
        
        console.log('🔄 Transforming table item:', {
          originalItem: item,
          transformedItem,
          missingMonths,
          reportedMonths,
          missingMonthNames,
          reportedMonthNames,
          status: statusText
        });
        
        return transformedItem;
      });
      
      console.log('📊 Final Table Data (All Facilities):', {
        transformedTableData,
        count: transformedTableData.length,
        fullyReported: transformedTableData.filter(item => item.isFullyReported).length,
        partiallyReported: transformedTableData.filter(item => item.isPartiallyReported).length,
        notReported: transformedTableData.filter(item => item.isNotReported).length
      });
      
      setTableData(transformedTableData);
      
    } catch (e) {
      console.error('❌ API Error:', e);
      console.error('❌ Error details:', {
        message: e instanceof Error ? e.message : 'Unknown error',
        stack: e instanceof Error ? e.stack : undefined
      });
    } finally {
      if (globalStore.setLoading) globalStore.setLoading(false);
      console.log('✅ Dashboard API call completed');
    }
  };

  const styleCardGraph = {
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)",
    borderRadius: "8px",
  };

  // Table columns for labs that haven't reported
  const tableColumns = [
    {
      title: 'No',
      dataIndex: 'no',
      key: 'no',
      width: 60,
      align: 'center' as const,
    },
    {
      title: 'Nama Lab',
      dataIndex: 'namaLab',
      key: 'namaLab',
      sorter: (a: any, b: any) => a.namaLab.localeCompare(b.namaLab),
    },
    {
      title: 'Jenis Lab',
      dataIndex: 'jenisLab',
      key: 'jenisLab',
      sorter: (a: any, b: any) => a.jenisLab.localeCompare(b.jenisLab),
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
      dataIndex: 'statusLaporan',
      key: 'statusLaporan',
      width: 150,
      align: 'center' as const,
      render: (status: string, record: any) => {
        let color = 'default';
        if (record.statusColor === 'green') color = 'success';
        else if (record.statusColor === 'orange') color = 'warning';
        else if (record.statusColor === 'red') color = 'error';
        
        return <Tag color={color}>{status}</Tag>;
      },
      sorter: (a: any, b: any) => {
        // Sort by completion: Fully reported first, then partially, then not reported
        if (a.isFullyReported && !b.isFullyReported) return -1;
        if (!a.isFullyReported && b.isFullyReported) return 1;
        if (a.isPartiallyReported && b.isNotReported) return -1;
        if (a.isNotReported && b.isPartiallyReported) return 1;
        return a.reportedCount - b.reportedCount;
      },
      filters: [
        { text: 'Sudah Lapor Lengkap', value: 'fully' },
        { text: 'Sebagian Lapor', value: 'partial' },
        { text: 'Belum Lapor', value: 'none' },
      ],
      onFilter: (value: any, record: any) => {
        if (value === 'fully') return record.isFullyReported;
        if (value === 'partial') return record.isPartiallyReported;
        if (value === 'none') return record.isNotReported;
        return true;
      },
    },
    {
      title: 'Progress',
      key: 'progress',
      width: 120,
      align: 'center' as const,
      render: (record: any) => {
        let progressColor = 'default';
        if (record.reportedCount === 12) progressColor = 'success';
        else if (record.reportedCount > 0) progressColor = 'processing';
        else progressColor = 'error';
        
        return (
          <div>
            <Tag color={progressColor}>{record.reportedCount || 0}/12</Tag>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              {record.reportedCount === 12 ? 'Lengkap' : 
               record.reportedCount > 0 ? `${record.missingCount} bulan tersisa` : 
               'Belum ada laporan'}
            </div>
          </div>
        );
      },
      sorter: (a: any, b: any) => (a.reportedCount || 0) - (b.reportedCount || 0),
    },
    {
      title: 'Detail Bulan',
      key: 'monthDetails',
      width: 200,
      render: (record: any) => {
        return (
          <div>
            {record.reportedCount > 0 && (
              <div style={{ marginBottom: '4px' }}>
                <Tag color="green" style={{ fontSize: '11px' }}>Sudah: {record.reportedMonthNames}</Tag>
              </div>
            )}
            {record.missingCount > 0 && (
              <div>
                <Tag color="volcano" style={{ fontSize: '11px' }}>Belum: {record.missingMonthNames}</Tag>
              </div>
            )}
            {record.reportedCount === 0 && record.missingCount === 0 && (
              <Tag color="default" style={{ fontSize: '11px' }}>Tidak ada data</Tag>
            )}
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
    <MainLayout title="Dashboard Admin - Laporan Lab">
      <Spin spinning={globalStore.isloading}>
        <h2>Dashboard Admin - Laporan Lab</h2>

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
              title="Total Puskesmas & Rumah Sakit"
              style={{
                width: 350,
                backgroundColor: "#e3f2fd",
                textAlign: "center"
              }}>
              <h2 style={{ margin: 0, color: "#1976d2" }}>
                {(form.total_lab_sudah_lapor || 0) + (form.total_lab_belum_lapor || 0)}
              </h2>
            </Card>

            {/* <Card
              title="Total Laporan Tahunan"
              style={{
                width: 200,
                backgroundColor: "#f3e5f5",
                textAlign: "center"
              }}>
              <h2 style={{ margin: 0, color: "#7b1fa2" }}>
                {form.total_pemeriksaan_lab || 0}
              </h2>
            </Card> */}

            <Card
              title={`Sudah Lapor Laporan Lab ${getMonthName(currentBulan)}`}
              style={{
                width: 350,
                backgroundColor: "#e8f5e8",
                textAlign: "center"
              }}>
              <h2 style={{ margin: 0, color: "#2e7d32" }}>
                {form.total_lab_sudah_lapor}
              </h2>
            </Card>

            <Card
              title={`Belum Lapor Laporan Lab ${getMonthName(currentBulan)}`}
              style={{
                width: 350,
                backgroundColor: "#ffebee",
                textAlign: "center"
              }}>
              <h2 style={{ margin: 0, color: "#d32f2f" }}>
                {form.total_lab_belum_lapor}
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
                  options={optionsLaporanLab}
                  type="bar"
                  width={chartWidth}
                  height={chartHeight}
                  series={seriesLaporanLab}
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
              <strong>Keterangan:</strong> Grafik menampilkan perbandingan jumlah Lab yang <span style={{color: '#00e396', fontWeight: 'bold'}}>sudah melapor</span> dan <span style={{color: '#feb019', fontWeight: 'bold'}}>belum melapor</span> dalam rentang satu tahun (per bulan)
            </p>
          </div>
        </div>

        {/* Table for labs that haven't reported */}
        <div style={{ marginTop: 40, padding: '0 20px' }}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                  pageSize: 15,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => 
                    `${range[0]}-${range[1]} dari ${total} lab`,
                  pageSizeOptions: ['10', '15', '25', '50', '100'],
                }}
                scroll={{ x: 1000 }}
                size="middle"
              />
            ) : (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px', 
                color: '#666' 
              }}>
                <Tag color="default">Tidak Ada Data</Tag>
                <p style={{ marginTop: '10px', fontSize: '14px' }}>
                  Tidak ada data lab yang tersedia
                </p>
              </div>
            )}
          </Card>
        </div>
      </Spin>
    </MainLayout>
  );
};

export default DashboardAdminLaporanLabPage;