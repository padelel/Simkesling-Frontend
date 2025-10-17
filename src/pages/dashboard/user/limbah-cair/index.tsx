import MainLayout from "@/components/MainLayout";
import {
  Button,
  Space,
  Modal,
  Input,
  Col,
  Row,
  Tag,
} from "antd";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Notif from "@/utils/Notif";
import { Table } from "antd";
import type { ColumnsType, TableProps } from "antd/es/table";
import api from "../../../../utils/HttpRequest";
import {
  EditOutlined,
  EyeOutlined,
  ExclamationCircleFilled,
  ReloadOutlined,
  PlusCircleOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/router";
import { useGlobalStore } from "@/stores/globalStore";

interface DataType {
  key: React.Key;
  id: number;
  id_limbah_cair: number;
  namaTransporter: string;
  periode: string;
  tahun: string;
  volume: number;
  status: string;
  created_at: string;
  updated_at: string;
  ph?: number;
  bod?: number;
  cod?: number;
  tss?: number;
  minyak_lemak?: number;
  amoniak?: number;
  total_coliform?: number;
  debit_air_limbah?: number;
  kapasitas_ipal?: string;
}

const onChange: TableProps<DataType>["onChange"] = (
  pagination: any,
  filters: any,
  sorter: any,
  extra: any
) => {
  console.log("params", pagination, filters, sorter, extra);
};

const { confirm } = Modal;

// Function to format date with day, month name, and time
const formatDateWithDayMonthYearTime = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    
    const dayName = days[date.getDay()];
    const day = date.getDate();
    const monthName = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    
    return `${dayName}, ${day} ${monthName} ${year} ${hours}:${minutes}:${seconds}`;
  } catch (error) {
    return 'N/A';
  }
};

