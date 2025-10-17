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
  Tooltip,
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
  InfoCircleOutlined,
} from "@ant-design/icons";

import { DatePicker, Space } from "antd";
import type { DatePickerProps, RangePickerProps } from "antd/es/date-picker";

import { Card } from "antd";
import { RcFile } from "antd/es/upload";
import api from "@/utils/HttpRequest";
import { useLaporanBulananStore } from "@/stores/laporanBulananStore";
import router from "next/router";
import { useGlobalStore } from "@/stores/globalStore";
import apifile from "@/utils/HttpRequestFile";
import Notif from "@/utils/Notif";
import jwtDecode from "jwt-decode";

const { RangePicker } = DatePicker;

// Function to convert month name to number
const getMonthNumberFromName = (monthName: string): number => {
  const monthMap: { [key: string]: number } = {
    'Januari': 1,
    'Februari': 2,
    'Maret': 3,
    'April': 4,
    'Mei': 5,
    'Juni': 6,
    'Juli': 7,
    'Agustus': 8,
    'September': 9,
    'Oktober': 10,
    'November': 11,
    'Desember': 12
  };
  
  return monthMap[monthName] || 0;
};

const onChange = (
  value: DatePickerProps["value"] | RangePickerProps["value"],
  dateString: [string, string] | string
) => {
  console.log("Selected Time: ", value);
  console.log("Formatted Selected Time: ", dateString);
};

const onOk = (value: DatePickerProps["value"] | RangePickerProps["value"]) => {
  console.log("onOk: ", value);
};

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
    label: "Pengolahan Limbah Cair",
  },
];

