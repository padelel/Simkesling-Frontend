import React, { useEffect, useState } from "react";
import {
  Button,
  Form,
  Input,
  Select,
  Upload,
  UploadFile,
  UploadProps,
  message,
  Radio,
  InputNumber,
} from "antd";

import { UploadOutlined, CheckCircleOutlined } from "@ant-design/icons";
import api from "@/utils/HttpRequest";
import { DatePicker, Space } from "antd";
import type { DatePickerProps, RangePickerProps } from "antd/es/date-picker";
import { RcFile, UploadChangeParam } from "antd/es/upload";
import { useUserLoginStore } from "@/stores/userLoginStore";
import { useGlobalStore } from "@/stores/globalStore";
import { MUser, User } from "@/models/MUser";
import apifile from "@/utils/HttpRequestFile";
import Notif from "@/utils/Notif";

const { TextArea } = Input;

const layout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 6 },
};

const tailLayout = {
  wrapperCol: { offset: 12, span: 16 },
};

const FormProfile = () => {
  const [kecamatanOptions, setKecamatanOptions] = useState<
    { value: string; label: string; id_kecamatan: number }[]
  >([]);
  const [kelurahanOptions, setKelurahanOptions] = useState<
    { value: string; label: string; id_kelurahan: number }[]
  >([]);
  const [selectedKelurahan, setSelectedKelurahan] = useState<number | null>(
    null
  );
  const [selectedKecamatan, setSelectedKecamatan] = useState<number | null>(
    null
  );
  const globalStore = useGlobalStore();
  const userLoginStore = useUserLoginStore();
  const [fileTps, setFileTps] = useState<UploadFile[]>([]);
  const [fileIpal, setFileIpal] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);

  const [linkDokumenLingkunganRS, setLinkDokumenLingkunganRS] = useState("");

  let tmpForm = {
    nama: "",
    noizin: "",
    id_kecamatan: "",
    id_kelurahan: "",
    alamat: "",
    telp: "",
    email: "",
    level: "",
    username: "",
    password: "",
    oldid: "",
    link_dokumen_lingkungan_rs: "",
    link_swa_pantau: "",
    link_lab_limbah_cair: "",
    link_izin_ipal: "",
    link_ukl: "",
    link_upl: "",
    link1: "",
    link2: "",
    link3: "",
    kapasitas_ipal: "",
    kapasitas_ipal_option: "ada", // "ada" or "tidak_ada"
    link_input_izin_ipal: "",
    link_input_dokumen_lingkungan_rs: "",
    link_manifest: "",
    link_logbook: "",
    link_lab_ipal: "",
    link_lab_lain: "",
    link_izin_transporter: "",
    link_mou_transporter: "",
  };
  const [form, setForm] = useState(tmpForm);

  const handleChangeInput = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    console.log(event);
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const getKecamatanData = async () => {
    try {
      if (globalStore.setLoading) globalStore.setLoading(true);
      const response = await api.post("/user/kecamatan/data");
      const responseData = response.data.data.values;

      setKecamatanOptions(
        responseData.map(
          (item: { nama_kecamatan: string; id_kecamatan: number }) => ({
            value: item.id_kecamatan.toString(),
            label: item.nama_kecamatan,
            id_kecamatan: item.id_kecamatan,
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
            id_kelurahan: item.id_kelurahan,
          })
        )
      );
    } catch (error) {
      console.error("Error fetching kelurahan data:", error);
    } finally {
      if (globalStore.setLoading) globalStore.setLoading(false);
    }
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

  const handleSubmit = async () => {
    console.log(form);
    console.log(fileTps);
    console.log(fileIpal);

    let dataForm: any = new FormData();
    dataForm.append("oldid", form.oldid);
    dataForm.append("nama_user", form.nama);
    dataForm.append("username", form.username);
    dataForm.append("password", form.password);
    dataForm.append("noreg_tempat", form.noizin);
    dataForm.append("level", form.level);
    dataForm.append("id_kecamatan", form.id_kecamatan);
    dataForm.append("id_kelurahan", form.id_kelurahan);
    dataForm.append("alamat_tempat", form.alamat);
    dataForm.append("notlp", form.telp);
    dataForm.append("email", form.email);
    dataForm.append(
      "link_dokumen_lingkungan_rs",
      form.link_dokumen_lingkungan_rs
    );
    dataForm.append("link_swa_pantau", form.link_swa_pantau);
    dataForm.append("link_lab_limbah_cair", form.link_lab_limbah_cair);
    dataForm.append("link_izin_ipal", form.link_izin_ipal);
    dataForm.append("link_ukl", form.link_ukl);
    dataForm.append("link_upl", form.link_upl);
    dataForm.append("link1", form.link1);
    dataForm.append("link2", form.link2);
    dataForm.append("link3", form.link3);
    dataForm.append("kapasitas_ipal", form.kapasitas_ipal);
    dataForm.append("kapasitas_ipal_option", form.kapasitas_ipal_option);
    dataForm.append("link_input_izin_ipal", form.link_input_izin_ipal);
    dataForm.append(
      "link_input_dokumen_lingkungan_rs",
      form.link_input_dokumen_lingkungan_rs
    );
    dataForm.append("link_manifest", form.link_manifest);
    dataForm.append("link_logbook", form.link_logbook);
    dataForm.append("link_lab_ipal", form.link_lab_ipal);
    dataForm.append("link_lab_lain", form.link_lab_lain);
    dataForm.append("link_izin_transporter", form.link_izin_transporter);
    dataForm.append("link_mou_transporter", form.link_mou_transporter);

    if (fileTps.length > 0) {
      let file = fileTps[0];
      if (file.hasOwnProperty("blob")) {
        // @ts-ignore
        dataForm.append("file_izin_tps", file.blob);
      } else {
        dataForm.append("file_izin_tps", file.originFileObj);
      }
    }
    if (fileIpal.length > 0) {
      let file = fileIpal[0];
      if (file.hasOwnProperty("blob")) {
        // @ts-ignore
        dataForm.append("file_izin_ipal", file.blob);
      } else {
        dataForm.append("file_izin_ipal", file.originFileObj);
      }
    }

    let url = "/user/puskesmas-rumahsakit/update";
    try {
      if (globalStore.setLoading) globalStore.setLoading(true);
      let responsenya = await api.post(url, dataForm);
      Notif("success", "Success.!", "Berhasil Update Profil");
      getDataProfile();
    } catch (e) {
      console.error(e);
    } finally {
      if (globalStore.setLoading) globalStore.setLoading(false);
    }
  };

  const [formInstance] = Form.useForm();
  const getDataProfile = async () => {
    await getKecamatanData();
    const resp = await api.post("/user/puskesmas-rumahsakit/data-profile");
    const user: User = resp.data.data.data;
    console.log(user);
    setForm({
      ...form,
      oldid: user.id_user?.toString() ?? "",
      username: user.username?.toString() ?? "",
      password: "",
      level: user.level?.toString() ?? "",
      nama: user.nama_user ?? "",
      noizin: user?.noreg_tempat ?? "",
      id_kecamatan: user?.id_kecamatan?.toString() ?? "",
      id_kelurahan: user?.id_kelurahan?.toString() ?? "",
      alamat: user?.alamat_tempat ?? "",
      telp: user?.notlp ?? "",
      email: user?.email ?? "",
      link_dokumen_lingkungan_rs: user?.link_dokumen_lingkungan_rs ?? "",
      link_swa_pantau: user?.link_swa_pantau ?? "",
      link_lab_limbah_cair: user?.link_lab_limbah_cair ?? "",
      link_izin_ipal: user?.link_izin_ipal ?? "",
      link_ukl: user?.link_ukl ?? "",
      link_upl: user?.link_upl ?? "",
      link1: user?.link1 ?? "",
      link2: user?.link2 ?? "",
      link3: user?.link3 ?? "",
      kapasitas_ipal: user?.kapasitas_ipal ?? "",
      kapasitas_ipal_option: user?.kapasitas_ipal_option ?? (user?.kapasitas_ipal === "Tidak ada pemeriksaan" ? "tidak_ada" : "ada"),
      link_input_izin_ipal: user?.link_input_izin_ipal ?? "",
      link_input_dokumen_lingkungan_rs:
        user?.link_input_dokumen_lingkungan_rs ?? "",
      link_manifest: user?.link_manifest ?? "",
      link_logbook: user?.link_logbook ?? "",
      link_lab_ipal: user?.link_lab_ipal ?? "",
      link_lab_lain: user?.link_lab_lain ?? "",
      link_izin_transporter: user?.link_izin_transporter ?? "",
      link_mou_transporter: user?.link_mou_transporter ?? "",
    });
    setLinkDokumenLingkunganRS(user.link_dokumen_lingkungan_rs);
    formInstance.setFieldsValue({
      form_username: user?.username ?? "",
      form_password: "",
      form_nama: user?.nama_user ?? "",
      form_noIzin: user?.noreg_tempat ?? "",
      form_kecamatan: user?.id_kecamatan?.toString() ?? "",
      form_kelurahan: user?.id_kelurahan?.toString() ?? "",
      form_alamat: user?.alamat_tempat ?? "",
      form_notelp: user?.notlp ?? "",
      form_email: user?.email ?? "",
      form_kapasitasIpal: user?.kapasitas_ipal ?? "",
      form_kapasitasIpal_option: user?.kapasitas_ipal_option ?? (user?.kapasitas_ipal === "Tidak ada pemeriksaan" ? "tidak_ada" : "ada"),
      form_inputLinkIzinIpal: user?.link_input_izin_ipal ?? "",
      form_link_input_dokumen_lingkungan_rs:
        user?.link_input_dokumen_lingkungan_rs ?? "",
      form_link_manifest: user?.link_manifest ?? "",
      form_link_logbook: user?.link_logbook ?? "",
      form_link_lab_ipal: user?.link_lab_ipal ?? "",
      form_link_lab_lain: user?.link_lab_lain ?? "",
      form_link_izin_transporter: user?.link_izin_transporter ?? "",
      form_link_mou_transporter: user?.link_mou_transporter ?? "",
    });
    let id_kec = user?.id_kecamatan ?? 0;
    getKelurahanData(parseInt(id_kec.toString()));
  };

  useEffect(() => {
    console.log("profile");
    console.log(userLoginStore.user);
    getDataProfile();
  }, []);
  const inputStyles = {
    width: "400px",
    height: "35px",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
  };
  return (
    <>
      <div style={{ display: "flex", justifyContent: "center" }}>
        <h2>Profile Saya</h2>
      </div>
      <div style={{ justifyContent: "center" }}>
        <Form
          form={formInstance}
          onFinish={handleSubmit}
          {...layout}
          name="control-hooks">
          <Form.Item
            name="form_username"
            label="Username"
            rules={[{ required: true }]}>
            <Input
              onChange={handleChangeInput}
              value={form.username}
              name="username"
              style={inputStyles}
            />
          </Form.Item>
          <Form.Item
            name="form_password"
            label="Password (silahkan isi jika ingin mengganti password)"
            rules={[]}>
            <Input.Password
              onChange={handleChangeInput}
              value={form.password}
              name="password"
              style={inputStyles}
            />
          </Form.Item>
          <Form.Item
            name="form_nama"
            label="Nama Puskemas/RS"
            rules={[{ required: true }]}>
            <Input
              onChange={handleChangeInput}
              value={form.nama}
              name="nama"
              style={inputStyles}
            />
          </Form.Item>
          <Form.Item
            name="form_noIzin"
            label="Nomor Izin"
            rules={[{ required: true }]}>
            <Input
              onChange={handleChangeInput}
              value={form.noizin}
              name="noizin"
              style={inputStyles}
            />
          </Form.Item>
          <Form.Item
            name="form_kecamatan"
            label="Kecamatan"
            initialValue={form.id_kecamatan}
            rules={[{ required: true }]}>
            <Select
              style={{
                width: 250,
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
              }}
              value={form.id_kecamatan}
              onChange={(v) =>
                handleKecamatanSelectChange(v, "id_kecamatan", event)
              }
              placeholder="Silahkan Pilih Kecamatan"
              allowClear
              options={kecamatanOptions}
            />
          </Form.Item>
          <Form.Item
            name="form_kelurahan"
            label="Kelurahan"
            initialValue={form.id_kelurahan}
            rules={[{ required: true }]}>
            <Select
              style={{
                width: 250,
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
              }}
              value={form.id_kelurahan}
              onChange={(v) =>
                handleKelurahanSelectChange(v, "id_kelurahan", event)
              }
              placeholder="Silahkan Pilih Kelurahan"
              allowClear
              options={kelurahanOptions}
            />
          </Form.Item>
          <Form.Item
            name="form_notelp"
            label="Nomor Telepon"
            rules={[{ required: true }]}>
            <Input
              onChange={handleChangeInput}
              value={form.telp}
              name="telp"
              style={inputStyles}
            />
          </Form.Item>
          <Form.Item
            name="form_email"
            label="Email"
            rules={[{ required: true }]}>
            <Input
              onChange={handleChangeInput}
              value={form.email}
              name="email"
              style={inputStyles}
            />
          </Form.Item>
          <Form.Item
            name="form_kapasitasIpal_option"
            label="Kapasitas IPAL"
            rules={[{ required: true }]}
          >
            <Radio.Group
              value={form.kapasitas_ipal_option}
              onChange={(e) => {
                const value = e.target.value;
                setForm({
                  ...form,
                  kapasitas_ipal_option: value,
                  kapasitas_ipal: value === "tidak_ada" ? "Tidak ada pemeriksaan" : "",
                });
              }}
            >
              <Radio value="ada">Ada pemeriksaan</Radio>
              <Radio value="tidak_ada">Tidak ada pemeriksaan</Radio>
            </Radio.Group>
          </Form.Item>

          {form.kapasitas_ipal_option === "ada" && (
            <Form.Item
              name="form_kapasitasIpal"
              label="Nilai Kapasitas IPAL (m³)"
              rules={[{ required: true, message: "Masukkan nilai kapasitas IPAL" }]}
            >
              <InputNumber
                onChange={(value) => {
                  setForm({
                    ...form,
                    kapasitas_ipal: value?.toString() || "",
                  });
                }}
                value={form.kapasitas_ipal ? parseFloat(form.kapasitas_ipal) : undefined}
                style={{ width: "100%" }}
                placeholder="Masukkan nilai kapasitas dalam m³"
                min={0}
                step={0.1}
                addonAfter="m³"
              />
            </Form.Item>
          )}
          <Form.Item
            name="form_link_input_dokumen_lingkungan_rs"
            label="Link Dokumen Lingkungan"
            rules={[
              {
                required: form.link_input_dokumen_lingkungan_rs.length < 1,
                message: "Masukan Link Dokumen Lingkungan",
              },
            ]}>
            <Input
              style={inputStyles}
              onChange={handleChangeInput}
              value={form.link_input_dokumen_lingkungan_rs}
              name="link_input_dokumen_lingkungan_rs"
            />
            <Button
              style={{ textDecoration: "underline" }}
              icon={<UploadOutlined />}
              type="link"
              onClick={() => window.open(linkDokumenLingkunganRS, "_blank")}>
              Klik Untuk Upload Dokumen Lingkungan RS
            </Button>
          </Form.Item>

          <Form.Item
            name="form_link_manifest"
            label="Link Manifest"
            rules={[
              {
                required: true,
                message: "Link manifest wajib diisi.",
              },
            ]}>
            <Input
              style={inputStyles}
              onChange={handleChangeInput}
              value={form.link_manifest}
              name="link_manifest"
              placeholder="Masukkan link manifest"
            />
          </Form.Item>

          <Form.Item
            name="form_link_logbook"
            label="Link Logbook"
            rules={[
              {
                required: true,
                message: "Link logbook wajib diisi.",
              },
            ]}>
            <Input
              style={inputStyles}
              onChange={handleChangeInput}
              value={form.link_logbook}
              name="link_logbook"
              placeholder="Masukkan link logbook"
            />
          </Form.Item>

          <Form.Item
            name="form_link_lab_ipal"
            label="Link Lab IPAL"
            rules={[
              {
                required: true,
                message: "Link lab IPAL wajib diisi.",
              },
            ]}>
            <Input
              style={inputStyles}
              onChange={handleChangeInput}
              value={form.link_lab_ipal}
              name="link_lab_ipal"
              placeholder="Masukkan link lab IPAL"
            />
          </Form.Item>

          <Form.Item
            name="form_link_lab_lain"
            label="Link Lab Lain"
            rules={[
              {
                required: true,
                message: "Link lab lain wajib diisi.",
              },
            ]}>
            <Input
              style={inputStyles}
              onChange={handleChangeInput}
              value={form.link_lab_lain}
              name="link_lab_lain"
              placeholder="Masukkan link lab lain"
            />
          </Form.Item>

          <Form.Item
            name="form_link_izin_transporter"
            label="Link Izin Transporter"
            rules={[
              {
                required: true,
                message: "Link izin transporter wajib diisi.",
              },
            ]}>
            <Input
              style={inputStyles}
              onChange={handleChangeInput}
              value={form.link_izin_transporter}
              name="link_izin_transporter"
              placeholder="Masukkan link izin transporter"
            />
          </Form.Item>

          <Form.Item
            name="form_link_mou_transporter"
            label="Link MOU Transporter"
            rules={[
              {
                required: true,
                message: "Link MOU transporter wajib diisi.",
              },
            ]}>
            <Input
              style={inputStyles}
              onChange={handleChangeInput}
              value={form.link_mou_transporter}
              name="link_mou_transporter"
              placeholder="Masukkan link MOU transporter"
            />
          </Form.Item>

          <Form.Item {...tailLayout}>
            <Button
              type="primary"
              size="large"
              icon={<CheckCircleOutlined />}
              htmlType="submit"
              onClick={() => console.log("tes")}>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </div>
      ;
    </>
  );
};

export default FormProfile;