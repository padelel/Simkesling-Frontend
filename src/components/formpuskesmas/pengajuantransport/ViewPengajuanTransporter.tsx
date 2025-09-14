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
import { usePengajuanTransporterStore } from "@/stores/pengajuanTransporterStore";
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

const ViewPengajuanTransporter: React.FC = () => {
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
  const [dateRangeList, setDateRangeList] = useState<any[]>([]);
  const [linkMouList, setlinkMouList] = useState<string[]>([]);
  //     const [dateRangeAkhir, setDateRangeAkhir] = useState<any[]>([]);
  //   const [dateRangeAwal, setDateRangeAwal] = useState<any[]>([]);

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
        arrfile.push([1]);
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
  };

  const [formInstance] = Form.useForm();
  useLayoutEffect(() => {
    // getKecamatanData();
    console.log(router.query);
    console.log(Object.values(pengajuanTransporterStore));
    console.log(pengajuanTransporterStore);

    // jika create
    formInstance.resetFields();
    setForm(cloneDeep(tmpForm));

    if (
      pengajuanTransporterStore.id_transporter_tmp == null ||
      pengajuanTransporterStore.id_transporter_tmp == 0
    ) {
      router.push("/dashboard/user/pengajuantransporter");
      return;
    }
    // jika edit set valuenya
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
      nama_pemusnah: pengajuanTransporterStore.nama_pemusnah?.toString() ?? "",
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
      form_telp: pengajuanTransporterStore.nohp,
      form_email: pengajuanTransporterStore.email,
      form_catatan: pengajuanTransporterStore.catatan,
      form_namaPemusnah: pengajuanTransporterStore.nama_pemusnah,
      form_metodePemusnah: pengajuanTransporterStore.metode_pemusnah,
      form_linkInputIzin: pengajuanTransporterStore.link_input_izin,
      // form_mou: pengajuanTransporterStore.link,
    });

    // getKelurahanData(parseInt(pengajuanTransporterStore.id_kecamatan ?? "0"));
    // getFile(pengajuanTransporterStore.files);
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
            <td>Alamat</td>
            <td>:</td>
            <td>
              <b>{form.alamat}</b>
            </td>
          </tr>
          <tr>
            <td>telp</td>
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
            <td>Nama Pemusnah</td>
            <td>:</td>
            <td>
              <b>{form.nama_pemusnah}</b>
            </td>
          </tr>
          <tr>
            <td>Metode Pemusnah</td>
            <td>:</td>
            <td>
              <b>{form.metode_pemusnah}</b>
            </td>
          </tr>
          <tr>
            <td>Link Izin</td>
            <td>:</td>
            <td>
              <a
                onClick={() =>
                  window.open(`${form.link_input_izin}`, "_blank")
                }>
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
                    <>
                      {dateAwalItem.format("DD MMMM YYYY").toString()}
                      {" - "}
                      {dateAkhirItem.format("DD MMMM YYYY").toString()}
                      <br />
                      {/* <a target="_blank" href={item.url}>
                        {item.name}
                      </a> */}
                      <a onClick={() => window.open(`${linkMou}`, "_blank")}>
                        <ExportOutlined />
                        {"  "}Dokumen MOU
                      </a>
                      <hr />
                    </>
                  );
                })}
              </b>
            </td>
          </tr>
          <tr>
            <td>Catatan</td>
            <td>:</td>
            <td>
              <b>{form.catatan}</b>
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
};

export default ViewPengajuanTransporter;
