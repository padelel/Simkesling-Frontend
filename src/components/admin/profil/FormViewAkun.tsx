import React, { useEffect, useLayoutEffect, useState } from "react";
import { Button, Form, Input, Select, Upload } from "antd";

import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import api from "@/utils/HttpRequest";
import router from "next/router";
import { useTambahAkunStore } from "@/stores/pengajuanAkunStore";
import { useGlobalStore } from "@/stores/globalStore";
import cloneDeep from "clone-deep";
import { RcFile, UploadFile, UploadProps } from "antd/es/upload";
import apifile from "@/utils/HttpRequestFile";
import { IconMap } from "antd/es/result";

import { LinkOutlined, ExportOutlined } from "@ant-design/icons";

const { TextArea } = Input;

const layout = {
  labelCol: { span: 14 },
  wrapperCol: { span: 17 },
};

const tailLayoutUpload = {
  wrapperCol: { offset: 8, span: 16 },
};

const FormTambahAkun: React.FC = () => {
  const globalStore = useGlobalStore();
  const tambahAkunStore = useTambahAkunStore();
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

  const [fileList, setFileList] = useState<UploadFile[]>([
    {
      uid: "",
      name: "",
      status: "done",
      url: "",
    },
  ]);
  const [fileListList, setFileListList] = useState<UploadFile[][]>([]);

  const [getPassword, setPassword] = useState({
    required: true,
  });

  let tmpForm = {
    oldid: "",
    nama_user: "",
    noreg_tempat: "",
    level: "",
    id_kecamatan: "",
    id_kelurahan: "",
    kecamatan: "",
    kelurahan: "",
    alamat_tempat: "",
    notelp: "",
    email: "",
    username: "",
    password: "",
    izin_ipal: "",
    izin_tps: "",
    file_izin_ipal: [] as any[],
    file_izin_tps: [] as any[],
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
    link_input_izin_ipal: "",
    link_input_izin_tps: "",
  };

  const [form, setForm] = useState(cloneDeep(tmpForm));

  const getKecamatanData = async () => {
    try {
      if (globalStore.setLoading) globalStore.setLoading(true);
      const response = await api.post("/user/kecamatan/data");
      const responseData = response.data.data.values;

      setKecamatanOptions(
        responseData.map(
          (item: { nama_kecamatan: string; id_kecamatan: number }) => ({
            label: item.nama_kecamatan,
            value: item.id_kecamatan.toString(),
            id_kecamatan: item.id_kecamatan.toString(),
          })
        )
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
        responseData.map(
          (item: { nama_kelurahan: string; id_kelurahan: number }) => ({
            value: item.id_kelurahan.toString(),
            label: item.nama_kelurahan,
            id_kelurahan: item.id_kelurahan.toString(),
          })
        )
      );
    } catch (error) {
      console.error("Error fetching kelurahan data:", error);
    } finally {
      if (globalStore.setLoading) globalStore.setLoading(false);
    }
  };

  const [formInstance] = Form.useForm();

  // useEffect(() => {
  //   console.log(Object.values(tambahAkunStore));
  //   getKecamatanData();
  //   formInstance.setFieldsValue({
  //     form_namauser: tambahAkunStore.nama_user,
  //     form_username: tambahAkunStore.username,
  //     form_noreg: tambahAkunStore.noreg_tempat,
  //     level: tambahAkunStore.level,
  //     form_kecamatan: tambahAkunStore.id_kecamatan,
  //     form_kelurahan: tambahAkunStore.id_kelurahan,
  //     form_alamat: tambahAkunStore.alamat_tempat,
  //     form_nohp: tambahAkunStore.notlp,
  //     form_email: tambahAkunStore.email,
  //   });
  // }, []);

  const [dateRangeList, setDateRangeList] = useState<any[]>([]);

  // const [form, setForm] = useState({
  //   id_user: "",
  //   nama_user: "",
  //   noreg_tempat: "",
  //   level: "",
  //   id_kecamatan: "",
  //   id_kelurahan: "",
  //   alamat_tempat: "",
  //   notelp: "",
  //   email: "",
  //   username: "",
  //   password: "",
  // });

  const handleChangeInput = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    console.log(event);
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleChangeSelect = (val: any, name: string, event: any) => {
    // console.log(val);
    // console.log(event.target);
    setForm({
      ...form,
      [name]: val,
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

  let tmpFileTps: any = [];
  let tmpFileIpal: any = [];

  const getFiles = async () => {
    console.log("--form#1", form);
    // console.log(form);
    const tempForm = cloneDeep(tambahAkunStore);
    console.log("--form#2", tempForm);
    let tempForm2 = cloneDeep({ ...form });
    let fileTps = await getFile(tempForm.izin_tps);
    let fileIpal = await getFile(tempForm.izin_ipal);
    console.log("--form#3", form);
    // console.log(form);
    console.log(tempForm);
    let file_izin_tps: any[] = [];
    let file_izin_ipal: any[] = [];
    if (fileTps) {
      file_izin_tps = [fileTps];
      tmpFileTps = [fileTps];
    }
    //   setForm({
    //     ...tempForm2,
    //     file_izin_tps: [fileTps],
    //   });
    // }
    if (fileIpal) {
      file_izin_ipal = [fileIpal];
      tmpFileIpal = [fileIpal];
    }
    //   setForm({
    //     ...tempForm2,
    //     file_izin_ipal: [fileIpal],
    //   });
    // }
    // if (fileTps && fileIpal) {
    // }
    console.log(fileTps);
    console.log(fileIpal);
    console.log(file_izin_tps);
    console.log(file_izin_ipal);
    setForm({
      ...tempForm2,
      file_izin_tps: file_izin_tps,
      file_izin_ipal: file_izin_ipal,
    });
    console.log("-outform file");
    console.log(form);
    // file_izin_ipal;
    // file_izin_tps;
    // ;
  };

  const setDataProfile = async () => {
    const akunStore = cloneDeep(tambahAkunStore);

    console.log(router.query);
    console.log(Object.values(tambahAkunStore));
    console.log(tambahAkunStore);

    // jika create
    // formInstance.resetFields();
    // setForm(cloneDeep(tmpForm));

    // setPassword({
    //   required: false,
    // });

    console.log("#0", akunStore);
    console.log("#1", form);

    // await getFiles();

    setForm({
      oldid: akunStore.id_user?.toString(),
      nama_user: akunStore.nama_user?.toString(),
      username: akunStore.username?.toString(),
      noreg_tempat: akunStore.noreg_tempat?.toString(),
      level: akunStore.level?.toString(),
      id_kecamatan: akunStore.id_kecamatan?.toString(),
      id_kelurahan: akunStore.id_kelurahan?.toString(),
      kecamatan: akunStore.kecamatan?.toString(),
      kelurahan: akunStore.kelurahan?.toString(),
      alamat_tempat: akunStore.alamat_tempat?.toString(),
      notelp: akunStore.nohp?.toString(),
      email: akunStore.email?.toString(),
      password: akunStore.email?.toString(),
      izin_ipal: akunStore.izin_ipal?.toString(),
      izin_tps: akunStore.izin_tps?.toString(),
      file_izin_ipal: tmpFileTps,
      file_izin_tps: tmpFileIpal,
      link_manifest: akunStore.link_manifest?.toString(),
      link_logbook: tambahAkunStore.link_logbook?.toString() ?? "",
      link_ujilab_cair: tambahAkunStore.link_ujilab_cair?.toString() ?? "",
      link_lab_ipal: tambahAkunStore.link_lab_ipal?.toString() ?? "",
      link_lab_lain: tambahAkunStore.link_lab_lain?.toString() ?? "",
      link_dokumen_lingkungan_rs:
        tambahAkunStore.link_dokumen_lingkungan_rs?.toString() ?? "",
      link_swa_pantau: tambahAkunStore.link_swa_pantau?.toString() ?? "",
      link_izin_transporter:
        tambahAkunStore.link_izin_transporter?.toString() ?? "",
      link_mou_transporter:
        tambahAkunStore.link_mou_transporter?.toString() ?? "",
      link_lab_limbah_cair:
        tambahAkunStore.link_lab_limbah_cair?.toString() ?? "",
      link_izin_ipal: tambahAkunStore.link_izin_ipal?.toString() ?? "",
      link_izin_tps: tambahAkunStore.link_izin_tps?.toString() ?? "",
      link_ukl: tambahAkunStore.link_ukl?.toString() ?? "",
      link_upl: tambahAkunStore.link_upl?.toString() ?? "",
      kapasitas_ipal: tambahAkunStore.kapasitas_ipal?.toString() ?? "",
      link_input_izin_ipal:
        tambahAkunStore.link_input_izin_ipal?.toString() ?? "",
      link_input_izin_tps:
        tambahAkunStore.link_input_izin_tps?.toString() ?? "",
    });
    console.log("#2", form);

    // formInstance.setFieldsValue({
    //   form_namauser: tambahAkunStore.nama_user,
    //   form_username: tambahAkunStore.username,
    //   form_noreg: tambahAkunStore.noreg_tempat,
    //   level: tambahAkunStore.level,
    //   form_kecamatan: tambahAkunStore.id_kecamatan?.toString(),
    //   form_kelurahan: tambahAkunStore.id_kelurahan?.toString(),
    //   form_alamat: tambahAkunStore.alamat_tempat,
    //   form_nohp: tambahAkunStore.notlp,
    //   form_email: tambahAkunStore.email,
    // });
    // getKecamatanData();
    // getKelurahanData(akunStore.id_kecamatan ?? "0");
    console.log("#3", form);
  };

  useEffect(() => {
    // jika idnya kosong (dia melakukan refresh) balikin ke table
    if (tambahAkunStore.id_user == null || tambahAkunStore.id_user == 0) {
      router.push("/dashboard/admin/manajemen/profil");
      return;
    }
    let newFileList = [fileList];
    setDataProfile();
  }, []);

  const props: UploadProps = {
    showUploadList: {
      showRemoveIcon: false,
    },
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

  const beforeUploadFileDynamic = (file: RcFile, key: number) => {
    return false;
  };

  // -- onSubmit
  const handleSubmit = async () => {
    console.log(form);

    let dataForm: any = new FormData();
    dataForm.append("oldid", form.oldid);
    dataForm.append("nama_user", form.nama_user);
    dataForm.append("username", form.username);
    dataForm.append("password", form.password);
    dataForm.append("noreg_tempat", form.noreg_tempat);
    dataForm.append("level", form.level);
    dataForm.append("id_kecamatan", form.id_kecamatan);
    dataForm.append("id_kelurahan", form.id_kelurahan);
    dataForm.append("alamat_tempat", form.alamat_tempat);
    dataForm.append("notlp", form.notelp);
    dataForm.append("email", form.email);

    let url = "/user/puskesmas-rumahsakit/create";
    if (router.query.action == "edit") {
      url = "/user/puskesmas-rumahsakit/update";
    }

    try {
      if (globalStore.setLoading) globalStore.setLoading(true);
      let responsenya = await api.post(url, dataForm);

      router.push("/dashboard/admin/manajemen/profil");
    } catch (e) {
      console.error(e);
    } finally {
      if (globalStore.setLoading) globalStore.setLoading(false);
    }
  };
  return (
    <div>
      <table>
        <tbody>
          <tr>
            <td>Nama Instansi</td>
            <td>:</td>
            <td>
              <b>{form.nama_user}</b>
            </td>
          </tr>
          <tr>
            <td>Username</td>
            <td>:</td>
            <td>
              <b>{form.username}</b>
            </td>
          </tr>
          <tr>
            <td>Nomor Registrasi / Nomor Izin Rumah Sakit</td>
            <td>:</td>
            <td>
              <b>{form.noreg_tempat}</b>
            </td>
          </tr>
          <tr>
            <td>Jenis Instansi</td>
            <td>:</td>
            <td>
              <b>
                {form.level.toString() == "2" ? "Rumah Sakit" : "Puskesmas"}
              </b>
            </td>
          </tr>
          <tr>
            <td>Kecamatan</td>
            <td>:</td>
            <td>
              <b>
                {/* {kecamatanOptions.length > 0 &&
                kecamatanOptions[0].id_kecamatan.toString()} */}
                {/* {kecamatanOptions.length > 0 &&
                  (kecamatanOptions.find(
                    (v) =>
                      v.id_kecamatan.toString() == form.id_kecamatan.toString()
                  )?.label ??
                    "")} */}
                {form.kecamatan}
              </b>
            </td>
          </tr>
          <tr>
            <td>Kelurahan</td>
            <td>:</td>
            <td>
              <b>
                {/* {form.id_kelurahan.toString()}
              {kelurahanOptions.length > 0 &&
                kelurahanOptions[2].id_kelurahan.toString()} */}
                {/* {kelurahanOptions.length > 0 &&
                  (kelurahanOptions.find(
                    (v) =>
                      v.id_kelurahan.toString() == form.id_kelurahan.toString()
                  )?.label ??
                    "")} */}
                {form.kelurahan}
              </b>
            </td>
          </tr>
          <tr>
            <td>Nomor Hp</td>
            <td>:</td>
            <td>
              <b>{form.notelp}</b>
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
            <td>Kapasitas IPAL</td>
            <td>:</td>
            <td>
              <b>{form.kapasitas_ipal}</b>
            </td>
          </tr>
          {/* <tr>
            <td>Izin Ipal</td>
            <td>:</td>
            <td>
              {form.file_izin_ipal.length > 0 && (
                <a target="_blank" href={form.file_izin_ipal[0].url ?? "#"}>
                  {form.file_izin_ipal[0].name ?? "-"}
                </a>
              )}
            </td>
          </tr>
          <tr>
            <td>Izin TPS</td>
            <td>:</td>
            <td>
              {form.file_izin_tps.length > 0 && (
                <a target="_blank" href={form.file_izin_tps[0].url ?? "#"}>
                  {form.file_izin_tps[0].name ?? "-"}
                </a>
              )}
            </td>
          </tr> */}
          <tr>
            <td>Link Manifest</td>
            <td>:</td>
            <td>
              <Button
                style={{ textDecoration: "underline" }}
                icon={<ExportOutlined />}
                onClick={() => window.open(form.link_manifest, "_blank")}
                type="link">
                Klik Disini.!
              </Button>
            </td>
          </tr>
          <tr>
            <td>Link Logbook</td>
            <td>:</td>
            <td>
              <Button
                style={{ textDecoration: "underline" }}
                icon={<ExportOutlined />}
                onClick={() => window.open(form.link_logbook, "_blank")}
                type="link">
                Klik Disini.!
              </Button>
            </td>
          </tr>
          <tr>
            <td>Link Lab Ipal</td>
            <td>:</td>
            <td>
              <Button
                style={{ textDecoration: "underline" }}
                icon={<ExportOutlined />}
                onClick={() => window.open(form.link_lab_ipal, "_blank")}
                type="link">
                Klik Disini.!
              </Button>
            </td>
          </tr>
          <tr>
            <td>Link Lab Lain</td>
            <td>:</td>
            <td>
              <Button
                style={{ textDecoration: "underline" }}
                icon={<ExportOutlined />}
                onClick={() => window.open(form.link_lab_lain, "_blank")}
                type="link">
                Klik Disini.!
              </Button>
            </td>
          </tr>
          <tr>
            <td>Link Dokumen Lingkungan Rumah Sakit</td>
            <td>:</td>
            <td>
              <Button
                style={{ textDecoration: "underline" }}
                icon={<ExportOutlined />}
                onClick={() =>
                  window.open(form.link_dokumen_lingkungan_rs, "_blank")
                }
                type="link">
                Klik Disini.!
              </Button>
            </td>
          </tr>
          <tr>
            <td>Link Izin Transporter</td>
            <td>:</td>
            <td>
              <Button
                style={{ textDecoration: "underline" }}
                icon={<ExportOutlined />}
                onClick={() =>
                  window.open(form.link_izin_transporter, "_blank")
                }
                type="link">
                Klik Disini.!
              </Button>
            </td>
          </tr>
          <tr>
            <td>Link MOU Transporter</td>
            <td>:</td>
            <td>
              <Button
                style={{ textDecoration: "underline" }}
                icon={<ExportOutlined />}
                onClick={() => window.open(form.link_mou_transporter, "_blank")}
                type="link">
                Klik Disini.!
              </Button>
            </td>
          </tr>
          {/* <tr>
            <td>Link Swa Pantau</td>
            <td>:</td>
            <td>
              <Button
                style={{ textDecoration: "underline" }}
                icon={<ExportOutlined />}
                onClick={() => window.open(form.link_swa_pantau, "_blank")}
                type="link"
              >
                Klik Disini.!
              </Button>
            </td>
          </tr>
          <tr>
            <td>Link Lab Limbah Cair</td>
            <td>:</td>
            <td>
              <Button
                style={{ textDecoration: "underline" }}
                icon={<ExportOutlined />}
                onClick={() => window.open(form.link_lab_limbah_cair, "_blank")}
                type="link"
              >
                Klik Disini.!
              </Button>
            </td>
          </tr>
          <tr>
            <td>Link Izin IPAL</td>
            <td>:</td>
            <td>
              <Button
                style={{ textDecoration: "underline" }}
                icon={<ExportOutlined />}
                onClick={() => window.open(form.link_izin_ipal, "_blank")}
                type="link"
              >
                Klik Disini.!
              </Button>
            </td>
          </tr>
          <tr>
            <td>Link Izin TPS</td>
            <td>:</td>
            <td>
              <Button
                style={{ textDecoration: "underline" }}
                icon={<ExportOutlined />}
                onClick={() => window.open(form.link_izin_tps, "_blank")}
                type="link"
              >
                Klik Disini.!
              </Button>
            </td>
          </tr>
          <tr>
            <td>Link Input Izin IPAL</td>
            <td>:</td>
            <td>
              <Button
                style={{ textDecoration: "underline" }}
                icon={<ExportOutlined />}
                onClick={() => window.open(form.link_input_izin_ipal, "_blank")}
                type="link"
              >
                Klik Disini.!
              </Button>
            </td>
          </tr>
          <tr>
            <td>Link Input Izin TPS</td>
            <td>:</td>
            <td>
              <Button
                style={{ textDecoration: "underline" }}
                icon={<ExportOutlined />}
                onClick={() => window.open(form.link_input_izin_tps, "_blank")}
                type="link"
              >
                Klik Disini.!
              </Button>
            </td>
          </tr>
          <tr>
            <td>Link UKL</td>
            <td>:</td>
            <td>
              <Button
                style={{ textDecoration: "underline" }}
                icon={<ExportOutlined />}
                onClick={() => window.open(form.link_ukl, "_blank")}
                type="link"
              >
                Klik Disini.!
              </Button>
            </td>
          </tr>
          <tr>
            <td>Link UPL</td>
            <td>:</td>
            <td>
              <Button
                style={{ textDecoration: "underline" }}
                icon={<ExportOutlined />}
                onClick={() => window.open(form.link_upl, "_blank")}
                type="link"
              >
                Klik Disini.!
              </Button>
            </td>
          </tr> */}
        </tbody>
      </table>
    </div>
  );
};

export default FormTambahAkun;
