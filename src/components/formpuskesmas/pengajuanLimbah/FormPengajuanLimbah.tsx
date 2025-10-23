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
  Tag,
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
import router from "next/router";
import { useGlobalStore } from "@/stores/globalStore";
import apifile from "@/utils/HttpRequestFile";
import { useNotification } from "@/utils/Notif";
import { useUserLoginStore } from "@/stores/userLoginStore";

const { RangePicker } = DatePicker;

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

const props: UploadProps = {
  name: "file",
  action: "https://www.mocky.io/v2/5cc8019d300000980a055e76",
  multiple: true,
  headers: {
    authorization: "authorization-text",
  },
  onChange(info: any) {
    if (info.file.status !== "uploading") {
      console.log(info.file, info.fileList);
    }
    if (info.file.status === "done") {
      message.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === "error") {
      message.error(`${info.file.name} file upload failed.`);
    }
  },
};

const tabListNoTitle = [
  {
    key: "limbahPadat",
    label: "Pengolahan Limbah Kesehatan",
  },
];

type FormPengajuanLimbahProps = {
  disableRedirect?: boolean;
  onSuccess?: (data?: any) => void;
  initialPeriode?: number | string;
  initialTahun?: number | string;
  lockPeriodYear?: boolean;
  onPeriodYearChange?: (periode: number | string, tahun: number | string) => void;
  deferSubmit?: boolean;
  onCollectData?: (data: FormData) => void;
  onCollectDraft?: (draft: any) => void;
  draftData?: any;
};

