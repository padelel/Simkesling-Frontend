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
import router from "next/router";
import { useGlobalStore } from "@/stores/globalStore";
import apifile from "@/utils/HttpRequestFile";
import Notif from "@/utils/Notif";
import jwtDecode from "jwt-decode";

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

const FormPengajuanLimbah: React.FC = () => {
  const globalStore = useGlobalStore();
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
    { value: string; label: string; id_transporter: number }[]
  >([]);
  const [selectedTransporter, setSelectedTransporter] = useState<number | null>(
    null
  );

  const getTransporterData = async () => {
    try {
      const response = await api.post("/user/transporter/data");
      const responseData = response.data.data.values;

      setTransporterOptions(
        responseData.map(
          (item: { nama_transporter: string; id_transporter: number }) => ({
            value: item.id_transporter.toString(),
            label: item.nama_transporter,
            id_transporter: item.id_transporter.toString(),
          })
        )
      );
    } catch (error) {
      console.error("Error fetching Transporter data:", error);
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

  // Auto calculate total limbah B3
  useEffect(() => {
    const covid = parseFloat(form.limbah_b3_covid) || 0;
    const nonmedis = parseFloat(form.limbah_b3_nonmedis) || 0;
    const jarum = parseFloat(form.limbah_jarum) || 0;
    const infeksius = parseFloat(form.limbah_padat_infeksius) || 0;
    const cairB3 = parseFloat(form.debit_limbah_cair) || 0;
    
    const total = parseFloat((covid + nonmedis + jarum + infeksius + cairB3).toFixed(2));
    
    setForm(prev => ({
      ...prev,
      berat_limbah_total: total.toString()
    }));
    
    // Update form instance as well if it exists
    if (formInstance) {
      formInstance.setFieldsValue({
        form_beratLimbah: total.toString()
      });
    }
  }, [form.limbah_b3_covid, form.limbah_b3_nonmedis, form.limbah_jarum, form.limbah_padat_infeksius, form.debit_limbah_cair]);

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
      Notif("error", "Validasi Gagal", "Lengkapi semua field wajib sebelum menyimpan.");
      return;
    }

    // Additional guard rails for critical fields
    if (!form.id_transporter) {
      Notif("error", "Transporter wajib", "Pilih transporter terlebih dahulu.");
      return;
    }
    if (!form.link_input_manifest || !form.link_input_logbook || !form.link_input_lab_lain) {
      Notif("error", "Link wajib", "Isi link Manifest, Logbook, dan Hasil Lab Lain.");
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
       dataForm.append("nama_transporter", selectedTransporterOption.label);
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

    // fileLogbook.forEach((file, index) => {
    //   console.log(file);
    //   // return;
    //   if (file.hasOwnProperty("blob")) {
    //     // @ts-ignore
    //     dataForm.append("file_logbook[]", file.blob);
    //   } else {
    //     dataForm.append("file_logbook[]", file.originFileObj);
    //   }
    //   // console.log(file);
    // });
    // console.log(dataForm);
    // return;

    // fileManifest.forEach((file, index) => {
    //   console.log(file);
    //   // return;
    //   if (file.hasOwnProperty("blob")) {
    //     // @ts-ignore
    //     dataForm.append("file_manifest[]", file.blob);
    //   } else {
    //     dataForm.append("file_manifest[]", file.originFileObj);
    //   }
    //   // return;
    // });

    limbahPadatList.forEach((val, index) => {
      dataForm.append("limbah_padat_kategori[]", val.kategori);
      dataForm.append("limbah_padat_catatan[]", val.catatan);
      dataForm.append("limbah_padat_berat[]", val.berat);
      console.log(val);
      // return;
    });

    // let responsenya = await api.post("/user/laporan-bulanan/create", dataForm);

    let url = "/user/laporan-bulanan/create";
    if (router.query.action == "edit") {
      url = "/user/laporan-bulanan/update";
    }

    try {
      if (globalStore.setLoading) globalStore.setLoading(true);
      let responsenya = await api.post(url, dataForm);
      // Tampilkan notifikasi langsung
      const serverMsg = (responsenya?.data?.message) ? responsenya.data.message : "Berhasil tambah laporan.!";
      Notif("success", "Sukses", serverMsg);
      // Simpan flash notif untuk ditampilkan di halaman daftar setelah redirect
      try {
        if (typeof window !== 'undefined') {
          const flash = { type: "success", title: "Sukses", desc: serverMsg, duration: 5 };
          sessionStorage.setItem("flashNotif", JSON.stringify(flash));
        }
      } catch {}
      console.log(limbahPadatList);
      console.log(responsenya);
      router.push("/dashboard/user/limbah-padat");
    } catch (e) {
      console.error(e);
      const status = (e as any)?.response?.status;
      const message = (e as any)?.response?.data?.message || "Gagal menyimpan laporan.";
      const details = (e as any)?.response?.data?.data;
      if (status === 400) {
        // Show validation error details if available
        const fields = details ? Object.keys(details).join(", ") : "Form tidak sesuai";
        Notif("error", "Validasi Tidak Sesuai", `${message}${details ? ` (Field: ${fields})` : ''}`);
      } else {
        Notif("error", "Error", message);
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
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get("action");

    let token = localStorage.getItem("token");
    let user: any = jwtDecode(token ?? "");
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

    formInstance.resetFields();
    setForm(cloneDeep(tmpForm));
    setLimbahPadatList([]);

    formInstance.setFieldsValue({
      form_tahun: new Date().getFullYear(),
      form_periode: (new Date().getMonth() + 1).toString(),
    });
    setForm({
      ...form,
      tahun: new Date().getFullYear().toString(),
      periode: (new Date().getMonth() + 1).toString(),
    });

    if (action === "edit") {
      console.log("masuk sini? #1");
      if (
        laporanBulananStore.id_laporan_bulanan == null ||
        laporanBulananStore.id_laporan_bulanan == 0
      ) {
        console.log("masuk sini? #2");
        router.push("/dashboard/user/limbah-padat");
        return;
      }
      // jika edit set valuenya
      // setForm({
      //   oldid: laporanBulananStore.id_laporan_bulanan?.toString() ?? "",
      //   periode: laporanBulananStore.periode?.toString() ?? "",
      //   tahun: laporanBulananStore.tahun?.toString() ?? "",
      //   namatransporter: laporanBulananStore.id_transporter?.toString() ?? "",
      //   namapemusnah: laporanBulananStore.nama_pemusnah?.toString() ?? "",
      //   metodepemusnah: laporanBulananStore.metode_pemusnah?.toString() ?? "",
      //   statustps:
      //     laporanBulananStore.punya_penyimpanan_tps &&
      //     [1, "1"].includes(laporanBulananStore.punya_penyimpanan_tps)
      //       ? 1
      //       : 0,
      //   ukurantps: laporanBulananStore.ukuran_penyimpanan_tps?.toString() ?? "",
      //   catatanlimbahcair: laporanBulananStore.catatan?.toString() ?? "",
      // });
      // Create new form object with store data
      const editFormData = {
        oldid: laporanBulananStore.id_laporan_bulanan?.toString() ?? "",
        periode: laporanBulananStore.periode?.toString() ?? "",
        tahun: laporanBulananStore.tahun?.toString() ?? "",
        id_transporter: laporanBulananStore.id_transporter?.toString() ?? "0",
        berat_limbah_total:
          laporanBulananStore.berat_limbah_total?.toString() ?? "",
        limbah_b3_covid: laporanBulananStore.limbah_b3_covid?.toString() ?? "",
        limbah_b3_nonmedis: laporanBulananStore.limbah_b3_nonmedis?.toString() ?? "",
        catatan: laporanBulananStore.catatan?.toString() ?? "",
        link_input_manifest:
          laporanBulananStore.link_input_manifest?.toString() ?? "",
        link_input_logbook:
          laporanBulananStore.link_input_logbook?.toString() ?? "",
        link_input_lab_lain:
          laporanBulananStore.link_input_lab_lain?.toString() ?? "",
        link_input_dokumen_lingkungan_rs:
          laporanBulananStore.link_input_dokumen_lingkungan_rs?.toString() ??
          "",
        link_input_swa_pantau:
          laporanBulananStore.link_input_swa_pantau?.toString() ?? "",
        link_input_ujilab_cair:
          laporanBulananStore.link_input_ujilab_cair?.toString() ?? "",
        limbah_jarum: laporanBulananStore.limbah_jarum?.toString() ?? "",
        limbah_padat_infeksius:
          laporanBulananStore.limbah_padat_infeksius?.toString() ?? "",
        debit_limbah_cair: laporanBulananStore.debit_limbah_cair?.toString() ?? "",
      };
      
      console.log("Edit form data from store:", editFormData);
      setForm(editFormData);

      setIsCheckboxChecked(
        laporanBulananStore.punya_penyimpanan_tps &&
          [1, "1"].includes(laporanBulananStore.punya_penyimpanan_tps)
          ? true
          : false
      );
      setIsCheckboxChecked1(
        laporanBulananStore.punya_pemusnahan_sendiri &&
          [1, "1"].includes(laporanBulananStore.punya_pemusnahan_sendiri)
          ? true
          : false
      );

      const formFieldsData = {
        form_periode: laporanBulananStore.periode?.toString() ?? "",
        form_tahun: laporanBulananStore.tahun?.toString() ?? "",
        form_transporter: laporanBulananStore.id_transporter?.toString() ?? "",
        form_beratLimbah:
          laporanBulananStore.berat_limbah_total?.toString() ?? "",
        form_beratLimbahNonCovid:
          laporanBulananStore.limbah_b3_nonmedis?.toString() ?? "",
        form_beratLimbahCovid:
          laporanBulananStore.limbah_b3_covid?.toString() ?? "",
        form_beratLimbahJarum:
          laporanBulananStore.limbah_jarum?.toString() ?? "",
        form_beratLimbahCairB3:
          laporanBulananStore.limbah_cair_b3?.toString() ?? "",
        form_debitLimbah:
          laporanBulananStore.debit_limbah_cair?.toString() ?? "",
        form_catatan: laporanBulananStore.catatan?.toString() ?? "",
        form_link_input_manifest:
          laporanBulananStore.link_input_manifest?.toString() ?? "",
        form_link_input_logbook:
          laporanBulananStore.link_input_logbook?.toString() ?? "",
        form_link_input_lab_lain:
          laporanBulananStore.link_input_lab_lain?.toString() ?? "",
        form_link_input_dokumen_lingkungan_rs:
          laporanBulananStore.link_input_dokumen_lingkungan_rs?.toString() ??
          "",
        form_link_input_swa_pantau:
          laporanBulananStore.link_input_swa_pantau?.toString() ?? "",
        form_link_input_ujilab_cair:
          laporanBulananStore.link_input_ujilab_cair?.toString() ?? "",
      };

      formInstance.setFieldsValue(formFieldsData);
      
      console.log("Edit form data from store:", formFieldsData);
      setForm(editFormData);

      setIsCheckboxChecked(
        laporanBulananStore.punya_penyimpanan_tps &&
          [1, "1"].includes(laporanBulananStore.punya_penyimpanan_tps)
          ? true
          : false
      );
      setIsCheckboxChecked1(
        laporanBulananStore.punya_pemusnahan_sendiri &&
          [1, "1"].includes(laporanBulananStore.punya_pemusnahan_sendiri)
          ? true
          : false
      );

      formInstance.setFieldsValue(editFormData);

      // getFile(pengajuanTransporterStore.files);
      // getFilesManifest();
      // getFilesLogbook();
      // fileManifest;
      // fileLogbook;
      getListHere();
    }
  }, []);

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
        {/* <Form.Item
          name="form_beratLimbahNonCovid"
          label="Total Limbah NonCovid"
          rules={[]}
        >
          <InputNumber
            onChange={(v) => handleChangeSelect(v, "limbah_b3_nonmedis", event)}
                      value={form.limbah_b3_nonmedis}
            style={inputNumberStyles}
            min={0}
            defaultValue={0}
          />
          {"    "}
          Kg
        </Form.Item> */}
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
          />
          {"    "}
          Kg
        </Form.Item>
        <Divider />

        {/* <Form.List
          name="detailLimbahDynamic"
          key={formListKey}
          initialValue={limbahPadatList}>
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space
                  key={key}
                  style={{ display: "flex", marginBottom: 8 }}
                  align="baseline">
                  <Form.Item
                    {...restField}
                    name={[name, "form_kategoriLimbahPadat"]}
                    key={"form_kategoriLimbahPadat" + key}
                    // rules={[
                    //   { required: true, message: "Masukan Kategori Limbah" },
                    // ]}
                    initialValue={
                      limbahPadatList[name]
                        ? limbahPadatList[name].kategori ?? ""
                        : ""
                    }>
                    <Input
                      onChange={(v: any) =>
                        handleChangeLimbahPadatInput(v, key, name, "kategori")
                      }
                      value={
                        limbahPadatList[name]
                          ? limbahPadatList[name].kategori ?? ""
                          : ""
                      }
                      name={"kategoridetaillimbah" + key}
                      key={"kategoridetaillimbahKey" + key}
                      placeholder="Kategori"
                      style={inputDetailStyles}
                    />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "form_catatanLimbahPadat"]}
                    key={"form_catatanLimbahPadat" + key}
                    rules={[{}]}
                    initialValue={
                      limbahPadatList[name]
                        ? limbahPadatList[name].catatan ?? ""
                        : ""
                    }>
                    <Input
                      onChange={(v: any) =>
                        handleChangeLimbahPadatInput(v, key, name, "catatan")
                      }
                      value={
                        limbahPadatList[name]
                          ? limbahPadatList[name].catatan ?? ""
                          : ""
                      }
                      name={"catatandetaillimbah" + key}
                      key={"catatandetaillimbahKey" + key}
                      style={inputDetailStyles}
                      placeholder="Catatan"
                    />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "form_beratLimbahPadat"]}
                    key={"form_beratLimbahPadat" + key}
                    // rules={[
                    //   { required: true, message: "Masukan Berat Limbah" },
                    // ]}
                    initialValue={
                      limbahPadatList[name]
                        ? limbahPadatList[name].berat ?? ""
                        : ""
                    }>
                    <Input
                      onChange={(v: any) =>
                        handleChangeLimbahPadatInput(v, key, name, "berat")
                      }
                      value={
                        limbahPadatList[name]
                          ? limbahPadatList[name].berat ?? ""
                          : ""
                      }
                      name="beratdetaillimbah"
                      key={"beratdetaillimbahKey" + key}
                      placeholder="Berat"
                      style={inputDetailStyles}
                    />
                  </Form.Item>
                  <MinusCircleOutlined
                    onClick={(v) => handleRemoveRowDynamic(remove, key, name)}
                  />
                </Space>
              ))}
              <Form.Item>
                <Button
                  type="dashed"
                  onClick={() => handleAddRowDynamic(add)}
                  block
                  size="large"
                  icon={<PlusOutlined />}
                  style={{
                    backgroundColor: "#FFFF00", // Yellow color
                    borderColor: "#FFFF00", // You might also want to set the border color
                    color: "black", // Adjust text color for better visibility
                    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                  }}>
                  Klik Untuk Menambahkan Detail Limbah Padat
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>
        <Divider /> */}
        <h3>Upload Catatan</h3>
        <Alert
          message="Perhatikan Ketentuan Upload Dokumen!"
          style={{ marginBottom: 30 }}
          description={
            <div>
              1. Silahkan Klik Button Text Untuk Menuju Direktori Drive
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
            <Button
              style={{ textDecoration: "underline" }}
              onClick={() => window.open('https://drive.google.com/drive/folders/1FBbOe2WUldZlaDVidPAfl2qJ_VvyOdMZ', '_blank')}
              icon={<ExportOutlined />}
              type="link"
            >
              Klik Untuk Upload Dokumen Manifest
            </Button>
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
          <Button
            style={{ textDecoration: "underline" }}
            icon={<ExportOutlined />}
            onClick={() => window.open('https://drive.google.com/drive/folders/1LEUP32SK-sxjuoROe1NPoL0MsTqSzJ7I', '_blank')}
            type="link"
          >
            Klik Untuk Upload Dokumen Logbook
          </Button>
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
          <Button
            style={{ textDecoration: "underline" }}
            onClick={() => window.open(linkUploadLabLain, "_blank")}
            icon={<ExportOutlined />}
            type="link"
          >
            Klik Untuk Upload Dokumen Hasil Lab Lain
          </Button>
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

        {/* <Form.Item
          name="form_link_input_dokumen_lingkungan_rs"
          label="Link Dokumen Lingkungan"
          rules={[
            {
              required: form.link_input_dokumen_lingkungan_rs.length < 1,
            },
          ]}
        >
          <Input
            onChange={handleChangeInput}
            style={inputStyles}
            value={form.link_input_dokumen_lingkungan_rs}
            name="link_input_dokumen_lingkungan_rs"
          />
          <Button
            style={{ textDecoration: "underline" }}
            icon={<ExportOutlined />}
            onClick={() => window.open(linkUploadLingkungan, "_blank")}
            type="link"
          >
            Klik Untuk Upload Dokumen Uji Lingkungan
          </Button>
        </Form.Item> */}

        {/* <Form.Item
          name="form_link_input_swa_pantau"
          label="Link Dokumen SWA Pantau"
          rules={[
            {
              required: form.link_input_swa_pantau.length < 1,
            },
          ]}>
          <Input
            onChange={handleChangeInput}
            style={inputStyles}
            value={form.link_input_swa_pantau}
            name="link_input_swa_pantau"
          />
          <Button
            style={{ textDecoration: "underline" }}
            icon={<ExportOutlined />}
            onClick={() => window.open(linkUploadSwaPantau, "_blank")}
            type="link">
            Klik Untuk Upload Dokumen SWA Pantau
          </Button>
        </Form.Item>

        <Form.Item
          name="form_link_input_ujilab_cair"
          label="Link Dokumen Uji Lab Cair"
          rules={[
            {
              required: form.link_input_ujilab_cair.length < 1,
            },
          ]}>
          <Input
            onChange={handleChangeInput}
            style={inputStyles}
            value={form.link_input_ujilab_cair}
            name="link_input_ujilab_cair"
          />
          <Button
            style={{ textDecoration: "underline" }}
            icon={<ExportOutlined />}
            onClick={() => window.open(linkUploadUjiLabCair, "_blank")}
            type="link">
            Klik Untuk Upload Dokumen Uji Lab Limbah Cair
          </Button> */}
        {/* </Form.Item> */}

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
              Submit
            </Button>
          </Space>
        </Form.Item>
      </Form>
    ),
  };

  return (
    <>
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
              disabled={isEditMode}
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
