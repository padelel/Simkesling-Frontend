import React, { useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
  Button,
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
import router from "next/router";
import cloneDeep from "clone-deep";
import { useGlobalStore } from "@/stores/globalStore";
import { LinkOutlined, ExportOutlined } from "@ant-design/icons";

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

const FormValidasiTransporter: React.FC = () => {
  const globalStore = useGlobalStore();
  const [apimessage, contextHolder] = notification.useNotification();
  const [linkMouList, setlinkMouList] = useState<string[]>([]);
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

  // const getKecamatanData = async () => {
  //   try {
  //     if (globalStore.setLoading) globalStore.setLoading(true);
  //     const response = await api.post("/user/kecamatan/data");
  //     const responseData = response.data.data.values;

  //     setKecamatanOptions(
  //       responseData.map(
  //         (item: { nama_kecamatan: string; id_kecamatan: number }) => ({
  //           value: item.id_kecamatan.toString(),
  //           label: item.nama_kecamatan,
  //           id_kecamatan: item.id_kecamatan,
  //         })
  //       )
  //     );
  //   } catch (error) {
  //     console.error("Error fetching kecamatan data:", error);
  //   } finally {
  //     if (globalStore.setLoading) globalStore.setLoading(false);
  //   }
  // };

  // const getKelurahanData = async (id_kecamatan: number) => {
  //   try {
  //     if (globalStore.setLoading) globalStore.setLoading(true);
  //     const response = await api.post(
  //       `/user/kelurahan/data?id_kecamatan=${id_kecamatan}`
  //     );
  //     const responseData = response.data.data.values;

  //     setKelurahanOptions(
  //       responseData.map(
  //         (item: { nama_kelurahan: string; id_kelurahan: number }) => ({
  //           value: item.id_kelurahan.toString(),
  //           label: item.nama_kelurahan,
  //           id_kelurahan: item.id_kelurahan,
  //         })
  //       )
  //     );
  //   } catch (error) {
  //     console.error("Error fetching kelurahan data:", error);
  //   } finally {
  //     if (globalStore.setLoading) globalStore.setLoading(false);
  //   }
  // };

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [fileListList, setFileListList] = useState<UploadFile[][]>([]);
  const [dateRangeList, setDateRangeList] = useState<any[]>([]);

  let tmpForm = {
    status_transporter: "",
    oldid: "",
    namatransporter: "",
    noizin: "",
    id_kecamatan: "",
    id_kelurahan: "",
    alamat: "",
    telp: "",
    email: "",
    catatan: "",
    link_input_izin: "",
    pemusnah: "",
    metode: "",
  };

  const [form, setForm] = useState(cloneDeep(tmpForm));

  const [uploading, setUploading] = useState(false);
  const [rowCount, setRowCount] = useState(1);

  const [showMOUFields, setShowMOUFields] = useState(false);

  // const props: UploadProps = {
  //   showUploadList: {
  //     showRemoveIcon: false,
  //   },
  //   onRemove: (file: any) => {
  //     const index = fileList.indexOf(file);
  //     const newFileList = fileList.slice();
  //     newFileList.splice(index, 1);
  //     setFileList(newFileList);
  //   },
  //   beforeUpload: (file: any) => {
  //     setFileList([...fileList, file]);

  //     return false;
  //   },
  //   fileList,
  // };

  // name: itu index 0 1 2 3 4 5 urut
  // key: itu name yang nambah terus 1 3 7 8 9 10
  // const handleAddRowDynamic = (add: Function) => {
  //   fileListList.push([]);
  //   dateRangeList.push([]);
  //   console.log(fileListList);
  //   add();
  // };
  // const handleRemoveRowDynamic = (
  //   remove: Function,
  //   name: number,
  //   key: number
  // ) => {
  //   console.log("----");
  //   console.log(key);
  //   console.log(name);
  //   remove(name);

  //   let tmpFileListList = [...fileListList];
  //   tmpFileListList.splice(name, 1);
  //   setFileListList(tmpFileListList);

  //   let tmpDateRangeList = [...dateRangeList];
  //   tmpDateRangeList.splice(name, 1);
  //   setDateRangeList(tmpDateRangeList);

  //   console.log(tmpFileListList);
  //   console.log(tmpDateRangeList);
  //   console.log("----[END]");
  // };

  // const beforeUploadFileDynamic = (file: RcFile, key: number) => {
  //   return false;
  // };

  // const onChangeFileDynamic = (
  //   file: UploadChangeParam<UploadFile<any>>,
  //   key: number,
  //   name: number
  // ) => {
  //   let tmpFileListList = [...fileListList];
  //   tmpFileListList[name] = [file.file];
  //   setFileListList(tmpFileListList);
  // };

  // const onRemoveFileDynamic = (
  //   file: UploadFile<any>,
  //   key: number,
  //   name: number
  // ) => {
  //   let tmpFileListList = [...fileListList];
  //   const index = tmpFileListList[name].indexOf(file);
  //   tmpFileListList[name].splice(index, 1);
  //   setFileListList(tmpFileListList);
  // };

  // // -- rangeDate
  // const onChangeRangeDateDynamic = (
  //   value: null | (Dayjs | null)[],
  //   dateStrings: string[],
  //   key: number,
  //   name: number
  // ) => {
  //   console.log(value);
  //   console.log(dateStrings);
  //   console.log(name);
  //   let tmpDateRangeList = [...dateRangeList];
  //   let tmpval: dayjs.Dayjs[] = [];
  //   if (value) {
  //     tmpval = [dayjs(dateStrings[0]), dayjs(dateStrings[1])];
  //   }
  //   console.log(tmpval);
  //   tmpDateRangeList[name] = tmpval;
  //   setDateRangeList(tmpDateRangeList);
  // };

  const handleChangeInput = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    // console.log(event);
    // console.log(event.target.name, event.target.value);
    // console.log();
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  // const handleKecamatanSelectChange = (value: any, name: any, event: any) => {
  //   const id_kecamatan = parseInt(value);
  //   setSelectedKecamatan(id_kecamatan);
  //   setSelectedKelurahan(null);
  //   getKelurahanData(id_kecamatan);
  //   setForm({
  //     ...form,
  //     [name]: value,
  //   });
  // };

  // const handleKelurahanSelectChange = (
  //   value: string,
  //   name: any,
  //   event: any
  // ) => {
  //   setSelectedKelurahan(parseInt(value));
  //   setForm({
  //     ...form,
  //     [name]: value,
  //   });
  // };

  const handleChangeSelect = (val: any, name: any, event: any) => {};

  // -- onSubmit
  const handleSubmit = async () => {
    console.log(form);

    let dataForm: any = new FormData();
    dataForm.append("oldid", form.oldid);
    dataForm.append("nama_transporter", form.namatransporter);
    dataForm.append("npwp_transporter", form.noizin);
    dataForm.append("id_kecamatan", form.id_kecamatan);
    dataForm.append("id_kelurahan", form.id_kelurahan);
    dataForm.append("alamat_transporter", form.alamat);
    dataForm.append("notlp", form.telp);
    dataForm.append("nohp", form.telp);
    dataForm.append("email", form.email);

    console.log(fileListList);

    // Append tgl_mulai and tgl_akhir based on dateRangeList
    fileListList.forEach((file, index) => {
      console.log(typeof file[0]);
      console.log(file[0].hasOwnProperty("blob"));
      //@ts-ignore
      if (file[0].hasOwnProperty("blob")) {
        // @ts-ignore
        dataForm.append("file_mou[]", file[0].blob, file[0].name);
      } else {
        //@ts-ignore
        dataForm.append("file_mou[]", file[0], file[0].fileName);
      }
      console.log(file);
      // return;
    });

    // Append tgl_mulai and tgl_akhir based on dateRangeList
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

      apimessage.open({
        message: "Validasi Transporter",
        description: "Pengajuan Transporter berhasil diterima.",

        duration: 2,
        type: "success",
      });

      router.push("/dashboard/admin/validasi");
    } catch (e) {
      console.error(e);
    } finally {
      if (globalStore.setLoading) globalStore.setLoading(false);
    }
  };
  // const [formInstance] = Form.useForm();
  const [formModal] = Form.useForm();
  const handleTolak = () => {
    Modal.info({
      title: "Berikan Catatan!",
      centered: true,
      closable: true,
      content: (
        <Form form={formModal} name="form_modal">
          <Form.Item
            name="form_catatan"
            label="Catatan"
            rules={[{ required: true }]}
          >
            <Input
              onChange={handleChangeInput}
              value={form.catatan}
              name="catatan"
            />
          </Form.Item>
        </Form>
      ),
      async onOk() {
        await ifTolak();
      },
    });
  };

  // -- onSubmit
  const ifTolak = async () => {
    console.log(form);

    let dataForm: any = new FormData();
    dataForm.append("oldid", form.oldid);
    dataForm.append("nama_transporter", form.namatransporter);
    dataForm.append("noizin", form.noizin);
    dataForm.append("id_kecamatan", form.id_kecamatan);
    dataForm.append("id_kelurahan", form.id_kelurahan);
    dataForm.append("alamat_transporter", form.alamat);
    dataForm.append("notlp", form.telp);
    dataForm.append("nohp", "-");
    dataForm.append("email", form.email);

    console.log(fileListList);

    // Append tgl_mulai and tgl_akhir based on dateRangeList
    fileListList.forEach((file, index) => {
      console.log(typeof file[0]);
      console.log(file[0].hasOwnProperty("blob"));
      //@ts-ignore
      if (file[0].hasOwnProperty("blob")) {
        // @ts-ignore
        dataForm.append("file_mou[]", file[0].blob, file[0].name);
      } else {
        //@ts-ignore
        dataForm.append("file_mou[]", file[0], file[0].fileName);
      }
      console.log(file);
      // return;
    });

    // Append tgl_mulai and tgl_akhir based on dateRangeList
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
      dataForm.append("status_transporter", "0");
      dataForm.append("catatan", formModal.getFieldValue("form_catatan"));
      url = "/user/pengajuan-transporter/validasi";
    }
    try {
      // @ts-ignore
      if (globalStore.setLoading) globalStore.setLoading(true);
      let responsenya = await api.post(url, dataForm);
      console.log(fileListList);
      console.log(dateRangeList);
      console.log(responsenya);

      apimessage.open({
        message: "Validasi Transporter",
        description: "Pengajuan Transporter ditolak.",
        duration: 2,
        type: "success",
      });
      router.push("/dashboard/admin/validasi");
    } catch (e) {
      console.error(e);
    } finally {
      // @ts-ignore
      if (globalStore.setLoading) globalStore.setLoading(false);
    }
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
    // let lengthfile = pengajuanTransporterStore.files?.length ?? 0;
    // let arrfile = [];
    // for (let index = 0; index < lengthfile; index++) {
    //   // const element = array[index];
    //   if (pengajuanTransporterStore.files) {
    //     let val = pengajuanTransporterStore.files[index];
    //     let tmpfile = await getFile(val.link_input);
    //     // let tmpawal = await setDateRangeList(val.tgl_mulai);
    //     if (tmpfile) {
    //       arrfile.push([tmpfile]);
    //     }
    //   }
    // }
    // console.log(arrfile);
    // setFileListList(arrfile as any[]);

    // const listMouDynamic = formInstance.getFieldValue("listMouDynamic");
    // console.log(listMouDynamic);
    // formInstance.setFieldsValue({
    //   listMouDynamic: arrfile,
    // });

    getLinkMOUHere();
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
    console.log(listMouDynamic);
    let kdate = Object.keys(listMouDynamic);
    console.log(kdate);
    for (let index = 0; index < kdate.length; index++) {
      if (kdate.includes("masaBerlaku")) {
        // let val =
        // @ts-ignore
        formInstance.setFieldValue[kdate[index]] = arrdate[index];
        // formInstance[kdate[index]] = arrdate[index];
      }
    }
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
    formInstance.setFieldsValue({
      listMouDynamic: arrlinkmou,
    });
  };

  const [formInstance] = Form.useForm();

  useLayoutEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get("action");
    // getKecamatanData();
    // console.log(router.query);
    // console.log(Object.values(pengajuanTransporterStore));
    // console.log(pengajuanTransporterStore);

    // jika create
    formInstance.resetFields();
    setForm(cloneDeep(tmpForm));

    // jika idnya kosong (dia melakukan refresh) balikin ke table
    if (action === "edit" || action === "validasi") {
      if (
        pengajuanTransporterStore.id_transporter_tmp == null ||
        pengajuanTransporterStore.id_transporter_tmp == 0
      ) {
        router.push("/dashboard/admin/validasi");
        return;
      }
      // jika edit set valuenya
      setForm({
        status_transporter:
          pengajuanTransporterStore.status_transporter_tmp?.toString() ?? "",
        oldid: pengajuanTransporterStore.id_transporter_tmp?.toString() ?? "",
        namatransporter:
          pengajuanTransporterStore.nama_transporter?.toString() ?? "",
        noizin: pengajuanTransporterStore.noizin?.toString() ?? "",
        pemusnah: pengajuanTransporterStore.nama_pemusnah?.toString() ?? "",
        metode: pengajuanTransporterStore.metode_pemusnah?.toString() ?? "",
        id_kecamatan: pengajuanTransporterStore.id_kecamatan?.toString() ?? "",
        id_kelurahan: pengajuanTransporterStore.id_kelurahan?.toString() ?? "",
        alamat: pengajuanTransporterStore.alamat_transporter?.toString() ?? "",
        telp: pengajuanTransporterStore.nohp?.toString() ?? "",
        email: pengajuanTransporterStore.email?.toString() ?? "",
        catatan: pengajuanTransporterStore.catatan?.toString() ?? "",
        link_input_izin:
          pengajuanTransporterStore.link_input_izin?.toString() ?? "",
      });

      formInstance.setFieldsValue({
        form_namatransporter: pengajuanTransporterStore.nama_transporter,
        form_npwp: pengajuanTransporterStore.npwp_transporter,
        form_kecamatan: pengajuanTransporterStore.id_kecamatan,
        form_kelurahan: pengajuanTransporterStore.id_kelurahan,
        form_alamat: pengajuanTransporterStore.alamat_transporter,
        form_nohp: pengajuanTransporterStore.notlp,
        form_email: pengajuanTransporterStore.email,
      });

      // getKelurahanData(parseInt(pengajuanTransporterStore.id_kecamatan ?? "0"));
      // getFile(pengajuanTransporterStore.files);
      getFilesHere();
    }
  }, []);
  return (
    <>
      {contextHolder}

      <table>
        <tbody>
          <tr>
            <td>Nama Transporter</td>
            <td>:</td>
            <td>
              <b>{form.namatransporter}</b>
            </td>
          </tr>
          <tr>
            <td>Nomor Izin</td>
            <td>:</td>
            <td>
              <b>{form.noizin}</b>
            </td>
          </tr>
          <tr>
            <td>Pemusnah</td>
            <td>:</td>
            <td>
              <b>{form.pemusnah}</b>
            </td>
          </tr>
          <tr>
            <td>Metode Pemusnahan</td>
            <td>:</td>
            <td>
              <b>{form.metode}</b>
            </td>
          </tr>
          {/* <tr>
            <td>Kecamatan</td>
            <td>:</td>
            <td>
              <b>
                {kecamatanOptions.length > 0 &&
                  (kecamatanOptions.find(
                    (v) =>
                      v.id_kecamatan.toString() == form.id_kecamatan.toString()
                  )?.label ??
                    "")}
              </b>
            </td>
          </tr>
          <tr>
            <td>Kelurahan</td>
            <td>:</td>
            <td>
              <b>
                {kelurahanOptions.length > 0 &&
                  (kelurahanOptions.find(
                    (v) =>
                      v.id_kelurahan.toString() == form.id_kelurahan.toString()
                  )?.label ??
                    "")}
              </b>
            </td>
          </tr> */}
          <tr>
            <td>Alamat</td>
            <td>:</td>
            <td>
              <b>{form.alamat}</b>
            </td>
          </tr>
          <tr>
            <td>Nomor Handphone</td>
            <td>:</td>
            <td>
              <b>{form.telp}</b>
            </td>
          </tr>
          <tr>
            <td>Email</td>
            <td>:</td>
            <td>
              <b>{form.email}</b>
            </td>
          </tr>
          <tr>
            <td>Link Izin</td>
            <td>:</td>
            <td>
              {/* <b>{form.link_input_izin}</b> */}
              <Button
                style={{ textDecoration: "underline" }}
                icon={<ExportOutlined />}
                onClick={() => window.open(form.link_input_izin, "_blank")}
                type="link"
              >
                Klik Disini.!
              </Button>
            </td>
          </tr>
          <tr>
            <td colSpan={3}>
              <hr />
            </td>
          </tr>
          <tr>
            <td>Link File MOU</td>
            <td>:</td>
            <td>
              {dateRangeList.map((val, index) => {
                let item = val[0];
                let dateAwalItem = dateRangeList[index][0];
                let dateAkhirItem = dateRangeList[index][1];
                let linkMou = linkMouList[index];
                return (
                  <React.Fragment key={`validasi-mou-${index}`}>
                    {dateAwalItem.format("DD MMMM YYYY").toString()}
                    {" - "}
                    {dateAkhirItem.format("DD MMMM YYYY").toString()}
                    <br />
                    <Button
                      style={{ textDecoration: "underline" }}
                      icon={<ExportOutlined />}
                      onClick={() => window.open(linkMou, "_blank")}
                      type="link"
                    >
                      Klik Disini.!
                    </Button>
                    {/* <a target="_blank" href={`${linkMou}`}>
                      <LinkOutlined /> Klik Disini!
                    </a> */}
                    <hr />
                  </React.Fragment>
                );
              })}
            </td>
          </tr>
          <tr>
            <td colSpan={3}>
              <Popconfirm
                title="Validasi Transporter"
                description="Apakah anda ingin melakukan validasi pada transporter ini?"
                onConfirm={handleSubmit}
                onCancel={handleTolak}
                okText="Validasi"
                cancelText="Tolak"
              >
                <Button style={{ width: "100%", backgroundColor: "yellow" }}>
                  Validasi
                </Button>
              </Popconfirm>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
};

export default FormValidasiTransporter;