const FormPengajuanLimbahCair: React.FC = () => {
  const globalStore = useGlobalStore();
  const [formListKey, setFormListKey] = useState(new Date().toISOString());
  const laporanBulananStore = useLaporanBulananStore();
  const [linkUploadManifest, setlinkUploadManifest] = useState("");
  const [linkUploadLogbook, setlinkLogbook] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  
  // State untuk dropdown transporter - DIHAPUS
  // const [transporterOptions, setTransporterOptions] = useState<
  //   { value: string; label: string; id_transporter: number }[]
  // >([]);
  // const [selectedTransporter, setSelectedTransporter] = useState<number | null>(null);

  let tmpForm = {
    oldid: "",
    periode: "",
    tahun: "",
    // id_transporter: "" as string | number, // DIHAPUS
    // Parameter limbah cair sesuai tabel
    ph: 0,
    bod: 0,
    cod: 0,
    tss: 0,
    minyak_lemak: 0,
    amoniak: 0,
    total_coliform: 0,
    debit_air_limbah: 0,
    // Links - hanya yang diperlukan
    link_lab_ipal: "",
    link_ujilab_cair: "",
    kapasitas_ipal: "",
  };

  const [form, setForm] = useState(cloneDeep(tmpForm));
  const [formInstance] = Form.useForm();

  const handleChangeInput = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleChangeSelect = (val: any, name: string, event: any) => {
    // Hapus logika transporter
    // if (name === "id_transporter") {
    //   const id_transporter = parseInt(val);
    //   setSelectedTransporter(id_transporter);
    // }
    
    // Ensure periode is stored as integer
    let processedVal = val;
    if (name === "periode") {
      processedVal = parseInt(val);
    }
    
    setForm({
      ...form,
      [name]: processedVal,
    });
  };

  // Fungsi untuk mengambil data transporter - DIHAPUS
  // const getTransporterData = async () => {
  //   try {
  //     if (globalStore.setLoading) globalStore.setLoading(true);
  //     const response = await api.post("/user/transporter/data");
  //     const responseData = response.data.data.values;

  //     setTransporterOptions(
  //       responseData.map(
  //         (item: { nama_transporter: string; id_transporter: number }) => ({
  //           value: item.id_transporter.toString(),
  //           label: item.nama_transporter,
  //           id_transporter: item.id_transporter,
  //         })
  //       )
  //     );
  //   } catch (error) {
  //     console.error("Error fetching transporter data:", error);
  //   } finally {
  //     if (globalStore.setLoading) globalStore.setLoading(false);
  //   }
  // };

  const handleSubmit = async () => {
    try {
      if (globalStore.setLoading) globalStore.setLoading(true);
      
      // Validasi data sebelum submit - hapus validasi transporter
      if (!form.periode || !form.tahun) {
        Notif("error", "Error!", "Periode dan Tahun harus diisi");
        return;
      }
      
      let dataForm: any = new FormData();
      dataForm.append("oldid", form.oldid || "");
      dataForm.append("periode", parseInt(form.periode).toString());
      dataForm.append("tahun", parseInt(form.tahun).toString());
      // dataForm.append("id_transporter", form.id_transporter.toString()); // DIHAPUS
      
      // Hapus logika transporter
      // const selectedTransporterOption = transporterOptions.find(
      //   (option) => option.value === form.id_transporter.toString()
      // );
      // if (selectedTransporterOption) {
      //   dataForm.append("nama_transporter", selectedTransporterOption.label);
      //   console.log("Sending nama_transporter:", selectedTransporterOption.label);
      // } else {
      //   console.log("No transporter option found for ID:", form.id_transporter);
      //   console.log("Available transporter options:", transporterOptions);
      // }
      
      // Parameter limbah cair dengan validasi
      dataForm.append("ph", (form.ph || 0).toString());
      dataForm.append("bod", (form.bod || 0).toString());
      dataForm.append("cod", (form.cod || 0).toString());
      dataForm.append("tss", (form.tss || 0).toString());
      dataForm.append("minyak_lemak", (form.minyak_lemak || 0).toString());
      dataForm.append("amoniak", (form.amoniak || 0).toString());
      dataForm.append("total_coliform", (form.total_coliform || 0).toString());
      dataForm.append("debit_air_limbah", (form.debit_air_limbah || 0).toString());
      
      // Links - hanya yang diperlukan sesuai UI terbaru
      dataForm.append("link_lab_ipal", form.link_lab_ipal || "");
      dataForm.append("link_ujilab_cair", form.link_ujilab_cair || "");
      dataForm.append("kapasitas_ipal", form.kapasitas_ipal || "");
      
      console.log("Form data being sent:", {
        oldid: form.oldid,
        periode: form.periode,
        tahun: form.tahun,
        // id_transporter: form.id_transporter, // DIHAPUS
        ph: form.ph,
        bod: form.bod,
        cod: form.cod,
        tss: form.tss,
        minyak_lemak: form.minyak_lemak,
        amoniak: form.amoniak,
        total_coliform: form.total_coliform,
        debit_air_limbah: form.debit_air_limbah
      });

      let url = "/user/limbah-cair/create";
      if (router.query.action == "edit") {
        url = "/user/limbah-cair/update";
      }

            let responsenya = await api.post(url, dataForm);
      // Tampilkan notifikasi sukses langsung
      Notif("success", "Success.!", "Berhasil Simpan Laporan Limbah Cair");
      // Simpan flash notif untuk halaman daftar setelah redirect
      try {
        const flashPayload = {
          type: "success",
          title: "Success.!",
          description: "Berhasil Simpan Laporan Limbah Cair",
        };
        sessionStorage.setItem("flash_notif", JSON.stringify(flashPayload));
      } catch (err) {
        console.warn("Gagal menyimpan flash_notif ke sessionStorage:", err);
      }
      router.push("/dashboard/user/limbah-cair");
    } catch (e) {
      console.error(e);
      Notif("error", "Error!", "Gagal menyimpan laporan limbah cair");
    } finally {
      if (globalStore.setLoading) globalStore.setLoading(false);
    }
  };

  const inputStyles = {
    width: "350px",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
  };

  const inputNumberStyles = {
    width: "350px",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
  };

  // Fungsi untuk mengambil data kapasitas IPAL dari user profile
  const getUserProfileData = async () => {
    try {
      const resp = await api.post("/user/puskesmas-rumahsakit/data-profile");
      const user = resp.data.data.data;
      
      // Set kapasitas IPAL dari data user
      if (user?.kapasitas_ipal) {
        // Jika nilai adalah "Tidak ada pemeriksaan", tetap tampilkan nilai tersebut
        const kapasitasValue = user.kapasitas_ipal;
        
        setForm(prevForm => ({
          ...prevForm,
          kapasitas_ipal: kapasitasValue
        }));
        
        // Update form instance - jika "Tidak ada pemeriksaan", set sebagai string, jika tidak set sebagai number
        if (user.kapasitas_ipal === "Tidak ada pemeriksaan") {
          formInstance.setFieldsValue({
            form_kapasitas_ipal: "Tidak ada pemeriksaan"
          });
        } else {
          formInstance.setFieldsValue({
            form_kapasitas_ipal: parseFloat(kapasitasValue) || undefined
          });
        }
      }
    } catch (error) {
      console.error("Error fetching user profile data:", error);
    }
  };

  // Fungsi untuk mengambil data edit
  const processEditData = async () => {
    const storedData = localStorage.getItem('editLimbahCairData');
    if (storedData) {
      try {
        const editData = JSON.parse(storedData);
        console.log("Edit data:", editData);
        console.log("editData.periode:", editData.periode, "type:", typeof editData.periode);
        console.log("editData.tahun:", editData.tahun, "type:", typeof editData.tahun);
        
        // Validate and parse periode and tahun
        let parsedPeriode: number;
        let parsedTahun: number;
        
        // Handle periode - could be month name string or number
        if (typeof editData.periode === 'string') {
          parsedPeriode = getMonthNumberFromName(editData.periode);
        } else {
          parsedPeriode = parseInt(editData.periode);
        }
        
        // Handle tahun - should be number
        parsedTahun = parseInt(editData.tahun);
        
        console.log("parsedPeriode:", parsedPeriode, "isNaN:", isNaN(parsedPeriode));
        console.log("parsedTahun:", parsedTahun, "isNaN:", isNaN(parsedTahun));
        
        // Set form data dari edit data (kecuali kapasitas_ipal yang diambil dari user profile)
        setForm({
          ...form,
          oldid: editData.id?.toString() || "",
          periode: isNaN(parsedPeriode) ? form.periode : parsedPeriode,
          tahun: isNaN(parsedTahun) ? form.tahun : parsedTahun,
          ph: editData.ph || "",
          bod: editData.bod || "",
          cod: editData.cod || "",
          tss: editData.tss || "",
          minyak_lemak: editData.minyak_lemak || "",
          amoniak: editData.amoniak || "",
          total_coliform: editData.total_coliform || "",
          debit_air_limbah: editData.debit_air_limbah || "",
          link_lab_ipal: editData.link_lab_ipal || "",
          link_ujilab_cair: editData.link_ujilab_cair || "",
          // kapasitas_ipal akan diambil dari getUserProfileData, bukan dari editData
        });

        // Set form instance values (kecuali kapasitas_ipal)
        formInstance.setFieldsValue({
          form_periode: isNaN(parsedPeriode) ? form.periode : parsedPeriode,
          form_tahun: isNaN(parsedTahun) ? form.tahun : parsedTahun,
          form_ph: editData.ph || "",
          form_bod: editData.bod || "",
          form_cod: editData.cod || "",
          form_tss: editData.tss || "",
          form_minyak_lemak: editData.minyak_lemak || "",
          form_amoniak: editData.amoniak || "",
          form_total_coliform: editData.total_coliform || "",
          form_debit_air_limbah: editData.debit_air_limbah || "",
          form_link_lab_ipal: editData.link_lab_ipal || "",
          form_link_ujilab_cair: editData.link_ujilab_cair || "",
          // form_kapasitas_ipal akan diset oleh getUserProfileData
        });

        // Clear localStorage after use
        localStorage.removeItem('editLimbahCairData');
        
        // Ambil data kapasitas IPAL dari user profile, bukan dari editData
        await getUserProfileData();
      } catch (error) {
        console.error("Error parsing stored data:", error);
      }
    }
  };

  // useLayoutEffect untuk load data
  useLayoutEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get("action");
    const id = urlParams.get("id");

    // Set edit mode state
    setIsEditMode(action === "edit");

    // Check if this is edit mode and if edit data exists
    if (action === "edit" && id) {
      // Check if edit data exists in localStorage
      const editData = localStorage.getItem('editLimbahCairData');
      
      if (!editData) {
        // If no edit data found on refresh, redirect to index page
        router.push('/dashboard/user/limbah-cair');
        return;
      }
    }

    // Set default periode dan tahun sesuai waktu terkini
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // Integer 1-12
    const currentYear = currentDate.getFullYear().toString();

    setForm({
      ...form,
      periode: currentMonth,
      tahun: currentYear,
    });

    formInstance.setFieldsValue({
      form_periode: currentMonth,
      form_tahun: currentYear,
    });

    if (action === "edit" && id) {
      // Jika mode edit, proses data edit dari localStorage
      processEditData();
    } else {
      // Jika bukan edit mode, ambil data kapasitas IPAL dari user profile
      getUserProfileData();
    }
  }, []);

  // useEffect untuk handle transporterOptions (DIHAPUS KARENA TIDAK DIPERLUKAN)
  // useEffect(() => {
  //   if (transporterOptions.length > 0) {
  //     processEditData();
  //   }
  // }, [transporterOptions]);

  const contentListNoTitle: Record<string, React.ReactNode> = {
    limbahCair: (
      <div>
        {/* Periode dan Tahun */}
        <Space wrap style={{ marginBottom: 20 }}>
          <Form.Item
            name="form_periode"
            rules={[{ required: true }]}
            label="Periode"
          >
            <Select
              placeholder="Pilih Bulan Periode"
              onChange={(v) => handleChangeSelect(v, "periode", event)}
              style={{ width: 200 }}
              disabled={isEditMode}
              value={form.periode}
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
          <Form.Item
            name="form_tahun"
            label="Tahun"
            rules={[{ required: true }]}
          >
            <Input
              placeholder="Masukan Tahun"
              onChange={handleChangeInput}
              value={form.tahun}
              maxLength={4}
              name="tahun"
              disabled={isEditMode}
            />
          </Form.Item>
        </Space>

        <Divider>Parameter Limbah Cair</Divider>

        <Form.Item
          name="form_ph"
          label="pH"
          rules={[{ required: true }]}
          extra="Kadar Maksimum: 6-9"
        >
          <InputNumber
            onChange={(v) => handleChangeSelect(v, "ph", event)}
            value={form.ph}
            style={inputNumberStyles}
            min={0}
            max={14}
            step={0.1}
            placeholder="pH"
          />
        </Form.Item>

        <Form.Item
          name="form_bod"
          label="BOD (mg/l)"
          rules={[{ required: true }]}
          extra="Kadar Maksimum: 30 mg/l"
        >
          <InputNumber
            onChange={(v) => handleChangeSelect(v, "bod", event)}
            value={form.bod}
            style={inputNumberStyles}
            min={0}
            step={0.1}
            placeholder="BOD"
          />
        </Form.Item>

        <Form.Item
          name="form_cod"
          label="COD (mg/l)"
          rules={[{ required: true }]}
          extra="Kadar Maksimum: 100 mg/l"
        >
          <InputNumber
            onChange={(v) => handleChangeSelect(v, "cod", event)}
            value={form.cod}
            style={inputNumberStyles}
            min={0}
            step={0.1}
            placeholder="COD"
          />
        </Form.Item>

        <Form.Item
          name="form_tss"
          label="TSS (mg/l)"
          rules={[{ required: true }]}
          extra="Kadar Maksimum: 30 mg/l"
        >
          <InputNumber
            onChange={(v) => handleChangeSelect(v, "tss", event)}
            value={form.tss}
            style={inputNumberStyles}
            min={0}
            step={0.1}
            placeholder="TSS"
          />
        </Form.Item>

        <Form.Item
          name="form_minyak_lemak"
          label="Minyak & Lemak (mg/l)"
          rules={[{ required: true }]}
          extra="Kadar Maksimum: 5 mg/l"
        >
          <InputNumber
            onChange={(v) => handleChangeSelect(v, "minyak_lemak", event)}
            value={form.minyak_lemak}
            style={inputNumberStyles}
            min={0}
            step={0.1}
            placeholder="Minyak & Lemak"
          />
        </Form.Item>

        <Form.Item
          name="form_amoniak"
          label="Amoniak (mg/l)"
          rules={[{ required: true }]}
          extra="Kadar Maksimum: 10 mg/l"
        >
          <InputNumber
            onChange={(v) => handleChangeSelect(v, "amoniak", event)}
            value={form.amoniak}
            style={inputNumberStyles}
            min={0}
            step={0.1}
            placeholder="Amoniak"
          />
        </Form.Item>

        <Form.Item
          name="form_total_coliform"
          label="Total Coliform (MPN/100 ml)"
          rules={[{ required: true }]}
          extra="Kadar Maksimum: 3000 MPN/100 ml"
        >
          <InputNumber
            onChange={(v) => handleChangeSelect(v, "total_coliform", event)}
            value={form.total_coliform}
            style={inputNumberStyles}
            min={0}
            step={1}
            placeholder="Total Coliform"
          />
        </Form.Item>

        <Form.Item
          name="form_debit_air_limbah"
          label="Debit Air Limbah (M³/bulan)"
          rules={[{ required: true }]}
        >
          <InputNumber
            onChange={(v) => handleChangeSelect(v, "debit_air_limbah", event)}
            value={form.debit_air_limbah}
            style={inputNumberStyles}
            min={0}
            step={0.1}
            placeholder="Debit Air Limbah"
          />
        </Form.Item>

        <Form.Item
          name="form_kapasitas_ipal"
          label={
            <span>
              Kapasitas IPAL (m³)
              <Tooltip title="Kapasitas IPAL diubah pada halaman profil">
                <InfoCircleOutlined style={{ marginLeft: 5, fontSize: '14px', color: '#1890ff' }} />
              </Tooltip>
            </span>
          }
          rules={[{ required: true }]}
        >
          <Input
            value={form.kapasitas_ipal}
            name="kapasitas_ipal"
            style={inputNumberStyles}
            placeholder="Data diambil dari profil user"
            disabled={true}
            readOnly={true}
          />
        </Form.Item>

        <Divider>Link Dokumen</Divider>

        <Form.Item
          name="form_link_lab_ipal"
          label="Link Persetujuan Teknis"
          rules={[{ required: true }]}
        >
          <Input
            onChange={handleChangeInput}
            value={form.link_lab_ipal}
            name="link_lab_ipal"
            style={inputStyles}
          />
        </Form.Item>

        <Form.Item
          name="form_link_ujilab_cair"
          label="Link Pemeriksaan Limbah Cair"
          rules={[{ required: true }]}
        >
          <Input
            onChange={handleChangeInput}
            value={form.link_ujilab_cair}
            name="link_ujilab_cair"
            style={inputStyles}
          />
        </Form.Item>

        <Form.Item {...tailLayout}>
          <Space>
            <Button
              size="large"
              type="primary"
              htmlType="submit"
              style={{
                backgroundColor: "#1890ff",
                borderColor: "#1890ff",
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
              }}
            >
              Simpan Laporan Limbah Cair
            </Button>
            <Button
              size="large"
              onClick={() => router.push("/dashboard/user/limbah-cair")}
              style={{
                backgroundColor: "#FFFF00",
                borderColor: "#FFFF00",
                color: "black",
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
              }}
            >
              Kembali
            </Button>
          </Space>
        </Form.Item>
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
      <Form 
        form={formInstance}
        {...layout}
        onFinish={handleSubmit}
        name="control-hooks"
      >
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
      </Form>
    </>
  );
};

export default FormPengajuanLimbahCair;
