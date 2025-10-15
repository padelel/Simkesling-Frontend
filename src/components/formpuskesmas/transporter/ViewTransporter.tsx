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

import { ExportOutlined } from "@ant-design/icons";

import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { DatePicker, Space } from "antd";
import { RcFile, UploadChangeParam } from "antd/es/upload";
import api from "@/utils/HttpRequest";
import { useTransporterStore } from "@/stores/transporterStore";
import apifile from "@/utils/HttpRequestFile";
import axios from "axios";
import { fileTypeFromStream } from "file-type";
import router from "next/router";
import cloneDeep from "clone-deep";
import { useGlobalStore } from "@/stores/globalStore";

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

const ViewTransporter: React.FC = () => {
  const globalStore = useGlobalStore();
  const [apimessageCreate, contextHolderCreate] =
    notification.useNotification();
  const [apimessageUpdate, contextHolderUpdate] =
    notification.useNotification();

  const openNotificationCreate = (type: NotificationType) => {
    apimessageCreate[type]({
      message: "Tambah Transporter",
      description: "Transporter Berhasil Ditambahkan",
    });
  };

  const openNotificationUpdate = (type: NotificationType) => {
    apimessageUpdate[type]({
      message: "Update Transporter",
      description: "Transporter Berhasil Diupdate",
    });
  };

  const [formListKey, setFormListKey] = useState(new Date().toISOString());
  const transporterStore = useTransporterStore();
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
  const [dateRangeList, setDateRangeList] = useState<any[]>([]);
  const [linkMouList, setlinkMouList] = useState<string[]>([]);
  //     const [dateRangeAkhir, setDateRangeAkhir] = useState<any[]>([]);
  //   const [dateRangeAwal, setDateRangeAwal] = useState<any[]>([]);

  let tmpForm = {
    status_transporter: "",
    oldid: "",
    namatransporter: "",
    // npwp: "",
    id_kecamatan: "",
    id_kelurahan: "",
    alamat: "",
    telp: "",
    email: "",
    catatan: "",
    noizin: "",
    link_input_izin: "",
    pemusnah: "",
    metode: "",
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
    let lengthfile = transporterStore.files?.length ?? 0;
    let arrfile = [];
    for (let index = 0; index < lengthfile; index++) {
      // const element = array[index];
      if (transporterStore.files) {
        let val = transporterStore.files[index];
        let tmpfile = await getFile(val.file1);
        // let tmpawal = await setDateRangeList(val.tgl_mulai);
        arrfile.push([tmpfile]);
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
    getLinkMOUHere();
  };
  const getDatesHere = async () => {
    let lengthdate = transporterStore.files?.length ?? 0;
    let arrdate = [];
    for (let index = 0; index < lengthdate; index++) {
      // const element = array[index];
      if (transporterStore.files) {
        let val = transporterStore.files[index];
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
    let lengthlinkmou = transporterStore.files?.length ?? 0;
    let arrlinkmou: any[] = [];
    for (let index = 0; index < lengthlinkmou; index++) {
      // const element = array[index];
      if (transporterStore.files) {
        let val = transporterStore.files[index];
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
  useLayoutEffect(() => {
    getKecamatanData();
    console.log(router.query);
    console.log(Object.values(transporterStore));
    console.log(transporterStore);

    // jika create
    formInstance.resetFields();
    setForm(cloneDeep(tmpForm));

    if (
      transporterStore.id_transporter == null ||
      transporterStore.id_transporter == 0
    ) {
      router.push("/dashboard/user/transporter");
      return;
    }
    // jika edit set valuenya
    // setForm({
    //   status_transporter: transporterStore.status_transporter?.toString() ?? "",
    //   oldid: transporterStore.id_transporter?.toString() ?? "",
    //   namatransporter: transporterStore.nama_transporter?.toString() ?? "",
    //   npwp: transporterStore.npwp_transporter?.toString() ?? "",
    //   id_kecamatan: transporterStore.id_kecamatan?.toString() ?? "",
    //   id_kelurahan: transporterStore.id_kelurahan?.toString() ?? "",
    //   alamat: transporterStore.alamat_transporter?.toString() ?? "",
    //   telp: transporterStore.nohp?.toString() ?? "",
    //   email: transporterStore.email?.toString() ?? "",
    //   catatan: transporterStore.catatan?.toString() ?? "",
    // });
    setForm({
      status_transporter: transporterStore.status_transporter?.toString() ?? "",
      oldid: transporterStore.id_transporter?.toString() ?? "",
      namatransporter: transporterStore.nama_transporter?.toString() ?? "",
      id_kecamatan: transporterStore.id_kecamatan?.toString() ?? "",
      id_kelurahan: transporterStore.id_kelurahan?.toString() ?? "",
      alamat: transporterStore.alamat_transporter?.toString() ?? "",
      telp: transporterStore.nohp?.toString() ?? "",
      email: transporterStore.email?.toString() ?? "",
      catatan: transporterStore.catatan?.toString() ?? "",
      link_input_izin: transporterStore.link_input_izin?.toString() ?? "",
      noizin: transporterStore.noizin?.toString() ?? "",
      pemusnah: transporterStore.nama_pemusnah?.toString() ?? "",
      metode: transporterStore.metode_pemusnah?.toString() ?? "",
    });

    formInstance.setFieldsValue({
      form_namatransporter: transporterStore.nama_transporter,
      form_npwp: transporterStore.npwp_transporter,
      form_kecamatan: transporterStore.id_kecamatan,
      form_kelurahan: transporterStore.id_kelurahan,
      form_alamat: transporterStore.alamat_transporter,
      form_nohp: transporterStore.notlp,
      form_email: transporterStore.email,
    });

    getKelurahanData(parseInt(transporterStore.id_kecamatan ?? "0"));
    // getFile(transporterStore.files);
    getFilesHere();
  }, []);

  return (
    <>
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
            <td>No Izin</td>
            <td>:</td>
            <td>
              <b>{form.noizin}</b>
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
            <td>Link Izin</td>
            <td>:</td>
            <td>
              <a
                onClick={() => window.open(`${form.link_input_izin}`, "_blank")}
              >
                <ExportOutlined />
                <b>{"  "}Dokumen Izin</b>
              </a>
            </td>
          </tr>
          <tr>
            <td colSpan={3}>
              <hr />
            </td>
          </tr>
          <tr>
            <td>File MOU</td>
            <td>:</td>
            <td>
              <b>
                {dateRangeList.map((val, index) => {
                  let item = val[0];
                  let dateAwalItem = dateRangeList[index][0];
                  let dateAkhirItem = dateRangeList[index][1];
                  let linkMou = linkMouList[index];
                  return (
                    <React.Fragment key={`mou-${index}`}>
                      {dateAwalItem.format("DD MMMM YYYY").toString()}
                      {" - "}
                      {dateAkhirItem.format("DD MMMM YYYY").toString()}
                      <br />
                      {/* <a target="_blank" href={item.url}>
                        {item.name}
                      </a> */}
                      <a onClick={() => window.open(`${linkMou}`, "_blank")}>
                        <ExportOutlined />
                        <b>{"  "}Dokumen MOU</b>
                      </a>
                      <hr />
                    </React.Fragment>
                  );
                })}
              </b>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
};

export default ViewTransporter;
