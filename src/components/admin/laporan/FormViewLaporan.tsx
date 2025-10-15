import React, { useEffect, useLayoutEffect, useState } from "react";
import {
  Button,
  Checkbox,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  Radio,
  Row,
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
    label: "Limbah Padat",
  },
  {
    key: "limbahCair",
    label: "Limbah Cair",
  },
];

const FormViewLaporan: React.FC = () => {
  const globalStore = useGlobalStore();
  const [formListKey, setFormListKey] = useState(new Date().toISOString());
  const laporanBulananStore = useLaporanBulananStore();
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
            value: item.id_transporter,
            label: item.nama_transporter,
            id_transporter: item.id_transporter,
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
    nama_transporter: "",
    berat_limbah_total: "",
    limbah_b3_covid: "",
    limbah_b3_nonmedis: "",
    limbah_padat_infeksius: "",
    limbah_jarum: "",
    sludge_ipal: "",
    limbah_cair_b3: "",
    debit_limbah_cair: "",
    catatan: "",
    link_input_manifest: "",
    link_input_logbook: "",
    link_input_lab_ipal: "",
    link_input_lab_lain: "",
    link_input_dokumen_lingkungan_rs: "",
    // link_input_swa_pantau: "",
    // link_input_ujilab_cair: "",
  };

  const [form, setForm] = useState(cloneDeep(tmpForm));

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

  // const handleCheckboxChange = (e: any) => {
  //   const newStatus = e.target.checked ? 1 : 0; // Jika checkbox dicentang, set nilai 1. Jika tidak, set nilai 0.
  //   setForm({
  //     ...form,
  //     statustps: newStatus,
  //   });
  //   setIsCheckboxChecked(e.target.checked);
  // };

  // const handleCheckboxChange1 = (e: any) => {
  //   const newStatus1 = e.target.checked ? 1 : 0; // Jika checkbox dicentang, set nilai 1. Jika tidak, set nilai 0.
  //   setForm({
  //     ...form,
  //     statuspemusnah: newStatus1,
  //   });
  //   setIsCheckboxChecked1(e.target.checked);
  // };

  // const handleCheckboxChange2 = (e: any) => {
  //   const newStatus2 = e.target.checked ? 1 : 0; // Jika checkbox dicentang, set nilai 1. Jika tidak, set nilai 0.
  //   setForm({
  //     ...form,
  //     stastuslimbahcair: newStatus2,
  //   });
  //   setIsCheckboxCheckedSyarat(e.target.checked);
  // };

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

  // const handleSubmitButton = async () => {
  //   console.log(form);
  //   let dataForm: any = new FormData();
  //   dataForm.append("oldid", form.oldid);
  //   dataForm.append("id_transporter", form.idtransporter);
  //   dataForm.append("nama_pemusnah", form.namapemusnah);
  //   dataForm.append("metode_pemusnah", form.metodepemusnah);
  //   dataForm.append("berat_limbah_total", form.totallimbahpadat);
  //   dataForm.append("punya_penyimpanan_tps", form.statustps);
  //   dataForm.append("ukuran_penyimpanan_tps", form.ukurantps);
  //   dataForm.append("punya_pemusnahan_sendiri", form.statuspemusnah);
  //   dataForm.append("ukuran_pemusnahan_sendiri", form.ukuranpemusnah);
  //   dataForm.append("limbah_b3_covid", form.totallimbahcovid);
  //   dataForm.append("limbah_b3_noncovid", form.totallimbahnoncovid);
  //   dataForm.append("debit_limbah_cair", form.debitlimbahcair);
  //   dataForm.append("kapasitas_ipal", form.kapasitasinpal);
  //   dataForm.append("memenuhi_syarat", form.stastuslimbahcair);
  //   dataForm.append("catatan", form.catatanlimbahcair);
  //   dataForm.append("periode", parseInt(form.periode));
  //   dataForm.append("tahun", form.tahun);

  //   fileLogbook.forEach((file, index) => {
  //     console.log(file);
  //     // return;
  //     if (file.hasOwnProperty("blob")) {
  //       // @ts-ignore
  //       dataForm.append("file_logbook[]", file.blob);
  //     } else {
  //       dataForm.append("file_logbook[]", file.originFileObj);
  //     }
  //     // console.log(file);
  //   });
  //   // console.log(dataForm);
  //   // return;

  //   fileManifest.forEach((file, index) => {
  //     console.log(file);
  //     // return;
  //     if (file.hasOwnProperty("blob")) {
  //       // @ts-ignore
  //       dataForm.append("file_manifest[]", file.blob);
  //     } else {
  //       dataForm.append("file_manifest[]", file.originFileObj);
  //     }
  //     // return;
  //   });

  //   limbahPadatList.forEach((val, index) => {
  //     dataForm.append("limbah_padat_kategori[]", val.kategori);
  //     dataForm.append("limbah_padat_catatan[]", val.catatan);
  //     dataForm.append("limbah_padat_berat[]", val.berat);
  //     console.log(val);
  //     // return;
  //   });

  //   // let responsenya = await api.post("/user/laporan-bulanan/create", dataForm);

  //   let url = "/user/laporan-bulanan/create";
  //   if (router.query.action == "edit") {
  //     url = "/user/laporan-bulanan/update";
  //   }

  //   try {
  //     if (globalStore.setLoading) globalStore.setLoading(true);
  //     let responsenya = await api.post(url, dataForm);
  //     Notif("success", "Sukses", "Berhasil tambah laporan.!");
  //     console.log(limbahPadatList);
  //     console.log(responsenya);
  //     router.push("/dashboard/user/limbah");
  //   } catch (e) {
  //     console.error(e);
  //   } finally {
  //     if (globalStore.setLoading) globalStore.setLoading(false);
  //   }
  // };

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
        if (tmpfile) {
          arrfile.push(tmpfile);
        }
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
        if (tmpfile) {
          arrfile.push(tmpfile);
        }
      }
    }
    console.log(arrfile);
    setFileLogbook(arrfile as any[]);
    formInstance.setFieldsValue({
      form_logbook: arrfile,
    });
  };

  useLayoutEffect(() => {
    let token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }
    
    let user: any = null;
    try {
      user = jwtDecode(token);
      if (!user) {
        router.push("/");
        return;
      }
      console.log(user);
    } catch (error) {
      console.error('Invalid token:', error);
      router.push("/");
      return;
    }

    try {
      getTransporterData();
      console.log(transporterOptions);
      console.log(Object.values(laporanBulananStore));
      console.log(laporanBulananStore);
      console.log(router.query.action);

      formInstance.resetFields();
      setForm(cloneDeep(tmpForm));
      setLimbahPadatList([]);

      formInstance.setFieldsValue({
        form_tahun: new Date().getFullYear(),
        form_periode: new Date().getMonth() + 1,
      });
      setForm({
        ...form,
        periode: new Date().getFullYear().toString(),
        tahun: (new Date().getMonth() + 1).toString(),
      });

      console.log("masuk sini? #1");
      if (
        (laporanBulananStore.id_laporan_bulanan == null ||
        laporanBulananStore.id_laporan_bulanan == 0) &&
        !router.asPath.includes("ViewLaporan")
      ) {
        console.log("masuk sini? #2");
        if (user.level == "1") {
          router.push("/dashboard/admin/manajemen/laporan");
        } else {
          router.push("/dashboard/user/limbah-padat");
        }
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
      setForm({
        ...form,
        oldid: laporanBulananStore.id_laporan_bulanan?.toString() ?? "",
        periode: laporanBulananStore.periode?.toString() ?? "",
        tahun: laporanBulananStore.tahun?.toString() ?? "",
        id_transporter: laporanBulananStore.id_transporter?.toString() ?? "0",
        nama_transporter:
          laporanBulananStore.nama_transporter?.toString() ?? "0",
        berat_limbah_total:
          laporanBulananStore.berat_limbah_total?.toString() ?? "",
        limbah_b3_covid: laporanBulananStore.limbah_b3_covid?.toString() ?? "",
      limbah_b3_nonmedis: laporanBulananStore.limbah_b3_nonmedis?.toString() ?? "",
        limbah_padat_infeksius: laporanBulananStore.limbah_padat_infeksius?.toString() ?? "",
        limbah_jarum: laporanBulananStore.limbah_jarum?.toString() ?? "",
        limbah_cair_b3: laporanBulananStore.limbah_cair_b3?.toString() ?? "",
        debit_limbah_cair: laporanBulananStore.debit_limbah_cair?.toString() ?? "",
        sludge_ipal: laporanBulananStore.limbah_sludge_ipal?.toString() ?? "",
        catatan: laporanBulananStore.catatan?.toString() ?? "",
        link_input_manifest:
          laporanBulananStore.link_input_manifest?.toString() ?? "",
        link_input_logbook:
          laporanBulananStore.link_input_logbook?.toString() ?? "",
        link_input_lab_ipal:
          laporanBulananStore.link_input_lab_ipal?.toString() ?? "",
        link_input_lab_lain:
          laporanBulananStore.link_input_lab_lain?.toString() ?? "",
        link_input_dokumen_lingkungan_rs:
          laporanBulananStore.link_input_dokumen_lingkungan_rs?.toString() ??
          "",
        // link_input_swa_pantau:
        //   laporanBulananStore.link_input_swa_pantau?.toString() ?? "",
        // link_input_ujilab_cair:
        //   laporanBulananStore.link_input_ujilab_cair?.toString() ?? "",
      });

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

      formInstance.setFieldsValue({
        form_periode: laporanBulananStore.periode?.toString() ?? "",
        form_tahun: laporanBulananStore.tahun?.toString() ?? "",
        form_transporter: laporanBulananStore.id_transporter?.toString() ?? "",
        form_beratLimbah:
          laporanBulananStore.berat_limbah_total?.toString() ?? "",
        form_beratLimbahNonMedis:
          laporanBulananStore.limbah_b3_nonmedis?.toString() ?? "",
        form_beratLimbahCovid:
          laporanBulananStore.limbah_b3_covid?.toString() ?? "",
        form_beratLimbahPadatInfeksius:
          laporanBulananStore.limbah_padat_infeksius?.toString() ?? "",
        form_debitLimbah:
          laporanBulananStore.limbah_cair_b3?.toString() ?? "",
        form_debitLimbahCair:
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
      });

      // getFile(pengajuanTransporterStore.files);
      getFilesManifest();
      getFilesLogbook();
      // fileManifest;
      // fileLogbook;
      getListHere();
    } catch (error) {
      console.error(error);
      if (!router.asPath.includes("ViewLaporan")) {
        if (user.level == "1") {
          router.push("/dashboard/admin/manajemen/laporan");
        } else {
          router.push("/dashboard/user/limbah-padat");
        }
      }
      // router.push("/dashboard/user/limbah");
    }
  }, []);

  return (
    <div>
      <Row>
        <Col>
          <table>
            <tbody>
              <tr>
                <td>Nama Transporter</td>
                <td>:</td>
                <td>{form.nama_transporter}</td>
              </tr>

              <tr>
                <td>Total Limbah B3 Infeksius (Kg)</td>
                <td>:</td>
                <td>{form.limbah_padat_infeksius}</td>
              </tr>
              <tr>
                <td>Total Limbah Covid (Kg)</td>
                <td>:</td>
                <td>{form.limbah_b3_covid}</td>
              </tr>
                <tr>
                  <td>Total Limbah B3 Non Infeksius (Kg)</td>
                  <td>:</td>
                  <td>{form.limbah_b3_nonmedis}</td>
                </tr>
                <tr>
                <td>Total Limbah Jarum (Kg)</td>
                <td>:</td>
                <td>{form.limbah_jarum}</td>
              </tr>

              {/* <tr>
                <td>Total Limbah Cair B3 (Kg)</td>
                <td>:</td>
                <td>{form.limbah_cair_b3}</td>
              </tr> */}

              <tr>
                <td>Total Limbah Cair B3 (Kg)</td>
                <td>:</td>
                <td>{form.debit_limbah_cair}</td>
              </tr>

              <tr>
                <td><strong>Total Limbah B3 (Kg)</strong></td>
                <td>:</td>
                <td><strong>{form.berat_limbah_total}</strong></td>
              </tr>

              <tr>
                <td>Catatan</td>
                <td>:</td>
                <td>{form.catatan}</td>
              </tr>
            </tbody>
          </table>
        </Col>
      </Row>
      {/* <Divider />
      <Row>
        <Col>
          <table cellPadding={5} cellSpacing={0} border={1}>
            <tbody>
              <tr>
                <th>Kategori</th>
                <th>Catatan</th>
                <th>Berat</th>
              </tr>
              {limbahPadatList.map((val, index) => {
                let item = val;
                return (
                  <React.Fragment key={`limbah-padat-${index}`}>
                    <tr>
                      <td>
                        {item.name}
                        {item.kategori}
                      </td>
                      <td>
                        {item.name}
                        {item.catatan}
                      </td>
                      <td>
                        {item.name}
                        {item.berat}
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </Col>
      </Row> */}
      <Divider />
      <Row>
        <Col>
          <table>
            <tbody>
              <tr>
                <td>Link Manifest</td>
                <td>:</td>
                <td>
                  <a
                    onClick={() =>
                      window.open(`${form.link_input_manifest}`, "_blank")
                    }
                  >
                    <ExportOutlined />
                    <b>{"  "}Dokumen Manifest</b>
                  </a>
                </td>
              </tr>

              <tr>
                <td>Link Logbook</td>
                <td>:</td>
                <td>
                  <a
                    onClick={() =>
                      window.open(`${form.link_input_logbook}`, "_blank")
                    }
                  >
                    <ExportOutlined />
                    <b>{"  "}Dokumen Logbook</b>
                  </a>
                </td>
              </tr>

              {/* <tr>
                <td>Link Ipal</td>
                <td>:</td>
                <td>
                  <a
                    onClick={() =>
                      window.open(`${form.link_input_lab_ipal}`, "_blank")
                    }
                  >
                    <ExportOutlined />
                    <b>{"  "}Dokumen Lab Ipal</b>
                  </a>
                </td>
              </tr> */}
              <tr>
                <td>Link Lab lain</td>
                <td>:</td>
                <td>
                  <a
                    onClick={() =>
                      window.open(`${form.link_input_lab_lain}`, "_blank")
                    }
                  >
                    <ExportOutlined />
                    <b>{"  "}Dokumen Lab Ipal</b>
                  </a>
                </td>
              </tr>
              {/* <tr>
                <td>Link Dokumen SWA Pantau</td>
                <td>:</td>
                <td>
                  <a
                    onClick={() =>
                      window.open(
                        `${form.link_input_swa_pantau}`,
                        "_blank"
                      )
                    }
                  >
                    <ExportOutlined />
                    <b>{"  "}Dokumen Swa Pantau</b>
                  </a>
                </td>
              </tr>

              <tr>
                <td>Link Dokumen Uji Lab Cair</td>
                <td>:</td>
                <td>
                  <a
                    onClick={() =>
                      window.open(
                        `${form.link_input_ujilab_cair}`,
                        "_blank"
                      )
                    }
                  >
                    <ExportOutlined />
                    <b>{"  "}Dokumen Uji Lab Cair</b>
                  </a>
                </td>
              </tr> */}
            </tbody>
          </table>
        </Col>
      </Row>
    </div>
  );

  //   const contentListNoTitle: Record<string, React.ReactNode> = {
  //     limbahPadat: (
  //       <Form
  //         form={formInstance}
  //         onFinish={handleNextButton}
  //         {...layout}
  //         name="control-hooks"
  //         style={{ maxWidth: 600 }}
  //       >
  //         <h2 style={{ display: "flex", justifyContent: "center" }}>
  //           Pencatatan Limbah Padat
  //         </h2>
  //         <Form.Item
  //           name="form_transporter"
  //           label="Pilih Transporter"
  //           initialValue={form.idtransporter}
  //           rules={[{ required: true }]}
  //         >
  //           <Select
  //             value={form.idtransporter}
  //             onChange={(v) => handleChangeSelect(v, "idtransporter", event)}
  //             placeholder="Select a option and change input text above"
  //             allowClear
  //             disabled={true}
  //             options={transporterOptions}
  //           ></Select>
  //         </Form.Item>
  //         <Form.Item
  //           name="form_namaPemusnah"
  //           label="Nama Pemusnah"
  //           rules={[{ required: true }]}
  //         >
  //           <Input
  //             onChange={handleChangeInput}
  //             value={form.namapemusnah}
  //             disabled={true}
  //             name="namapemusnah"
  //           />
  //         </Form.Item>
  //         <Form.Item
  //           name="form_metodePemusnahan"
  //           label="Metode Pemusnahan"
  //           rules={[{ required: true }]}
  //         >
  //           <Input
  //             onChange={handleChangeInput}
  //             value={form.metodepemusnah}
  //             disabled={true}
  //             name="metodepemusnah"
  //           />
  //         </Form.Item>
  //         <Divider />
  //         <Form.Item name="form_TPS" label="Memiliki TPS?">
  //           <Checkbox
  //             style={{ marginLeft: 10 }}
  //             checked={[1, "1"].includes(form.statustps)}
  //             disabled={true}
  //             name="form_statusTps"
  //             onChange={handleCheckboxChange}
  //           >
  //             Iya
  //           </Checkbox>
  //           <Input
  //             style={{ width: 100 }}
  //             onChange={handleChangeInput}
  //             disabled={true}
  //             value={form.ukurantps}
  //             name="ukurantps"
  //           />{" "}
  //           Ukuran
  //         </Form.Item>
  //         <Form.Item name="form_pemusnah" label="Memiliki Pemusnah Mandiri?">
  //           <Checkbox
  //             checked={[1, "1"].includes(form.statuspemusnah)}
  //             style={{ marginLeft: 10 }}
  //             value={form.statuspemusnah}
  //             disabled={true}
  //             name="form_statusPemusnah"
  //             onChange={handleCheckboxChange1}
  //           >
  //             Iya
  //           </Checkbox>
  //           <Input
  //             style={{ width: 100 }}
  //             onChange={handleChangeInput}
  //             disabled={true}
  //             value={form.ukuranpemusnah}
  //             name="ukuranpemusnah"
  //           />{" "}
  //           Ukuran
  //         </Form.Item>
  //         <Divider />
  //         <Form.Item
  //           name="form_beratLimbah"
  //           label="Total Limbah Padat(Kg)"
  //           rules={[]}
  //         >
  //           <InputNumber
  //             onChange={(v) => handleChangeSelect(v, "totallimbahpadat", event)}
  //             value={form.totallimbahpadat}
  //             disabled={true}
  //             min={0}
  //             defaultValue={0}
  //           />
  //         </Form.Item>
  //         <Form.Item
  //           name="form_beratLimbahNonCovid"
  //           label="Total Limbah NonCovid(Kg)"
  //           rules={[]}
  //         >
  //           <InputNumber
  //             onChange={(v) =>
  //               handleChangeSelect(v, "totallimbahnoncovid", event)
  //             }
  //             value={form.totallimbahnoncovid}
  //             disabled={true}
  //             min={0}
  //             defaultValue={0}
  //           />
  //         </Form.Item>
  //         <Form.Item
  //           name="form_beratLimbahCovid"
  //           label="Total Limbah Covid(Kg)"
  //           rules={[]}
  //         >
  //           <InputNumber
  //             onChange={(v) => handleChangeSelect(v, "totallimbahcovid", event)}
  //             value={form.totallimbahcovid}
  //             disabled={true}
  //             min={0}
  //             defaultValue={0}
  //           />
  //         </Form.Item>
  //         <Divider />

  //         <Form.List
  //           name="detailLimbahDynamic"
  //           key={formListKey}
  //           initialValue={limbahPadatList}
  //         >
  //           {(fields, { add, remove }) => (
  //             <>
  //               {fields.map(({ key, name, ...restField }) => (
  //                 <Space
  //                   key={key}
  //                   style={{ display: "flex", marginBottom: 8 }}
  //                   align="baseline"
  //                 >
  //                   <Form.Item
  //                     {...restField}
  //                     name={[name, "form_kategoriLimbahPadat"]}
  //                     key={"form_kategoriLimbahPadat" + key}
  //                     rules={[
  //                       { required: true, message: "Masukan Kategori Limbah" },
  //                     ]}
  //                     initialValue={
  //                       limbahPadatList[name]
  //                         ? limbahPadatList[name].kategori ?? ""
  //                         : ""
  //                     }
  //                   >
  //                     <Input
  //                       onChange={(v: any) =>
  //                         handleChangeLimbahPadatInput(v, key, name, "kategori")
  //                       }
  //                       value={
  //                         limbahPadatList[name]
  //                           ? limbahPadatList[name].kategori ?? ""
  //                           : ""
  //                       }
  //                       disabled={true}
  //                       name={"kategoridetaillimbah" + key}
  //                       key={"kategoridetaillimbahKey" + key}
  //                       style={{ width: 150 }}
  //                       placeholder="Kategori"
  //                     />
  //                   </Form.Item>
  //                   <Form.Item
  //                     {...restField}
  //                     name={[name, "form_catatanLimbahPadat"]}
  //                     key={"form_catatanLimbahPadat" + key}
  //                     rules={[{}]}
  //                     initialValue={
  //                       limbahPadatList[name]
  //                         ? limbahPadatList[name].catatan ?? ""
  //                         : ""
  //                     }
  //                   >
  //                     <Input
  //                       onChange={(v: any) =>
  //                         handleChangeLimbahPadatInput(v, key, name, "catatan")
  //                       }
  //                       value={
  //                         limbahPadatList[name]
  //                           ? limbahPadatList[name].catatan ?? ""
  //                           : ""
  //                       }
  //                       disabled={true}
  //                       name={"catatandetaillimbah" + key}
  //                       key={"catatandetaillimbahKey" + key}
  //                       style={{ width: 150 }}
  //                       placeholder="Catatan"
  //                     />
  //                   </Form.Item>
  //                   <Form.Item
  //                     {...restField}
  //                     name={[name, "form_beratLimbahPadat"]}
  //                     key={"form_beratLimbahPadat" + key}
  //                     rules={[
  //                       { required: true, message: "Masukan Berat Limbah" },
  //                     ]}
  //                     initialValue={
  //                       limbahPadatList[name]
  //                         ? limbahPadatList[name].berat ?? ""
  //                         : ""
  //                     }
  //                   >
  //                     <Input
  //                       onChange={(v: any) =>
  //                         handleChangeLimbahPadatInput(v, key, name, "berat")
  //                       }
  //                       style={{ width: 150 }}
  //                       value={
  //                         limbahPadatList[name]
  //                           ? limbahPadatList[name].berat ?? ""
  //                           : ""
  //                       }
  //                       disabled={true}
  //                       name="beratdetaillimbah"
  //                       key={"beratdetaillimbahKey" + key}
  //                       placeholder="Berat"
  //                     />
  //                   </Form.Item>
  //                   <MinusCircleOutlined
  //                     onClick={(v) => handleRemoveRowDynamic(remove, key, name)}
  //                   />
  //                 </Space>
  //               ))}
  //             </>
  //           )}
  //         </Form.List>
  //         <Divider />
  //         <h3>Upload Catatan</h3>
  //         <Form.Item
  //           initialValue={fileManifest}
  //           name="form_manifest"
  //           label="Upload Manifest"
  //         >
  //           <Upload
  //             name="manifest"
  //             multiple
  //             beforeUpload={(file: any) => beforeUploadFileDynamic(file)}
  //             fileList={fileManifest}
  //             disabled={true}
  //             onChange={(file: any) => setFileManifest(file.fileList)}
  //           ></Upload>
  //         </Form.Item>
  //         <Form.Item
  //           initialValue={fileLogbook}
  //           name="form_logbook"
  //           label="Upload Logbook"
  //         >
  //           <Upload
  //             name="logbook"
  //             multiple
  //             disabled={true}
  //             beforeUpload={(file: any) => beforeUploadFileDynamic(file)}
  //             fileList={fileLogbook}
  //             onChange={(file: any) => setFileLogbook(file.fileList)}
  //           ></Upload>
  //         </Form.Item>
  //         <Form.Item {...tailLayout}>
  //           <Button
  //             size="large"
  //             type="primary"
  //             htmlType="submit"
  //             icon={<RightCircleOutlined />}
  //             style={{ boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)" }}
  //           >
  //             Next
  //           </Button>
  //           <Button
  //             size="large"
  //             href="/dashboard/admin/manajemen/laporan"
  //             style={{
  //               boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
  //             }}
  //           >
  //             Halaman Awal
  //           </Button>
  //         </Form.Item>
  //       </Form>
  //     ),
  //     limbahCair: (
  //       <Form
  //         form={formInstance}
  //         onFinish={handleSubmitButton}
  //         {...layout}
  //         name="control-hooks"
  //         style={{ maxWidth: 600 }}
  //       >
  //         <h2 style={{ display: "flex", justifyContent: "center" }}>
  //           Pencatatan Limbah Cair
  //         </h2>
  //         <Form.Item name="form_debitLimbah" label="Debit Limbah Cair">
  //           <Input
  //             onChange={handleChangeInput}
  //             name="debitlimbahcair"
  //             value={form.debitlimbahcair}
  //             disabled={true}
  //           />
  //         </Form.Item>
  //         <Form.Item name="form_kapasitasInpal" label="Kapasitas Inpal">
  //           <Input
  //             onChange={handleChangeInput}
  //             name="kapasitasinpal"
  //             value={form.kapasitasinpal}
  //             disabled={true}
  //           />
  //         </Form.Item>

  //         <Divider />

  //         <Form.Item name="form_ukuranTPS" label="Apakah Memenuhi Syarat?">
  //           <Checkbox
  //             checked={[1, "1"].includes(form.stastuslimbahcair)}
  //             style={{ marginLeft: 10 }}
  //             value={form.stastuslimbahcair}
  //             disabled={true}
  //             onChange={handleCheckboxChange2}
  //             name="form_statussyaratipal"
  //           >
  //             Iya
  //           </Checkbox>
  //         </Form.Item>

  //         <Form.Item name="form_catatan" label="Catatan">
  //           <TextArea
  //             style={{ width: 500, height: 75 }}
  //             placeholder="Masukan Catatan"
  //             onChange={handleChangeInput}
  //             disabled={true}
  //             name="catatanlimbahcair"
  //             value={form.catatanlimbahcair}
  //           />
  //         </Form.Item>

  //         <Form.Item {...tailLayout}>
  //           <Space>
  //             <Button
  //               size="large"
  //               type="primary"
  //               onClick={handlePreviousButton}
  //               style={{
  //                 backgroundColor: "#FFFF00", // Yellow color
  //                 borderColor: "#FFFF00", // You might also want to set the border color
  //                 color: "black", // Adjust text color for better visibility
  //                 boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
  //               }}
  //             >
  //               Halaman Sebelumnya
  //             </Button>
  //             {/* <Button
  //               size="large"
  //               type="primary"
  //               href="/dashboard/admin/manajemen/laporan"
  //               style={{
  //                 boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
  //               }}
  //             >
  //               Halaman Awal
  //             </Button> */}
  //           </Space>
  //         </Form.Item>
  //       </Form>
  //     ),
  //   };

  //   return (
  //     <>
  //       <Form form={formInstance}>
  //         <br />
  //         <Space wrap>
  //           <Form.Item
  //             name="form_periode"
  //             initialValue={form.periode}
  //             rules={[{ required: true }]}
  //             label="Periode"
  //           >
  //             <Select
  //               value={form.periode}
  //               placeholder="Pilih Bulan Periode"
  //               onChange={(v) => handleChangePeriode(v, "periode", event)}
  //               style={{ width: 200 }}
  //               // onChange={handleChange}
  //               options={[
  //                 { value: 1, label: "Januari" },
  //                 { value: 2, label: "Februari" },
  //                 { value: 3, label: "Maret" },
  //                 { value: 4, label: "April" },
  //                 { value: 5, label: "Mei" },
  //                 { value: 6, label: "Juni" },
  //                 { value: 7, label: "Juli" },
  //                 { value: 8, label: "Agustus" },
  //                 { value: 9, label: "September" },
  //                 { value: 10, label: "Oktober" },
  //                 { value: 11, label: "November" },
  //                 { value: 12, label: "Desember" },
  //               ]}
  //             />
  //           </Form.Item>
  //           <Form.Item
  //             name="form_tahun"
  //             label="Tahun"
  //             rules={[{ required: true }]}
  //           >
  //             <Input
  //               placeholder="Masukan Tahun"
  //               onChange={handleChangeInput}
  //               value={form.tahun}
  //               maxLength={4}
  //               name="tahun"
  //             />
  //           </Form.Item>
  //         </Space>
  //       </Form>
  //       <Card
  //         style={{ width: "100%" }}
  //         tabList={tabListNoTitle}
  //         activeTabKey={activeTabKey2}
  //       >
  //         <div style={{ display: "flex", justifyContent: "center" }}>
  //           {contentListNoTitle[activeTabKey2]}
  //         </div>
  //       </Card>
  //     </>
  //   );
};

export default FormViewLaporan;
