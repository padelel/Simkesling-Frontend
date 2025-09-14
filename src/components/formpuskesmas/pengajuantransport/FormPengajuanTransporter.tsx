import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Divider,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Upload,
  UploadFile,
  UploadProps,
  notification,
} from "antd";

import {
  UploadOutlined,
  PlusOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";

import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { DatePicker, Space } from "antd";
import { RcFile, UploadChangeParam } from "antd/es/upload";
import api from "@/utils/HttpRequest";
import { usePengajuanTransporterStore } from "@/stores/pengajuanTransporterStore";
import apifile from "@/utils/HttpRequestFile";
import axios from "axios";
import { fileTypeFromStream } from "file-type";
import router, { useRouter } from "next/router";
import cloneDeep from "clone-deep";
import { useGlobalStore } from "@/stores/globalStore";
import jwtDecode from "jwt-decode";
import { useUserLoginStore } from "@/stores/userLoginStore";

type NotificationType = "success" | "info" | "warning" | "error";

const { RangePicker } = DatePicker;

const { Option } = Select;
const { TextArea } = Input;

const layout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 17 },
};

const tailLayout = {
  wrapperCol: { offset: 8, span: 16 },
};
const tailLayoutUpload = {
  wrapperCol: { offset: 8, span: 16 },
};