const FormPengajuanLimbah: React.FC<FormPengajuanLimbahProps> = ({
  disableRedirect,
  onSuccess,
  initialPeriode,
  initialTahun,
  lockPeriodYear,
  onPeriodYearChange,
  deferSubmit,
  onCollectData,
  onCollectDraft,
  draftData,
}) => {
  const globalStore = useGlobalStore();
  const userLoginStore = useUserLoginStore();
  const [formListKey, setFormListKey] = useState(new Date().toISOString());
  const laporanBulananStore = useLaporanBulananStore();
  const [linkUploadManifest, setlinkUploadManifest] = useState("");
  const [linkUploadLogbook, setlinkLogbook] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [linkUploadLabLain, setlinkLabLain] = useState("");
  const [linkUploadLingkungan, setlinkDokLingkungan] = useState("");
  const [linkUploadSwaPantau, setlinkSwaPantau] = useState("");
  const [linkUploadUjiLabCair, setlinkUjiLabCair] = useState("");
  const [transporterOptions, setTransporterOptions] = useState<
    { value: string; label: React.ReactNode; id_transporter: number; name: string; status?: string; disabled?: boolean }[]
  >([]);
  const [selectedTransporter, setSelectedTransporter] = useState<number | null>(
    null
  );
  const { showNotification, contextHolder } = useNotification();

  const getTransporterData = async () => {
    try {
      const response = await api.post("/user/transporter/data");
      const responseData = response.data?.data?.values ?? [];
      
      // Process the transporter data into the expected format
      const processedOptions = responseData.map((transporter: any) => {
        // Determine Active/Expired from MOU expiry flag
        const mouFlag = transporter.masa_berlaku_sudah_berakhir; // values: 'belum', '1bulan', 'harih'
        const isExpired = mouFlag === 'harih' || (() => {
          // Fallback: compare with masa_berlaku_terakhir if flag missing
          const end = transporter.masa_berlaku_terakhir ? new Date(transporter.masa_berlaku_terakhir) : null;
          return end ? Date.now() >= end.getTime() : false;
        })();
        const statusInfo = isExpired
          ? { text: 'Expired', color: 'red' }
          : { text: 'Active', color: 'green' };

        return {
          value: transporter.id_transporter?.toString() || '',
          label: (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{transporter.nama_transporter || 'Nama tidak tersedia'}</span>
              <Tag color={statusInfo.color}>{statusInfo.text}</Tag>
            </div>
          ),
          id_transporter: transporter.id_transporter || 0,
          name: transporter.nama_transporter || 'Nama tidak tersedia',
          status: statusInfo.text,
          disabled: false // Semua transporter tetap bisa dipilih
        };
      });
      
      setTransporterOptions(processedOptions);
      console.log("Loaded transporter options:", processedOptions);
      
    } catch (error) {
      console.error("Error fetching Transporter data:", error);
      showNotification("error", "Gagal memuat Transporter", "Tidak dapat memuat daftar transporter.");
    }
  };

  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);
  const [isCheckboxChecked1, setIsCheckboxChecked1] = useState(false);
  const [isCheckboxCheckedSyarat, setIsCheckboxCheckedSyarat] = useState(false);

  const [activeTabKey2, setActiveTabKey2] = useState<string>("limbahPadat");

  const [fileManifest, setFileManifest] = useState<UploadFile[]>([]);
  const [fileLogbook, setFileLogbook] = useState<UploadFile[]>([]);
  const [limbah_padat_kategori, setlimbah_padat_kategori] = useState<any[]>([]);
  const [limbah_padat_catatan, setlimbah_padat_catatan] = useState<any[]>([]);
  const [limbah_padat_berat, setlimbah_padat_berat] = useState<any[]>([]);

  const [limbahPadatList, setLimbahPadatList] = useState<any[]>([]);

  const [uploading, setUploading] = useState(false);

  let tmpForm = {
    oldid: "",
    periode: "",
    tahun: "",
    id_transporter: "" as string | number,
    berat_limbah_total: "",
    limbah_b3_covid: "",
    limbah_b3_nonmedis: "",
    catatan: "",
    link_input_manifest: "",
    link_input_logbook: "",
    link_input_lab_lain: "",
    link_input_dokumen_lingkungan_rs: "",
    link_input_swa_pantau: "-",
    link_input_ujilab_cair: "-",
    limbah_jarum: "-",
    limbah_padat_infeksius: "-",
    debit_limbah_cair: "", // Field untuk debit limbah cair (L)
  };

  const [form, setForm] = useState(cloneDeep(tmpForm));
  // Tambahkan state untuk precheck periode
  const [isPeriodTaken, setIsPeriodTaken] = useState(false);
  
  // Fungsi precheck duplikasi periode/tahun pada laporan bulanan
  const precheckExistingPeriod = async (
    periodeOverride?: number | string,
    tahunOverride?: number | string
  ): Promise<boolean> => {
    try {
      const pRaw = typeof periodeOverride !== 'undefined' ? periodeOverride : form.periode;
      const tRaw = typeof tahunOverride !== 'undefined' ? tahunOverride : form.tahun;
      const p = parseInt(String(pRaw));
      const t = parseInt(String(tRaw));
      // Skip jika belum lengkap atau sedang edit
      if (isNaN(p) || isNaN(t) || isEditMode) {
        setIsPeriodTaken(false);
        return false;
      }
      const resp = await api.post('/user/laporan-bulanan/data', { periode: p, tahun: t }).catch(() => null);
      const arrA = resp?.data?.data; // bentuk: data: []
      const arrB = resp?.data?.data?.values; // bentuk: data: { values: [] }
      const list = Array.isArray(arrA) ? arrA : (Array.isArray(arrB) ? arrB : []);
      const taken = Array.isArray(list) && list.length > 0;
      setIsPeriodTaken(taken);
      if (taken) {
        showNotification(
          'warning',
          'Periode sudah ada',
          'Periode yang dipilih sudah memiliki data. Silakan gunakan mode edit atau pilih periode lain.'
        );
      }
      return taken;
    } catch (err) {
      // Abaikan error silent, anggap tidak ada duplikasi
      setIsPeriodTaken(false);
      return false;
    }
  };
  
  // Trigger precheck saat periode/tahun berubah
  useEffect(() => {
    precheckExistingPeriod().catch(() => {});
  }, [form.periode, form.tahun, isEditMode]);

  const beforeUploadFileDynamic = (file: RcFile) => {
    return false;
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

  const handleChangeSelect = (val: any, name: string, event: any) => {
    const id_transporter = parseInt(val);
    setSelectedTransporter(id_transporter);
    setForm({
      ...form,
      [name]: val,
    });
  };

  const handleChangePeriode = (val: any, name: string, event: any) => {
    const id_periode = parseInt(val);
    console.log(val);
    console.log(id_periode);
    setForm({
      ...form,
      [name]: val,
    });
    // Lakukan precheck segera setelah perubahan periode
    precheckExistingPeriod(val, form.tahun).catch(() => {});
  };

  const handleSubmit = () => {
    console.log(form);
    console.log(fileLogbook);
    console.log(fileManifest);
  };

  const handleAddRowDynamic = (
    add: Function,
    key: number = -1,
    name: number = -1
  ) => {
    console.log(limbahPadatList);
    limbahPadatList.push({
      kategori: "",
      catatan: "",
      berat: "",
    });
    console.log(limbahPadatList);
    add();
    console.log("--limbahPadatList");
  };
  const handleRemoveRowDynamic = (
    remove: Function,
    key: number = -1,
    name: number = -1
  ) => {
    remove(name);

    let tmpLimbahPadatList = [...limbahPadatList];
    tmpLimbahPadatList.splice(name, 1);
    setLimbahPadatList(tmpLimbahPadatList);
  };
  const handleChangeLimbahPadatInput = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    key: number = -1,
    name: number = -1,
    isfrom: string
  ) => {
    console.log("---");
    console.log(event);
    console.log(key);
    console.log(name);
    let tmpLimbahPadatList = [...limbahPadatList];
    tmpLimbahPadatList[name][isfrom] = event.target.value;
    setLimbahPadatList(tmpLimbahPadatList);
    console.log("---[END]");
  };

  const handleNextButton = async () => {
    console.log(limbahPadatList);
    // Update the activeTabKey2 state
    setActiveTabKey2("limbahCair");
    console.log(form);
    console.log(fileLogbook);
    console.log(fileManifest);
  };

  const handleSubmitButton = async () => {
    console.log(form);
    // Validate required fields before submit to avoid 400 Bad Request
    try {
      await formInstance.validateFields();
    } catch (err) {
      showNotification("error", "Validasi Gagal", "Lengkapi semua field wajib sebelum menyimpan.");
       return;
     }

     // Cek duplikasi periode lebih awal di halaman limbah padat (bukan di lab)
     if (!isEditMode) {
       const duplicated = await precheckExistingPeriod();
       if (duplicated) {
         // Blok lanjut jika periode sudah ada
         return;
       }
     }

     // Additional guard rails for critical fields
     if (!form.id_transporter) {
      showNotification("error", "Transporter wajib", "Pilih transporter terlebih dahulu.");
       return;
     }
     if (!form.link_input_manifest || !form.link_input_logbook || !form.link_input_lab_lain) {
      showNotification("error", "Link wajib", "Isi link Manifest, Logbook, dan Hasil Lab Lain.");
       return;
     }

     let dataForm: any = new FormData();
     dataForm.append("oldid", form.oldid);
     dataForm.append("id_transporter", form.id_transporter);
     
     // Add nama_transporter to save transporter name in database
      const selectedTransporterOption = transporterOptions.find(
        (option) => option.value === form.id_transporter.toString()
      );
      if (selectedTransporterOption) {
       dataForm.append("nama_transporter", selectedTransporterOption.name);
       console.log("Sending nama_transporter:", selectedTransporterOption.label);
     } else {
       console.log("No transporter option found for ID:", form.id_transporter);
       console.log("Available transporter options:", transporterOptions);
     }
    // dataForm.append("nama_pemusnah", form.namapemusnah);
    // dataForm.append("metode_pemusnah", form.metodepemusnah);
    dataForm.append("berat_limbah_total", form.berat_limbah_total);
    // dataForm.append("punya_penyimpanan_tps", form.statustps);
    // dataForm.append("ukuran_penyimpanan_tps", form.ukurantps);
    // dataForm.append("punya_pemusnahan_sendiri", form.statuspemusnah);
    // dataForm.append("ukuran_pemusnahan_sendiri", form.ukuranpemusnah);
    dataForm.append("limbah_b3_covid", form.limbah_b3_covid);
    dataForm.append("limbah_b3_nonmedis", form.limbah_b3_nonmedis);
    dataForm.append("limbah_b3_medis", "0"); // Field untuk limbah B3 medis
    dataForm.append("limbah_sludge_ipal", "0"); // Field untuk limbah sludge IPAL
    dataForm.append("debit_limbah_cair", form.debit_limbah_cair); // Field untuk debit limbah cair (L)
    dataForm.append("catatan", form.catatan);
    dataForm.append("tahun", parseInt(form.tahun));
    dataForm.append("periode", parseInt(form.periode));
    dataForm.append("link_input_manifest", form.link_input_manifest);
    dataForm.append("link_input_logbook", form.link_input_logbook);
    dataForm.append("link_input_lab_lain", form.link_input_lab_lain);
    dataForm.append(
      "link_input_dokumen_lingkungan_rs",
      form.link_input_dokumen_lingkungan_rs
    );
    dataForm.append("link_input_swa_pantau", "--");
    dataForm.append("link_input_ujilab_cair", "--");
    dataForm.append("limbah_jarum", form.limbah_jarum);
    dataForm.append("limbah_padat_infeksius", form.limbah_padat_infeksius);

    limbahPadatList.forEach((val, index) => {
      dataForm.append("limbah_padat_kategori[]", val.kategori);
      dataForm.append("limbah_padat_catatan[]", val.catatan);
      dataForm.append("limbah_padat_berat[]", val.berat);
      console.log(val);
      // return;
    });

    let url = "/user/laporan-bulanan/create";
    if (router.query.action == "edit") {
      url = "/user/laporan-bulanan/update";
    }

    try {
      // Jika diminta menunda submit, kumpulkan data dan jangan panggil API
      if (deferSubmit) {
        // Lakukan cek duplikasi dulu agar blokir alur wizard jika periode sudah terpakai
        const duplicated = await precheckExistingPeriod();
        if (duplicated) {
          return;
        }
        showNotification("info", "Draft disiapkan", "Data Limbah B3 akan disimpan saat submit laporan lab.");
        if (onCollectData) { try { onCollectData(dataForm); } catch {} }
        if (onCollectDraft) { try { onCollectDraft(form); } catch {} }
        if (onSuccess) { try { onSuccess(); } catch {} }
        if (onPeriodYearChange) { try { onPeriodYearChange(form.periode, form.tahun); } catch {} }
        return; 
      }
      if (globalStore.setLoading) globalStore.setLoading(true);
      let responsenya = await api.post(url, dataForm);
       // Tampilkan notifikasi langsung
       const serverMsg = (responsenya?.data?.message) ? responsenya.data.message : "Berhasil tambah laporan.!";
       showNotification("success", "Sukses", serverMsg);
        // Simpan flash notif untuk ditampilkan di halaman daftar setelah redirect
        try {
          if (typeof window !== 'undefined') {
            const flash = { type: "success", title: "Sukses", desc: serverMsg, duration: 5 };
            sessionStorage.setItem("flashNotif", JSON.stringify(flash));
          }
        } catch {}
       if (onSuccess) { try { onSuccess(responsenya?.data); } catch {} }
        if (onPeriodYearChange) {
          try { onPeriodYearChange(form.periode, form.tahun); } catch {}
        }
     } catch (e) {
       console.error(e);
       const status = (e as any)?.response?.status;
       const message = (e as any)?.response?.data?.message || "Gagal menyimpan laporan.";
       const details = (e as any)?.response?.data?.data;
       if (status === 400) {
         // Show validation error details if available
         const fields = details ? Object.keys(details).join(", ") : "Form tidak sesuai";
        showNotification("error", "Validasi Tidak Sesuai", `${message}${details ? ` (Field: ${fields})` : ''}`);
       } else {
        showNotification("error", "Error", message);
       }
     } finally {
       if (globalStore.setLoading) globalStore.setLoading(false);
     }
   };

  const handlePreviousButton = () => {
    // Update the activeTabKey2 state
    setActiveTabKey2("limbahPadat");
  };

  const [formInstance] = Form.useForm();

  const getListHere = async () => {
    let lengthList = laporanBulananStore.b3padat?.length ?? 0;
    let arrList = [];
    for (let index = 0; index < lengthList; index++) {
      // const element = array[index];
      if (laporanBulananStore.b3padat) {
        let val = laporanBulananStore.b3padat[index];
        arrList.push({
          kategori: val.kategori,
          catatan: val.catatan,
          berat: val.total,
        });
      }
    }
    console.log(arrList);
    setLimbahPadatList(arrList);
    formInstance.setFieldsValue({
      detailLimbahDynamic: arrList,
    });
  };

  const getFile = async (file: any) => {
    try {
      if (globalStore.setLoading) globalStore.setLoading(true);
      let arrname = file.split("/");
      let filename = arrname[arrname.length - 1];
      const resp = await apifile.get(
        `${file}?${Math.random().toString().replaceAll(".", "")}`,
        {
          responseType: "arraybuffer",
        }
      ); // Set responseType to 'arraybuffer'
      const filenya = resp.data;
      const typefile = resp.headers["content-type"];

      // Create a Blob from the response data
      const blob = new Blob([filenya], { type: typefile });

      // Create a Blob URL
      const blobUrl = URL.createObjectURL(blob);
      return {
        uid: new Date().toISOString(),
        name: filename,
        status: "done",
        url: blobUrl,
        blob: blob,
      };
    } catch (error) {
      console.error("-- error in getfile --");
      console.error("Error fetching or processing data:", error);
    } finally {
      if (globalStore.setLoading) globalStore.setLoading(false);
    }
  };

  const getFilesManifest = async () => {
    console.log(laporanBulananStore.file_manifest);
    let lengthfile = laporanBulananStore.file_manifest?.length ?? 0;
    let arrfile = [];
    for (let index = 0; index < lengthfile; index++) {
      if (laporanBulananStore.file_manifest) {
        let val = laporanBulananStore.file_manifest[index];
        let tmpfile = await getFile(val.file1);
        arrfile.push(tmpfile);
      }
    }
    console.log(arrfile);
    setFileManifest(arrfile as any[]);
    formInstance.setFieldsValue({
      form_manifest: arrfile,
    });
  };
  const getFilesLogbook = async () => {
    console.log(laporanBulananStore.file_logbook);
    let lengthfile = laporanBulananStore.file_logbook?.length ?? 0;
    let arrfile = [];
    for (let index = 0; index < lengthfile; index++) {
      if (laporanBulananStore.file_logbook) {
        let val = laporanBulananStore.file_logbook[index];
        let tmpfile = await getFile(val.file1);
        arrfile.push(tmpfile);
      }
    }
    console.log(arrfile);
    setFileLogbook(arrfile as any[]);
    formInstance.setFieldsValue({
      form_logbook: arrfile,
    });
  };

  useLayoutEffect(() => {
    const currentUrl = (typeof window !== 'undefined') ? window.location.href : '';
    const urlParams = new URLSearchParams((typeof window !== 'undefined') ? window.location.search : '');
    const action = urlParams.get("action");

   const user = userLoginStore.user;
    // console.log(user, "tyui");
    if (!user) {
      router.push("/");
      return;
    }
    // console.log(user.link_input_logbook);

    setlinkDokLingkungan(user.link_dokumen_lingkungan_rs);
    setlinkSwaPantau(user.link_swa_pantau);
    setlinkUjiLabCair(user.link_lab_limbah_cair);

    getTransporterData();
    console.log(transporterOptions);
    console.log(Object.values(laporanBulananStore));
    console.log(laporanBulananStore);
    console.log(router.query.action);

    // Set edit mode state
    setIsEditMode(action === "edit");

    // When coming back with a draft, do NOT reset form; hydrate from draft instead
    if (draftData) {
      const defaultYear = (draftData.tahun != null ? String(draftData.tahun) : (initialTahun != null ? String(initialTahun) : new Date().getFullYear().toString()));
      const defaultPeriod = (draftData.periode != null ? String(draftData.periode) : (initialPeriode != null ? String(initialPeriode) : (new Date().getMonth() + 1).toString()));
      const restored: any = { ...cloneDeep(tmpForm), ...draftData, tahun: defaultYear, periode: defaultPeriod };
      setForm(restored);
      setSelectedTransporter(restored.id_transporter ? parseInt(String(restored.id_transporter)) : null);
      formInstance.setFieldsValue({
        form_tahun: defaultYear,
        form_periode: defaultPeriod,
        form_transporter: restored.id_transporter ? String(restored.id_transporter) : undefined,
        form_catatan: restored.catatan,
        form_link_input_manifest: restored.link_input_manifest,
        form_link_input_logbook: restored.link_input_logbook,
        form_link_input_lab_lain: restored.link_input_lab_lain,
        form_beratLimbahPadatInfeksius: restored.limbah_padat_infeksius,
        form_beratLimbahCovid: restored.limbah_b3_covid,
        form_beratLimbahNonMedis: restored.limbah_b3_nonmedis,
        form_beratLimbahJarum: restored.limbah_jarum,
        form_debitLimbah: restored.debit_limbah_cair,
        form_beratLimbah: restored.berat_limbah_total,
      });
    } else {
      // Fresh mount without draft: reset to defaults
      formInstance.resetFields();
      setForm(cloneDeep(tmpForm));
      setLimbahPadatList([]);

      const defaultYear = (initialTahun != null ? String(initialTahun) : new Date().getFullYear().toString());
      const defaultPeriod = (initialPeriode != null ? String(initialPeriode) : (new Date().getMonth() + 1).toString());
      formInstance.setFieldsValue({
        form_tahun: defaultYear,
        form_periode: defaultPeriod,
      });
      setForm(prev => ({
        ...prev,
        tahun: defaultYear,
        periode: defaultPeriod,
      }));
    }

    if (action === "edit") {
      console.log("masuk sini? #1");
      if (
        laporanBulananStore.id_laporan_bulanan == null ||
        laporanBulananStore.id_laporan_bulanan == 0
      ) {
        try {
          const flashPayload = {
            type: "error",
            message: "Tidak ada data untuk diedit",
            description: "Silakan pilih data yang ingin diedit dari daftar.",
          };
          sessionStorage.setItem("flashNotif", JSON.stringify(flashPayload));
        } catch (err) {}
        router.push("/dashboard/user/limbah-padat");
        return;
      }
    }
  }, []);

  // Prefill data saat edit agar nilai lama tampil
  useEffect(() => {
    const isEdit = (typeof window !== 'undefined') && new URLSearchParams(window.location.search).get("action") === "edit";
    if (!isEdit) return;
    if (!laporanBulananStore?.id_laporan_bulanan) return;

    const selectedIdTransporter = laporanBulananStore.id_transporter ? laporanBulananStore.id_transporter.toString() : "";
    const filledForm = {
      ...form,
      oldid: laporanBulananStore.id_laporan_bulanan?.toString() || "",
      id_transporter: selectedIdTransporter,
      catatan: laporanBulananStore.catatan || "",
      tahun: laporanBulananStore.tahun?.toString() || "",
      periode: laporanBulananStore.periode?.toString() || "",
      link_input_manifest: laporanBulananStore.link_input_manifest || "",
      link_input_logbook: laporanBulananStore.link_input_logbook || "",
      link_input_lab_lain: laporanBulananStore.link_input_lab_lain || "",
      link_input_dokumen_lingkungan_rs: laporanBulananStore.link_input_dokumen_lingkungan_rs || "",
      limbah_b3_covid: laporanBulananStore.limbah_b3_covid?.toString() || "",
      limbah_b3_nonmedis: laporanBulananStore.limbah_b3_nonmedis?.toString() || "",
      limbah_jarum: laporanBulananStore.limbah_jarum?.toString() || "",
      limbah_padat_infeksius: laporanBulananStore.limbah_padat_infeksius?.toString() || "",
      debit_limbah_cair: laporanBulananStore.debit_limbah_cair?.toString() || "",
      berat_limbah_total: laporanBulananStore.berat_limbah_total?.toString() || "",
    } as any;

    setForm(filledForm);
    setSelectedTransporter(parseInt(selectedIdTransporter || "0") || null);

    formInstance.setFieldsValue({
      form_transporter: selectedIdTransporter,
      form_catatan: filledForm.catatan,
      form_tahun: filledForm.tahun,
      form_periode: filledForm.periode,
      form_link_input_manifest: filledForm.link_input_manifest,
      form_link_input_logbook: filledForm.link_input_logbook,
      form_link_input_lab_lain: filledForm.link_input_lab_lain,
      form_beratLimbahPadatInfeksius: filledForm.limbah_padat_infeksius,
      form_beratLimbahCovid: filledForm.limbah_b3_covid,
      form_beratLimbahNonMedis: filledForm.limbah_b3_nonmedis,
      form_beratLimbahJarum: filledForm.limbah_jarum,
      form_debitLimbah: filledForm.debit_limbah_cair,
      form_beratLimbah: filledForm.berat_limbah_total,
    });

    // Prefill detail dan file jika tersedia
    try { getListHere(); } catch {}
    try { getFilesManifest(); } catch {}
    try { getFilesLogbook(); } catch {}

    // Izinkan transporter yang tersimpan walau status berakhir
    setTransporterOptions(prev => prev.map(opt => {
      if (opt.id_transporter === Number(selectedIdTransporter)) {
        return { ...opt, disabled: false };
      }
      return opt;
    }));
  }, [laporanBulananStore?.id_laporan_bulanan]);

  const inputStyles = {
    width: "350px",
    height: "35px",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
  };
  const inputDetailStyles = {
    width: "200px",
    height: "35px",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
  };
  const inputNumberStyles = {
    width: "70px",
    height: "35px",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
  };

  // Hitung otomatis Total Limbah B3 (berat_limbah_total) dengan pembulatan 1 desimal
  // Komponen sesuai backend: covid + nonmedis + medis(0) + jarum + sludge_ipal(0) + padat_infeksius + debit_limbah_cair
  useEffect(() => {
    const toNum = (v: any) => {
      const n = parseFloat(String(v ?? 0));
      return isNaN(n) ? 0 : n;
    };
    const totalRaw =
      toNum(form.limbah_b3_covid) +
      toNum(form.limbah_b3_nonmedis) +
      0 + // limbah_b3_medis tidak diinput di UI (default 0)
      toNum(form.limbah_jarum) +
      0 + // limbah_sludge_ipal tidak diinput di UI (default 0)
      toNum(form.limbah_padat_infeksius) +
      toNum(form.debit_limbah_cair);

    const totalRounded = Math.round(totalRaw * 100) / 100; // bulatkan ke 2 desimal
    setForm((prev) => ({ ...prev, berat_limbah_total: totalRounded }));
    try { formInstance.setFieldsValue({ form_beratLimbah: totalRounded }); } catch {}
  }, [
    form.limbah_b3_covid,
    form.limbah_b3_nonmedis,
    form.limbah_jarum,
    form.limbah_padat_infeksius,
    form.debit_limbah_cair,
  ]);

  const contentListNoTitle: Record<string, React.ReactNode> = {
    limbahPadat: (
      <Form
        form={formInstance}
        onFinish={handleSubmitButton}
        {...layout}
        name="control-hooks"
        style={{ maxWidth: 600 }}
      >
        <h2 style={{ display: "flex", justifyContent: "center" }}>
          Pencatatan Pengelolaan Limbah B3
        </h2>
        <Form.Item
          name="form_transporter"
          label="Pilih Transporter"
          initialValue={form.id_transporter}
          rules={[{ required: true }]}
        >
          <Select
            value={form.id_transporter}
            onChange={(v) => handleChangeSelect(v, "id_transporter", event)}
            placeholder="Select a option and change input text above"
            style={{ boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)" }}
            allowClear
            optionLabelProp="name"
            options={transporterOptions}
          ></Select>
        </Form.Item>

        <Divider />

        <Form.Item
          name="form_beratLimbahPadatInfeksius"
          label="Total Limbah B3 Infeksius"
          rules={[]}
        >
          <InputNumber
            onChange={(v) => handleChangeSelect(v, "limbah_padat_infeksius", event)}
            value={form.limbah_padat_infeksius}
            style={inputNumberStyles}
            min={0.0}
            defaultValue={0.0}
            step={0.1}
          />
          {"    "}
          Kg
        </Form.Item>
        <Form.Item
          name="form_beratLimbahCovid"
          label="Total Limbah Covid"
          rules={[]}
        >
          <InputNumber
            onChange={(v) => handleChangeSelect(v, "limbah_b3_covid", event)}
            value={form.limbah_b3_covid}
            style={inputNumberStyles}
            min={0.0}
            defaultValue={0.0}
            step={0.1}
          />
          {"    "}
          Kg
        </Form.Item>
        <Form.Item
          name="form_beratLimbahNonMedis"
          label="Total Limbah B3 Non Infeksius"
          rules={[]}
        >
          <InputNumber
            onChange={(v) => handleChangeSelect(v, "limbah_b3_nonmedis", event)}
            value={form.limbah_b3_nonmedis}
            style={inputNumberStyles}
            min={0.0}
            defaultValue={0.0}
            step={0.1}
          />
          {"    "}
          Kg
        </Form.Item>

        <Form.Item
          name="form_beratLimbahJarum"
          label="Total Limbah Jarum"
          rules={[]}
        >
          <InputNumber
            onChange={(v) => handleChangeSelect(v, "limbah_jarum", event)}
            value={form.limbah_jarum}
            style={inputNumberStyles}
            min={0.0}
            defaultValue={0.0}
            step={0.1}
          />
          {"    "}
          Kg
        </Form.Item>
        
        <Form.Item
          name="form_debitLimbah"
          label="Total Limbah Cair B3"
          rules={[]}
        >
          <InputNumber
            onChange={(v) => handleChangeSelect(v, "debit_limbah_cair", event)}
            value={form.debit_limbah_cair}
            style={inputNumberStyles}
            min={0.0}
            defaultValue={0.0}
            step={0.1}
          />
          {"    "}
          Kg
        </Form.Item>

        <Form.Item
          name="form_beratLimbah"
          label="Total Limbah B3"
          rules={[]}
        >
          <InputNumber
            readOnly
            value={form.berat_limbah_total}
            style={{...inputNumberStyles, backgroundColor: '#f5f5f5', cursor: 'not-allowed'}}
            min={0.0}
            step={0.1}
            precision={2}
          />
          {"    "}
          Kg
        </Form.Item>
        <Divider />

        <h3>Upload Catatan</h3>
        <Alert
          message="Perhatikan Ketentuan Upload Dokumen!"
          style={{ marginBottom: 30 }}
          description={
            <div>
              1. Silahkan Buka Google Drive Anda
              <br />
              2. Buat Folder Baru Dengan dan Berikan Penamaan Berdasarkan
              Tanggal
              <br />
              3. Lakukan Upload File Pada Direktori Yang Baru Anda Buat
              <br />
              4. <b>Copy dan Salin</b> Link Folder Baru Tersebut pada Input Text
              Link Yang Sesuai
            </div>
          }
          type="warning"
          showIcon
        />
        <Form.Item
            name="form_link_input_manifest"
            label="Link Manifest"
            rules={[
              {
                required: form.link_input_manifest.length < 1,
              },
            ]}
          >
            <Input
              onChange={handleChangeInput}
              // style={inputStyles}
              value={form.link_input_manifest}
              name="link_input_manifest"
              style={inputStyles}
            />
          </Form.Item>
        <Form.Item
          name="form_link_input_logbook"
          label="Link Logbook"
          rules={[
            {
              required: form.link_input_logbook.length < 1,
            },
          ]}
        >
          <Input
            onChange={handleChangeInput}
            style={inputStyles}
            value={form.link_input_logbook}
            name="link_input_logbook"
          />
        </Form.Item>

        <Divider />
        <h3>Upload Dokumen Tambahan</h3>
        <Form.Item
          name="form_link_input_lab_lain"
          label="Link Hasil Lab Lain"
          rules={[
            {
              required: form.link_input_lab_lain.length < 1,
            },
          ]}
        >
          <Input
            onChange={handleChangeInput}
            style={inputStyles}
            value={form.link_input_lab_lain}
            name="link_input_lab_lain"
          />
        </Form.Item>

        <Form.Item name="form_catatan" label="Catatan">
          <TextArea
            style={{
              width: 500,
              height: 75,
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
            }}
            placeholder="Masukan Catatan"
            onChange={handleChangeInput}
            name="catatan"
            value={form.catatan}
          />
        </Form.Item>

        <Divider />

        <Form.Item {...tailLayout}>
          <Space>
            <Button
              size="large"
              type="primary"
              htmlType="submit"
              icon={<CheckCircleOutlined />}
              style={{
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
              }}
            >
              {deferSubmit ? 'Berikutnya' : 'Submit'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    ),
  };

  return (
    <> 
      {contextHolder}
      <Form form={formInstance}>
        <br />
        <Space wrap>
          <Form.Item
            name="form_periode"
            initialValue={form.periode}
            rules={[{ required: true }]}
            label="Periode"
          >
            <Select
              value={form.periode}
              placeholder="Pilih Bulan Periode"
              onChange={(v) => handleChangePeriode(v, "periode", event)}
              style={{ width: 200 }}
              disabled={isEditMode}
              // onChange={handleChange}
              options={[
                { value: "1", label: "Januari" },
                { value: "2", label: "Februari" },
                { value: "3", label: "Maret" },
                { value: "4", label: "April" },
                { value: "5", label: "Mei" },
                { value: "6", label: "Juni" },
                { value: "7", label: "Juli" },
                { value: "8", label: "Agustus" },
                { value: "9", label: "September" },
                { value: "10", label: "Oktober" },
                { value: "11", label: "November" },
                { value: "12", label: "Desember" },
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
              disabled={isEditMode || !!lockPeriodYear}
            />
          </Form.Item>
        </Space>
      </Form>
      <Card
        style={{ width: "100%" }}
        tabList={tabListNoTitle}
        activeTabKey={activeTabKey2}
      >
        <div style={{ display: "flex", justifyContent: "center" }}>
          {contentListNoTitle[activeTabKey2]}
        </div>
      </Card>
    </>
  );
};

export default FormPengajuanLimbah;
