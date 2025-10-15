import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  Alert,
  Button,
  Checkbox,
  Divider,
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  Upload,
  UploadFile,
  UploadProps,
  message,
} from "antd";

import cloneDeep from "clone-deep";

import {
  LoginOutlined,
  UploadOutlined,
  PlusOutlined,
  MinusCircleOutlined,
  RightCircleOutlined,
  CheckCircleOutlined,
  ExportOutlined,
} from "@ant-design/icons";

import { DatePicker, Space } from "antd";
import type { DatePickerProps, RangePickerProps } from "antd/es/date-picker";

import { Card } from "antd";
import { RcFile } from "antd/es/upload";
import api from "@/utils/HttpRequest";
import { useLaporanBulananStore } from "@/stores/laporanBulananStore";
import router, { useRouter } from "next/router";
import { useGlobalStore } from "@/stores/globalStore";
import apifile from "@/utils/HttpRequestFile";
import Notif from "@/utils/Notif";
import jwtDecode from "jwt-decode";

const { RangePicker } = DatePicker;

const { Option } = Select;
const { TextArea } = Input;

const layout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 25 },
};

const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};

const tabListNoTitle = [
  {
    key: "limbahCair",
    label: "Detail Laporan Limbah Cair",
  },
];

const FormViewLaporanCair: React.FC = () => {
  const globalStore = useGlobalStore();
  const laporanBulananStore = useLaporanBulananStore();
  const router = useRouter();

  let tmpForm = {
    oldid: "",
    periode: "",
    tahun: "",
    nama_transporter: "",
    // Parameter limbah cair sesuai tabel
    ph: 0,
    bod: 0,
    cod: 0,
    tss: 0,
    minyak_lemak: 0,
    amoniak: 0,
    total_coliform: 0,
    debit_air_limbah: 0,
    // Links
    link_manifest: "",
    link_logbook: "",
    link_lab_ipal: "",
    link_lab_lain: "",
    link_dokumen_lingkungan_rs: "",
    link_swa_pantau: "",
    link_ujilab_cair: "",
    link_izin_transporter: "",
    link_mou_transporter: "",
    link_lab_limbah_cair: "",
    link_izin_ipal: "",
    link_izin_tps: "",
    link_ukl: "",
    link_upl: "",
    kapasitas_ipal: "",
  };

  const [form, setForm] = useState(cloneDeep(tmpForm));
  const [formInstance] = Form.useForm();



  // Fungsi untuk mengkonversi angka periode menjadi nama bulan
  const getMonthName = (periode: string | number) => {
    const monthNames = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    
    const monthIndex = parseInt(periode.toString()) - 1;
    return monthNames[monthIndex] || periode;
  };

  const getLimbahCairDetail = async (id: string) => {
    try {
      console.log("Fetching limbah cair detail for ID:", id);
      
      const formData = new FormData();
      formData.append("id_limbah_cair", id); // Use id_limbah_cair instead of id_laporan_bulanan

      const response = await api.post("/user/limbah-cair/data", formData); // Use the working endpoint
      
      console.log("API Response:", response);
      console.log("Response data:", response.data);
      
      if (response.data && (response.data.success || response.data.data)) {
        // Handle different response structures
        let data = [];
        if (response.data.data) {
          data = response.data.data.values || response.data.data || [];
        } else if (response.data.values) {
          data = response.data.values;
        } else if (Array.isArray(response.data)) {
          data = response.data;
        }
        
        console.log("Extracted data:", data);
        
        // Find the specific record by ID
        const detailData = Array.isArray(data) ? data.find(item => 
          item.id_limbah_cair == id || item.id == id
        ) : data;
        
        if (detailData) {
          console.log("Detail data:", detailData);
          
          const detailFormData = {
            ...tmpForm,
            periode: detailData.periode || new Date().getMonth() + 1,
            tahun: detailData.tahun || new Date().getFullYear(),
            nama_transporter: detailData.nama_transporter || "",
            ph: parseFloat(detailData.ph || "0"),
            bod: parseFloat(detailData.bod || "0"),
            cod: parseFloat(detailData.cod || "0"),
            tss: parseFloat(detailData.tss || "0"),
            minyak_lemak: parseFloat(detailData.minyak_lemak || "0"),
            amoniak: parseFloat(detailData.amoniak || "0"),
            total_coliform: parseFloat(detailData.total_coliform || "0"),
            debit_air_limbah: parseFloat(detailData.debit_air_limbah || "0"),
            kapasitas_ipal: detailData.kapasitas_ipal || "",
            link_lab_ipal: detailData.link_lab_ipal || "",
            link_ujilab_cair: detailData.link_ujilab_cair || "",
          };
          
          console.log("Setting form data:", detailFormData);
          setForm(detailFormData);
        } else {
          console.log("No data found in response, using fallback from store");
          // Fallback to laporanBulananStore data if API returns empty
          setForm({
            ...tmpForm,
            periode: laporanBulananStore.periode || new Date().getMonth() + 1,
            tahun: laporanBulananStore.tahun || new Date().getFullYear(),
            nama_transporter: laporanBulananStore.nama_transporter || "",
            debit_air_limbah: parseFloat(laporanBulananStore.debit_limbah_cair || "0"),
            kapasitas_ipal: laporanBulananStore.kapasitas_ipal || "",
          });
        }
      } else {
        console.log("API response not successful:", response.data);
        // Fallback to laporanBulananStore data
        setForm({
          ...tmpForm,
          periode: laporanBulananStore.periode || new Date().getMonth() + 1,
          tahun: laporanBulananStore.tahun || new Date().getFullYear(),
          nama_transporter: laporanBulananStore.nama_transporter || "",
          debit_air_limbah: parseFloat(laporanBulananStore.limbah_cair_b3 || "0"),
          kapasitas_ipal: laporanBulananStore.kapasitas_ipal || "",
        });
      }
    } catch (error) {
      console.error("Error fetching limbah cair detail:", error);
      // Fallback to laporanBulananStore data on error
      setForm({
        ...tmpForm,
        periode: laporanBulananStore.periode || new Date().getMonth() + 1,
        tahun: laporanBulananStore.tahun || new Date().getFullYear(),
        nama_transporter: laporanBulananStore.nama_transporter || "",
        debit_air_limbah: parseFloat(laporanBulananStore.limbah_cair_b3 || "0"),
        kapasitas_ipal: laporanBulananStore.kapasitas_ipal || "",
      });
    }
  };

  useLayoutEffect(() => {
    // Get ID from URL query parameters first, fallback to laporanBulananStore
    const urlId = router.query.id as string;
    const storeId = laporanBulananStore.id_limbah_cair || laporanBulananStore.id_laporan_bulanan;
    const id = urlId || storeId;
    
    console.log("ID from URL query:", urlId);
    console.log("ID from laporanBulananStore (limbah cair):", laporanBulananStore.id_limbah_cair);
    console.log("ID from laporanBulananStore (laporan bulanan):", laporanBulananStore.id_laporan_bulanan);
    console.log("Using ID:", id);
    console.log("Full laporanBulananStore:", laporanBulananStore);
    
    if (id && id !== 0 && id !== "0") {
      getLimbahCairDetail(id.toString());
    } else {
      console.log("No valid ID found, checking if we can use basic data from store");
      // Try to use data from laporanBulananStore if available
      if (laporanBulananStore.nama_transporter || laporanBulananStore.limbah_cair_b3) {
        setForm({
          ...tmpForm,
          periode: laporanBulananStore.periode || new Date().getMonth() + 1,
          tahun: laporanBulananStore.tahun || new Date().getFullYear(),
          nama_transporter: laporanBulananStore.nama_transporter || "",
          debit_air_limbah: parseFloat(laporanBulananStore.limbah_cair_b3 || "0"),
          kapasitas_ipal: laporanBulananStore.kapasitas_ipal || "",
        });
      } else {
        // Set default empty form if no data available
        setForm({
          ...tmpForm,
          periode: new Date().getMonth() + 1,
          tahun: new Date().getFullYear(),
        });
      }
    }
  }, [router.query.id, laporanBulananStore.id_limbah_cair, laporanBulananStore.id_laporan_bulanan, laporanBulananStore.nama_transporter, laporanBulananStore.limbah_cair_b3]);

  const contentListNoTitle: Record<string, React.ReactNode> = {
    limbahCair: (
      <div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <td style={{ padding: "8px", fontWeight: "bold" }}>Periode</td>
              <td style={{ padding: "8px" }}>:</td>
              <td style={{ padding: "8px" }}>{getMonthName(form.periode)}</td>
            </tr>
            <tr>
              <td style={{ padding: "8px", fontWeight: "bold" }}>Tahun</td>
              <td style={{ padding: "8px" }}>:</td>
              <td style={{ padding: "8px" }}>{form.tahun}</td>
            </tr>
            
            <tr>
              <td colSpan={3} style={{ padding: "16px 8px 8px 8px" }}>
                <strong>Parameter Limbah Cair:</strong>
              </td>
            </tr>
            
            <tr>
              <td style={{ padding: "8px", fontWeight: "bold" }}>pH</td>
              <td style={{ padding: "8px" }}>:</td>
              <td style={{ padding: "8px" }}>
                {form.ph} <span style={{ color: "#666" }}>(Kadar Maks: 6-9)</span>
              </td>
            </tr>
            <tr>
              <td style={{ padding: "8px", fontWeight: "bold" }}>BOD</td>
              <td style={{ padding: "8px" }}>:</td>
              <td style={{ padding: "8px" }}>
                {form.bod} mg/l <span style={{ color: "#666" }}>(Kadar Maks: 30 mg/l)</span>
              </td>
            </tr>
            <tr>
              <td style={{ padding: "8px", fontWeight: "bold" }}>COD</td>
              <td style={{ padding: "8px" }}>:</td>
              <td style={{ padding: "8px" }}>
                {form.cod} mg/l <span style={{ color: "#666" }}>(Kadar Maks: 100 mg/l)</span>
              </td>
            </tr>
            <tr>
              <td style={{ padding: "8px", fontWeight: "bold" }}>TSS</td>
              <td style={{ padding: "8px" }}>:</td>
              <td style={{ padding: "8px" }}>
                {form.tss} mg/l <span style={{ color: "#666" }}>(Kadar Maks: 30 mg/l)</span>
              </td>
            </tr>
            <tr>
              <td style={{ padding: "8px", fontWeight: "bold" }}>Minyak & Lemak</td>
              <td style={{ padding: "8px" }}>:</td>
              <td style={{ padding: "8px" }}>
                {form.minyak_lemak} mg/l <span style={{ color: "#666" }}>(Kadar Maks: 5 mg/l)</span>
              </td>
            </tr>
            <tr>
              <td style={{ padding: "8px", fontWeight: "bold" }}>Amoniak</td>
              <td style={{ padding: "8px" }}>:</td>
              <td style={{ padding: "8px" }}>
                {form.amoniak} mg/l <span style={{ color: "#666" }}>(Kadar Maks: 10 mg/l)</span>
              </td>
            </tr>
            <tr>
              <td style={{ padding: "8px", fontWeight: "bold" }}>Total Coliform</td>
              <td style={{ padding: "8px" }}>:</td>
              <td style={{ padding: "8px" }}>
                {form.total_coliform} MPN/100 ml <span style={{ color: "#666" }}>(Kadar Maks: 3000 MPN/100 ml)</span>
              </td>
            </tr>
            <tr>
              <td style={{ padding: "8px", fontWeight: "bold" }}>Debit Air Limbah</td>
              <td style={{ padding: "8px" }}>:</td>
              <td style={{ padding: "8px" }}>{form.debit_air_limbah} M³/bulan</td>
            </tr>
            <tr>
              <td style={{ padding: "8px", fontWeight: "bold" }}>Kapasitas IPAL</td>
              <td style={{ padding: "8px" }}>:</td>
              <td style={{ padding: "8px" }}>{form.kapasitas_ipal}</td>
            </tr>
            
            <tr>
              <td colSpan={3} style={{ padding: "16px 8px 8px 8px" }}>
                <strong>Link Dokumen:</strong>
              </td>
            </tr>
            
            <tr>
              <td style={{ padding: "8px", fontWeight: "bold" }}>Link Persetujuan Teknis</td>
              <td style={{ padding: "8px" }}>:</td>
              <td style={{ padding: "8px" }}>
                <Button
                  type="link"
                  icon={<ExportOutlined />}
                  onClick={() => window.open(form.link_lab_ipal, "_blank")}
                >
                  Buka Link
                </Button>
              </td>
            </tr>
            <tr>
              <td style={{ padding: "8px", fontWeight: "bold" }}>Link Pemeriksaan Limbah Cair</td>
              <td style={{ padding: "8px" }}>:</td>
              <td style={{ padding: "8px" }}>
                <Button
                  type="link"
                  icon={<ExportOutlined />}
                  onClick={() => window.open(form.link_ujilab_cair, "_blank")}
                >
                  Buka Link
                </Button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    ),
  };

  const [activeTabKey2, setActiveTabKey2] = useState<string>(
    tabListNoTitle[0].key
  );

  const onTab2Change = (key: string) => {
    setActiveTabKey2(key);
  };

  return (
    <>
      <Card
        style={{ width: "100%" }}
        tabList={tabListNoTitle}
        activeTabKey={activeTabKey2}
        onTabChange={onTab2Change}
      >
        <div style={{ display: "flex", justifyContent: "center" }}>
          {contentListNoTitle[activeTabKey2]}
        </div>
      </Card>
    </>
  );
};

export default FormViewLaporanCair;