const tailLayoutUpload1 = {
  wrapperCol: { span: 100 },
};
const inputStyles = {
  width: "250px",
  height: "35px",
  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
};
const inputAreaStyles = {
  width: "250px",
  height: "70px",
  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
};
const FormPengajuanTransporter: React.FC = () => {
  const userLoginStore = useUserLoginStore();
  const globalStore = useGlobalStore();
  const [apimessageCreate, contextHolderCreate] =
    notification.useNotification();
  const [apimessageUpdate, contextHolderUpdate] =
    notification.useNotification();

  const openNotificationCreate = (type: NotificationType) => {
    apimessageCreate[type]({
      message: "Tambah Transporter",
      description:
        "Transporter Berhasil Ditambahkan, silahkan tunggu validasi Admin",
    });
  };

  const openNotificationUpdate = (type: NotificationType) => {
    apimessageUpdate[type]({
      message: "Update Transporter",
      duration: 20,
      description:
        "Transporter Berhasil Diupdate, silahkan tunggu validasi Admin",
    });
  };

  const [formListKey, setFormListKey] = useState(new Date().toISOString());
  const pengajuanTransporterStore = usePengajuanTransporterStore();
  const [kecamatanOptions, setKecamatanOptions] = useState<
    { value: string; label: string; id_kecamatan: number }[]
  >([]);
  const [selectedKecamatan, setSelectedKecamatan] = useState<number | null>(
    null
  );

  const [kelurahanOptions, setKelurahanOptions] = useState<
    { value: string; label: string; id_kelurahan: number }[]
  >([]);
  const [selectedKelurahan, setSelectedKelurahan] = useState<number | null>(
    null
  );

  const getKecamatanData = async () => {
    try {
      if (globalStore.setLoading) globalStore.setLoading(true);
      const response = await api.post("/user/kecamatan/data");
      const responseData = response.data.data.values;

      setKecamatanOptions(
        responseData.map((item: any) => ({
          value: item.id_kecamatan.toString(),
          label: item.nama_kecamatan,
          id_kecamatan: item.id_kecamatan.toString(),
        }))
      );
    } catch (error) {
      console.error("Error fetching kecamatan data:", error);
    } finally {
      if (globalStore.setLoading) globalStore.setLoading(false);
    }
  };

  const getKelurahanData = async (id_kecamatan: number) => {
    try {
      if (globalStore.setLoading) globalStore.setLoading(true);
      const response = await api.post(
        `/user/kelurahan/data?id_kecamatan=${id_kecamatan}`
      );
      const responseData = response.data.data.values;

      setKelurahanOptions(
        responseData.map((item: any) => ({
          value: item.id_kelurahan.toString(),
          label: item.nama_kelurahan,
          id_kelurahan: item.id_kelurahan.toString(),
        }))
      );
    } catch (error) {
      console.error("Error fetching kelurahan data:", error);
    } finally {
      if (globalStore.setLoading) globalStore.setLoading(false);
    }
  };

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [fileListList, setFileListList] = useState<UploadFile[][]>([]);
  const [linkMouList, setlinkMouList] = useState<string[]>([]);
  const [dateRangeList, setDateRangeList] = useState<any[]>([]);

  let tmpForm = {
    status_transporter: "",
    oldid: "",
    namatransporter: "",
    no_izinTransporter: "",
    nama_pemusnah: "",
    metode_pemusnah: "",
    alamat: "",
    telp: "",
    email: "",
    catatan: "",
    link_input_izin: "",
    link_mou: "",
  };

  const [form, setForm] = useState(cloneDeep(tmpForm));

  const [uploading, setUploading] = useState(false);
  const [rowCount, setRowCount] = useState(1);

  const [showMOUFields, setShowMOUFields] = useState(false);

  const props: UploadProps = {
    onRemove: (file: any) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    beforeUpload: (file: any) => {
      setFileList([...fileList, file]);

      return false;
    },
    fileList,
  };

  // name: itu index 0 1 2 3 4 5 urut
  // key: itu name yang nambah terus 1 3 7 8 9 10
  const handleAddRowDynamic = (add: Function) => {
    // fileListList.push([]);
    // dateRangeList.push([]);
    console.log(fileListList);
    add();
  };
  const handleRemoveRowDynamic = (
    remove: Function,
    name: number,
    key: number
  ) => {
    console.log("----");
    console.log(key);
    console.log(name);
    remove(name);

    // let tmpFileListList = [...fileListList];
    // tmpFileListList.splice(name, 1);
    // setFileListList(tmpFileListList);

    let tmpDateRangeList = [...dateRangeList];
    tmpDateRangeList.splice(name, 1);
    setDateRangeList(tmpDateRangeList);

    let tmpLinkMouList = [...linkMouList];
    tmpLinkMouList.splice(name, 1);
    setlinkMouList(tmpLinkMouList);

    // console.log(tmpFileListList);
    console.log(tmpDateRangeList);
    console.log(tmpLinkMouList);
    console.log("----[END]");
  };

  const beforeUploadFileDynamic = (file: RcFile, key: number) => {
    return false;
  };

  const onChangeFileDynamic = (
    file: UploadChangeParam<UploadFile<any>>,
    key: number,
    name: number
  ) => {
    let tmpFileListList = [...fileListList];
    tmpFileListList[name] = [file.file];
    setFileListList(tmpFileListList);
  };

  const onRemoveFileDynamic = (
    file: UploadFile<any>,
    key: number,
    name: number
  ) => {
    let tmpFileListList = [...fileListList];
    const index = tmpFileListList[name].indexOf(file);
    tmpFileListList[name].splice(index, 1);
    setFileListList(tmpFileListList);
  };

  // -- rangeDate
  const onChangeRangeDateDynamic = (
    value: null | (Dayjs | null)[],
    dateStrings: string[],
    key: number,
    name: number
  ) => {
    console.log(value);
    console.log(dateStrings);
    console.log(name);
    let tmpDateRangeList = [...dateRangeList];
    let tmpval: dayjs.Dayjs[] = [];
    if (value) {
      tmpval = [dayjs(dateStrings[0]), dayjs(dateStrings[1])];
    }
    console.log(tmpval);
    tmpDateRangeList[name] = tmpval;
    console.log(tmpDateRangeList);
    setDateRangeList(tmpDateRangeList);
  };

  const onChangeLinkMou = (event: any, key: number, name: number) => {
    // linkMouList;
    // setlinkMouList;
    console.log(event);
    console.log(event.target.value);
    console.log(key);
    console.log(name);
    let tmpRangeLinkMou = [...linkMouList];
    let tmpval = "";
    if (event.target.value) {
      tmpval = event.target.value;
    }
    tmpRangeLinkMou[name] = tmpval;
    setlinkMouList(tmpRangeLinkMou);
  };

  const handleChangeInput = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    console.log(event);
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleKecamatanSelectChange = (value: any, name: any, event: any) => {
    const id_kecamatan = parseInt(value);
    setSelectedKecamatan(id_kecamatan);
    setSelectedKelurahan(null);
    getKelurahanData(id_kecamatan);
    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleKelurahanSelectChange = (
    value: string,
    name: any,
    event: any
  ) => {
    setSelectedKelurahan(parseInt(value));
    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleChangeSelect = (val: any, name: any, event: any) => {};

  // -- onSubmit
  const handleSubmit = async () => {
    console.log(form);

    let dataForm: any = new FormData();
    dataForm.append("oldid", form.oldid);
    dataForm.append("nama_transporter", form.namatransporter);
    dataForm.append("noizin", form.no_izinTransporter);
    dataForm.append("nama_pemusnah", form.nama_pemusnah);
    dataForm.append("metode_pemusnah", form.metode_pemusnah);
    dataForm.append("alamat_transporter", form.alamat);
    dataForm.append("notlp", form.telp);
    dataForm.append("nohp", form.telp);
    dataForm.append("email", form.email);
    dataForm.append("link_input_izin", form.link_input_izin);

    console.log(fileListList);

    linkMouList.forEach((val) => {
      dataForm.append(`link_input_mou_transporter[]`, val);
    });

    dateRangeList.forEach((rangeDates, index) => {
      if (rangeDates.length === 2) {
        // Format the dates to the required format
        const tglMulai = rangeDates[0].format("YYYY-MM-DD");
        const tglAkhir = rangeDates[1].format("YYYY-MM-DD");

        // dataForm.append(`tgl_mulai`, tglMulai);
        // dataForm.append(`tgl_akhir`, tglAkhir);
        dataForm.append(`tgl_mulai[]`, tglMulai);
        dataForm.append(`tgl_akhir[]`, tglAkhir);
      }
    });

    let url = "/user/pengajuan-transporter/create";
    if (router.query.action == "edit") {
      url = "/user/pengajuan-transporter/update";
    }

    if (router.query.action == "validasi") {
      dataForm.append("status_transporter", "2");
      url = "/user/pengajuan-transporter/validasi";
    }
    try {
      if (globalStore.setLoading) globalStore.setLoading(true);
      let responsenya = await api.post(url, dataForm);
      console.log(fileListList);
      console.log(dateRangeList);
      console.log(responsenya);
      if (router.query.action == "edit") {
        openNotificationUpdate("success");
      }
      openNotificationCreate("success");
      setTimeout(() => {
        router.push("/dashboard/user/pengajuantransporter");
      }, 3000);
      // router.push("/dashboard/user/pengajuantransporter");
    } catch (e) {
      console.error(e);
    } finally {
      if (globalStore.setLoading) globalStore.setLoading(false);
    }
  };

  // -- onSubmit
  // const ifTolak = async () => {

  // };

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
      // fileListList.push([
      //   {
      //     uid: new Date().toISOString(),
      //     name: filename,
      //     status: "done",
      //     url: blobUrl,
      //   },
      // ]);
      return {
        uid: new Date().toISOString(),
        name: filename,
        status: "done",
        url: blobUrl,
        blob: blob,
      };

      // Open the Blob URL in a new tab
      // window.open(blobUrl, "_blank");

      // Release the Blob URL when done to avoid memory leaks
      // URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("-- error in getfile --");
      console.error("Error fetching or processing data:", error);
    } finally {
      if (globalStore.setLoading) globalStore.setLoading(false);
    }
  };
  const getFilesHere = async () => {
    let lengthfile = pengajuanTransporterStore.files?.length ?? 0;
    let arrfile = [];
    for (let index = 0; index < lengthfile; index++) {
      // const element = array[index];
      if (pengajuanTransporterStore.files) {
        let val = pengajuanTransporterStore.files[index];
        let tmpfile = await getFile(val.file1);
        // let tmpawal = await setDateRangeList(val.tgl_mulai);
        if (tmpfile) {
          arrfile.push([tmpfile]);
        }
      }
    }
    console.log(arrfile);
    setFileListList(arrfile as any[]);

    const listMouDynamic = formInstance.getFieldValue("listMouDynamic");
    // console.log(listMouDynamic);
    formInstance.setFieldsValue({
      listMouDynamic: arrfile,
    });

    getDatesHere();
  };
  const getDatesHere = async () => {
    let lengthdate = pengajuanTransporterStore.files?.length ?? 0;
    let arrdate = [];
    for (let index = 0; index < lengthdate; index++) {
      // const element = array[index];
      if (pengajuanTransporterStore.files) {
        let val = pengajuanTransporterStore.files[index];
        // let tmpfile = await getFile(val.file1);
        // arrdate.push([tmpfile]);
        // console.log(val);
        let tmpdate = [dayjs(val.tgl_mulai), dayjs(val.tgl_akhir)];
        // console.log(a);
        arrdate.push(tmpdate);
      }
    }
    console.log(arrdate);
    setDateRangeList(arrdate);
    console.log(dateRangeList);
    const listMouDynamic = formInstance.getFieldValue("listMouDynamic");
    // console.log(listMouDynamic);
    let kdate = Object.keys(listMouDynamic);
    console.log(kdate);
    for (let index = 0; index < kdate.length; index++) {
      if (kdate.includes("masaBerlaku")) {
        // let val =
        // @ts-ignore
        formInstance.setFieldValue[kdate[index]] = arrdate[index];
        console.log("--kdate[index], arrdate[index]");
        console.log(kdate[index], arrdate[index]);
        // formInstance[kdate[index]] = arrdate[index];
      }
    }
    formInstance.setFieldsValue({
      listMouDynamic: arrdate,
    });
    // formInstance.setFieldsValue({
    //   list: arrdate,
    // });
  };

  const getLinkMOUHere = async () => {
    let lengthlinkmou = pengajuanTransporterStore.files?.length ?? 0;
    let arrlinkmou: any[] = [];
    for (let index = 0; index < lengthlinkmou; index++) {
      // const element = array[index];
      if (pengajuanTransporterStore.files) {
        let val = pengajuanTransporterStore.files[index];
        // let tmpfile = await getFile(val.file1);
        // arrlinkmou.push([tmpfile]);
        // console.log(val);
        let tmplinkmou = val.link_input;
        // console.log(a);
        arrlinkmou.push(tmplinkmou);
      }
    }
    setlinkMouList(arrlinkmou);
  };

  const [formInstance] = Form.useForm();
  const [linkUploadIzinTransporter, setlinkUploadIzinTransporter] =
    useState("");
  const [linkUploadMouTransporter, setlinkUploadMouTransporter] = useState("");

  useLayoutEffect(() => {
    console.log("test");
    console.log(userLoginStore.user);

    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get("action");
    let token = localStorage.getItem("token");
    let user: any = jwtDecode(token ?? "");
    if (!user) {
      router.push("/");
      return;
    }
    setlinkUploadIzinTransporter(user.link_izin_transporter);
    setlinkUploadMouTransporter(user.link_mou_transporter);
    console.log(user);

    // getKecamatanData();
    console.log(router.query);
    console.log(Object.values(pengajuanTransporterStore));
    console.log(pengajuanTransporterStore);

    // jika create
    formInstance.resetFields();
    setForm(cloneDeep(tmpForm));

    if (action === "edit") {
      if (
        pengajuanTransporterStore.id_transporter_tmp == 0 ||
        pengajuanTransporterStore.id_transporter_tmp == null
      ) {
        console.log("masuk sini? #2");
        if (user.level == "1") {
          router.push("/dashboard/admin/manajemen/transporter");
        } else {
          router.push("/dashboard/user/pengajuantransporter");
        }
        // router.push("/dashboard/user/pengajuantransporter");
        // router.push("/dashboard/admin/manajemen/transporter");
        return;
      }
      // jika edit set valuenya
      // setForm({
      //   status_transporter:
      //     pengajuanTransporterStore.status_transporter_tmp?.toString() ?? "",
      //   oldid: pengajuanTransporterStore.id_transporter_tmp?.toString() ?? "",
      //   namatransporter:
      //     pengajuanTransporterStore.nama_transporter?.toString() ?? "",
      //   no_izinTransporter: pengajuanTransporterStore.no?.toString() ?? "",
      //   nama_pemusnah: pengajuanTransporterStore.id_kecamatan?.toString() ?? "",
      //   metode_pemusnah: pengajuanTransporterStore.id_kelurahan?.toString() ?? "",
      //   alamat: pengajuanTransporterStore.alamat_transporter?.toString() ?? "",
      //   telp: pengajuanTransporterStore.nohp?.toString() ?? "",
      //   email: pengajuanTransporterStore.email?.toString() ?? "",
      //   catatan: pengajuanTransporterStore.catatan?.toString() ?? "",
      // });

      setForm({
        status_transporter:
          pengajuanTransporterStore.status_transporter_tmp?.toString() ?? "",
        oldid: pengajuanTransporterStore.id_transporter_tmp?.toString() ?? "",
        namatransporter:
          pengajuanTransporterStore.nama_transporter?.toString() ?? "",
        alamat: pengajuanTransporterStore.alamat_transporter?.toString() ?? "",
        telp: pengajuanTransporterStore.nohp?.toString() ?? "",
        email: pengajuanTransporterStore.email?.toString() ?? "",
        catatan: pengajuanTransporterStore.catatan?.toString() ?? "",
        nama_pemusnah:
          pengajuanTransporterStore.nama_pemusnah?.toString() ?? "",
        metode_pemusnah:
          pengajuanTransporterStore.metode_pemusnah?.toString() ?? "",
        link_input_izin:
          pengajuanTransporterStore.link_input_izin?.toString() ?? "",
        link_mou: "",
        no_izinTransporter: pengajuanTransporterStore.noizin?.toString() ?? "",
      });

      formInstance.setFieldsValue({
        form_namatransporter: pengajuanTransporterStore.nama_transporter,
        form_alamat: pengajuanTransporterStore.alamat_transporter,
        form_nohp: pengajuanTransporterStore.notlp,
        form_email: pengajuanTransporterStore.email,
        form_no_izinTransporter: pengajuanTransporterStore.noizin,
        form_namapemusnah: pengajuanTransporterStore.nama_pemusnah?.toString(),
        form_metodepemusnah:
          pengajuanTransporterStore.metode_pemusnah?.toString(),
        form_link_input_izin: pengajuanTransporterStore.link_input_izin,
      });

      // getKelurahanData(parseInt(pengajuanTransporterStore.id_kecamatan ?? "0"));

      // getFile(pengajuanTransporterStore.files);
      // getFilesHere();
      getDatesHere();
      getLinkMOUHere();
    }
  }, []);

  return (
    <>
      {contextHolderCreate}
      {contextHolderUpdate}

      <Form
        {...layout}
        name="control-hooks"
        style={{ maxWidth: 600 }}
        onFinish={handleSubmit}
        onFinishFailed={(val) => {
          console.log(val);
        }}
        form={formInstance}>
        <Form.Item
          name="form_namatransporter"
          label="Nama Transporter"
          rules={[{ required: true, message: "Masukan Nama Transporter" }]}>
          <Input
            style={inputStyles}
            onChange={handleChangeInput}
            value={form.namatransporter}
            name="namatransporter"
          />
        </Form.Item>
        <Form.Item
          name="form_no_izinTransporter"
          label="No Izin Transporter"
          rules={[
            { required: true, message: "Masukan Nomor Izin Transporter" },
          ]}>
          <Input
            style={inputStyles}
            onChange={handleChangeInput}
            value={form.no_izinTransporter}
            name="no_izinTransporter"
          />
        </Form.Item>
        <Form.Item
          name="form_namapemusnah"
          label="Nama Pemusnah"
          rules={[{ required: true, message: "Masukan Nama Pemusnah" }]}>
          <Input
            style={inputStyles}
            onChange={handleChangeInput}
            value={form.nama_pemusnah}
            name="nama_pemusnah"
          />
        </Form.Item>
        <Form.Item
          name="form_metodepemusnah"
          label="Metode Pemusnah"
          rules={[{ required: true, message: "Masukan Metode Pemusnah" }]}>
          <Input
            style={inputStyles}
            onChange={handleChangeInput}
            value={form.metode_pemusnah}
            name="metode_pemusnah"
          />
        </Form.Item>

        <Form.Item
          name="form_alamat"
          label="Alamat Transporter"
          rules={[{ required: true, message: "Masukan Alamat Transporter" }]}>
          <TextArea
            style={inputAreaStyles}
            showCount
            name="alamat"
            maxLength={300}
            onChange={handleChangeInput}
            value={form.alamat}
          />
        </Form.Item>
        <Form.Item
          name="form_nohp"
          label="Telp Transporter"
          rules={[
            { required: true, message: "Masukan Nomor Telepon Transporter" },
            {
              pattern: /^[0-9]*$/,
              message: "Hanya boleh diisi dengan angka",
            },
          ]}>
          <Input
            style={inputStyles}
            onChange={handleChangeInput}
            value={form.telp}
            name="telp"
            type=""
          />
        </Form.Item>
        <Form.Item
          name="form_email"
          label="Email Transporter"
          rules={[
            { required: true, message: "Masukan Email Transporter" },
            { type: "email", message: "Email tidak valid" },
          ]}>
          <Input
            onChange={handleChangeInput}
            style={inputStyles}
            value={form.email}
            name="email"
            type="email"
          />
        </Form.Item>
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
          name="form_link_input_izin"
          label="Link Izin Transporter"
          rules={[
            {
              required: form.link_input_izin.length < 1,
              message: "Masukan Link Izin Transporter",
            },
          ]}>
          <Input
            style={inputStyles}
            onChange={handleChangeInput}
            value={form.link_input_izin}
            name="link_input_izin"
          />
          <Button
            style={{ textDecoration: "underline" }}
            icon={<UploadOutlined />}
            type="link"
            onClick={() => window.open(linkUploadIzinTransporter, "_blank")}>
            Klik Untuk Upload Izin Transporter
          </Button>
        </Form.Item>

        <Divider />

        <Form.List
          name="listMouDynamic"
          initialValue={dateRangeList}
          key={formListKey}>
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Space
                  direction="vertical"
                  size="middle"
                  key={"spaceKey" + key}
                  style={{ display: "flex", justifyContent: "center" }}>
                  <MinusCircleOutlined
                    onClick={() => handleRemoveRowDynamic(remove, name, key)}
                  />

                  <Form.Item
                    name="form_linkMou"
                    label="Link MOU Transporter"
                    initialValue={linkMouList[name]}
                    key={"linkMouKey" + key}
                    rules={[
                      {
                        required: linkMouList[name]
                          ? linkMouList[name].length == 0
                          : true,
                        message: "Masukan Link Izin MOU",
                      },
                    ]}>
                    <Input
                      onChange={(event:any) => onChangeLinkMou(event, key, name)}
                      style={inputStyles}
                      name="link"
                      value={linkMouList[name]}
                    />
                    <Button
                      style={{ textDecoration: "underline" }}
                      icon={<UploadOutlined />}
                      type="link"
                      onClick={() =>
                        window.open(linkUploadMouTransporter, "_blank")
                      }>
                      Klik Untuk Upload File MOU
                    </Button>
                  </Form.Item>

                  <Form.Item
                    rules={[
                      {
                        required: dateRangeList[name]
                          ? dateRangeList[name].length == 0
                          : true,
                        message: "Masukan Tanggal Berlaku MOU",
                      },
                    ]}
                    initialValue={dateRangeList[name]}
                    label="Masa Berlaku MOU"
                    name={"masaBerlaku" + key}
                    key={"masaBerlakuKey" + key}>
                    <div>
                      <RangePicker
                        format="YYYY-MM-DD"
                        onChange={(v1: any, v2: any) =>
                          onChangeRangeDateDynamic(v1, v2, key, name)
                        }
                        defaultValue={dateRangeList[name]}
                        name={"rangePicker" + key}
                        key={"rangePickerKey" + key}
                        style={{ boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)" }}
                      />
                    </div>
                  </Form.Item>
                  <Divider />
                </Space>
              ))}
              <Form.Item {...tailLayoutUpload1}>
                <Button
                  block
                  size="middle"
                  type="dashed"
                  onClick={() => handleAddRowDynamic(add)}
                  icon={<PlusOutlined />}
                  style={{
                    backgroundColor: "#FFFF00", // Yellow color
                    borderColor: "#FFFF00", // You might also want to set the border color
                    color: "black", // Adjust text color for better visibility
                    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                  }}>
                  Klik Untuk Menambahkan MOU Transporter
                </Button>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Form.Item {...tailLayoutUpload}>
          <Button
            type="primary"
            size="large"
            htmlType="submit"
            icon={<CheckCircleOutlined />}
            // onClick={() => handleSubmit()}
            style={{ boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)" }}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </>
  );
};

export default FormPengajuanTransporter;