const Index: React.FC = () => {
  const globalStore = useGlobalStore();
  const [dataSearch, setDataSearch] = useState<DataType[]>([]);
  const [data, setData] = useState<DataType[]>([]);
  const router = useRouter();

  const columns: ColumnsType<DataType> = [
    {
      title: "Periode (Bulan)",
      dataIndex: "periode",
      sorter: (a: any, b: any) => a.periode.localeCompare(b.periode),
    },
    {
      title: "Tahun",
      dataIndex: "tahun",
      sorter: (a: any, b: any) => a.tahun.localeCompare(b.tahun),
    },
    {
      title: "Berat Limbah Total (M³/Bulan)",
      dataIndex: "volume",
      sorter: (a: any, b: any) => a.volume - b.volume,
    },
    {
      title: "Tanggal Dibuat",
      dataIndex: "created_at",
      render: (date: string) => formatDateWithDayMonthYearTime(date),
      sorter: (a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    },
    {
      title: "Tanggal Diubah",
      dataIndex: "updated_at",
      render: (date: string) => formatDateWithDayMonthYearTime(date),
      sorter: (a: any, b: any) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime(),
    },
    {
      title: "Status Kelayakan",
      dataIndex: "status",
      render: (status: string, record: any) => {
        // Validasi parameter limbah cair berdasarkan baku mutu
        const isValidPH = record.ph >= 6 && record.ph <= 9;
        const isValidBOD = record.bod <= 30;
        const isValidCOD = record.cod <= 100;
        const isValidTSS = record.tss <= 30;
        const isValidMinyakLemak = record.minyak_lemak <= 5;
        const isValidAmoniak = record.amoniak <= 10;
        const isValidTotalColiform = record.total_coliform <= 3000;
        
        // Cek apakah semua parameter memenuhi baku mutu
        const isLayak = isValidPH && isValidBOD && isValidCOD && isValidTSS && 
                        isValidMinyakLemak && isValidAmoniak && isValidTotalColiform;
        
        let color = "default";
        let text = "Data Tidak Lengkap";
        
        if (record.ph && record.bod && record.cod && record.tss && 
            record.minyak_lemak !== undefined && record.amoniak !== undefined && 
            record.total_coliform !== undefined) {
          if (isLayak) {
            color = "green";
            text = "Layak";
          } else {
            color = "red";
            text = "Tidak Layak";
          }
        } else {
          color = "orange";
          text = "Data Tidak Lengkap";
        }
        
        return (
          <Tag color={color}>{text}</Tag>
        );
      },
      sorter: (a: any, b: any) => {
        const getStatusValue = (record: any) => {
          const isValidPH = record.ph >= 6 && record.ph <= 9;
          const isValidBOD = record.bod <= 30;
          const isValidCOD = record.cod <= 100;
          const isValidTSS = record.tss <= 30;
          const isValidMinyakLemak = record.minyak_lemak <= 5;
          const isValidAmoniak = record.amoniak <= 10;
          const isValidTotalColiform = record.total_coliform <= 3000;
          
          const isLayak = isValidPH && isValidBOD && isValidCOD && isValidTSS && 
                          isValidMinyakLemak && isValidAmoniak && isValidTotalColiform;
          
          if (record.ph && record.bod && record.cod && record.tss && 
              record.minyak_lemak !== undefined && record.amoniak !== undefined && 
              record.total_coliform !== undefined) {
            return isLayak ? 2 : 1; // Layak = 2, Tidak Layak = 1
          }
          return 0; // Data Tidak Lengkap = 0
        };
        
        return getStatusValue(a) - getStatusValue(b);
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_: any, record: any) => {
        return (
          <Space size="middle">
            <Button
              icon={<EditOutlined />}
              className="btn-yellow"
              onClick={() => {
                // Store data in localStorage with proper transporter name
                const editData = {
                  ...record,
                  namaTransporter: record.namaTransporter,
                  // Ensure all necessary fields are included
                  id_transporter: record.id_transporter || record.transporter?.id_transporter,
                  periode_nama: record.periode,
                };
                localStorage.setItem('editLimbahCairData', JSON.stringify(editData));
                router.push(`/dashboard/user/limbah-cair/PageTambahLimbah?action=edit&id=${record.id}`);
              }}
            >
              Edit
            </Button>
            <Button
              icon={<EyeOutlined />}
              type="primary"
              onClick={() => router.push(`/dashboard/user/limbah-cair/PageViewLimbah?id=${record.id}`)}
            >
              View
            </Button>
          </Space>
        );
      },
    },
  ];

  const getData = async () => {
    if (globalStore.setLoading) globalStore.setLoading(true);
    try {
      const response = await api.post("/user/limbah-cair/data");
      console.log("API Response:", response.data); // Debug log
      
      // Handle different response structures
      let responseData = [];
      if (response.data.data) {
        responseData = response.data.data.values || response.data.data || [];
      } else if (response.data.values) {
        responseData = response.data.values;
      } else if (Array.isArray(response.data)) {
        responseData = response.data;
      }

      const transformedData = responseData.map((item: any) => ({
        ...item,
        key: item.id_limbah_cair?.toString() || item.id?.toString() || Math.random().toString(),
        id: item.id_limbah_cair || item.id,
        namaTransporter: item.transporter?.nama_transporter || item.nama_transporter || 'N/A',
        periode: item.periode_nama || 'N/A',
        tahun: item.tahun || 'N/A',
        volume: item.debit_air_limbah || 0,
        status: item.status || item.is_approved || 'pending',
        created_at: item.created_at || new Date().toISOString(),
        updated_at: item.updated_at || new Date().toISOString(),
        // Include parameter limbah cair for validation
        ph: parseFloat(item.ph) || null,
        bod: parseFloat(item.bod) || null,
        cod: parseFloat(item.cod) || null,
        tss: parseFloat(item.tss) || null,
        minyak_lemak: parseFloat(item.minyak_lemak) || null,
        amoniak: parseFloat(item.amoniak) || null,
        total_coliform: parseFloat(item.total_coliform) || null,
        debit_air_limbah: parseFloat(item.debit_air_limbah) || null,
        kapasitas_ipal: item.kapasitas_ipal || null,
        // Include all necessary fields for edit mode
        id_transporter: item.id_transporter,
        periode_nama: item.periode_nama,
        transporter: item.transporter,
      }));

      console.log("Transformed Data:", transformedData); // Debug log
      setData(transformedData);
      setData2(transformedData);
    } catch (error) {
      console.error("Error fetching data:", error);
      // Set empty data on error
      setData([]);
      setData2([]);
    } finally {
      if (globalStore.setLoading) globalStore.setLoading(false);
    }
  };

  // -- search -- \\
  const [search, setSearch] = useState("");
  const [data2, setData2] = useState<DataType[]>([]);
  const handleSearchInput = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    console.log(event);
    setSearch(event.target.value);
  };
  const doSearch = () => {
    const tmpData = data2.filter((val: any) => {
      if (
        val.periode.toString().toLowerCase().includes(search.toLowerCase()) ||
        val.tahun.toString().toLowerCase().includes(search.toLowerCase())
      ) {
        return true;
      }
    });
    setData(tmpData);
  };

  useEffect(() => {
    doSearch();
  }, [search]);

  useEffect(() => {
    getData();
  }, []);
  // Tampilkan flash notifikasi setelah redirect dari form
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("flash_notif");
      if (raw) {
        const payload = JSON.parse(raw);
        Notif(payload.type || "success", payload.title || "Berhasil", payload.description || "Operasi berhasil");
        sessionStorage.removeItem("flash_notif");
      }
    } catch (err) {
      console.warn("Gagal memproses flash_notif:", err);
      sessionStorage.removeItem("flash_notif");
    }
  }, []);

  return (
    <MainLayout title="Laporan Limbah Cair">
      <Row justify="end">
        <Col span={6}>
          <Input
            onChange={handleSearchInput}
            value={search}
            className="shadow-medium"
            name="search"
            placeholder="Cari Berdasarkan Periode atau Tahun"
          />
        </Col>
        <Col>
          <Button
            icon={<ReloadOutlined />}
            className="ml-15 btn-orange"
            onClick={getData}>
            Reload
          </Button>
        </Col>
      </Row>
      <div>
        <Link
          href="/dashboard/user/limbah-cair/PageTambahLimbah?action=create"
          passHref>
          <div className="flex-center">
            <Button
              type="primary"
              size="large"
              icon={<PlusCircleOutlined />}
              className="shadow-soft">
              Tambah Laporan Limbah Cair
            </Button>
          </div>
        </Link>
      </div>

      <div className="mt-20 mb-20 overflow-x-auto">
          <Table
            scroll={{ x: 800 }}
            columns={columns}
            dataSource={data}
            onChange={onChange}
          />
        </div>
    </MainLayout>
  );
};

export default Index;







