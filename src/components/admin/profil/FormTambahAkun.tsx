import React, { useEffect, useLayoutEffect, useState } from "react";
import { Button, Form, Input, Select, Radio, InputNumber } from "antd";

import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import api from "@/utils/HttpRequest";
import router from "next/router";
import { useTambahAkunStore } from "@/stores/pengajuanAkunStore";
import { useGlobalStore } from "@/stores/globalStore";
import cloneDeep from "clone-deep";
import Notif from "@/utils/Notif";

const { TextArea } = Input;

const layout = {
  labelCol: { span: 20 },
  // wrapperCol: { span: 17 },
  layout: "vertical" as const,
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

  const [getPassword, setPassword] = useState({
    required: true,
  });

  let tmpForm = {
    oldid: "",
    nama_user: "",
    noreg_tempat: "",
    level: "",
    username: "",
    password: "",
    id_kecamatan: "",
    id_kelurahan: "",
    email: "",
    nohp: "",
    link_manifest: "",
    link_logbook: "",
    link_lab_ipal: "",
    link_lab_lain: "",
    link_dokumen_lingkungan_rs: "",
    link_izin_transporter: "",
    link_mou_transporter: "",
    link_swa_pantau: "",
    link_ujilab_cair: "",
    link_lab_limbah_cair: "",
    link_izin_ipal: "",
    link_izin_tps: "",
    link_ukl: "",
    link_upl: "",
    kapasitas_ipal: "",
    kapasitas_ipal_option: "ada", // "ada" or "tidak_ada"
  };

  const [form, setForm] = useState(cloneDeep(tmpForm));

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

    // Jika kecamatan berubah, reset kelurahan dan load data kelurahan baru
    if (name === "id_kecamatan") {
      setSelectedKecamatan(val);
      setSelectedKelurahan(null);
      setForm({
        ...form,
        id_kecamatan: val,
        id_kelurahan: "",
      });
      formInstance.setFieldValue("form_kelurahan", undefined);
      if (val) {
        getKelurahanData(val);
      } else {
        setKelurahanOptions([]);
      }
    }

    if (name === "id_kelurahan") {
      setSelectedKelurahan(val);
    }
  };

  // Fungsi untuk mengambil data kecamatan
  const getKecamatanData = async () => {
    try {
      const response = await api.post("/user/kecamatan/data");
      if (response.data.success) {
        const options = response.data.data.values.map((item: any) => ({
          value: item.id_kecamatan.toString(),
          label: item.nama_kecamatan,
          id_kecamatan: item.id_kecamatan,
        }));
        setKecamatanOptions(options);
      }
    } catch (error) {
      console.error("Error fetching kecamatan data:", error);
    }
  };

  // Fungsi untuk mengambil data kelurahan berdasarkan kecamatan
  const getKelurahanData = async (idKecamatan: string) => {
    try {
      const formData = new FormData();
      formData.append("id_kecamatan", idKecamatan);
      const response = await api.post("/user/kelurahan/data", formData);
      if (response.data.success) {
        const options = response.data.data.values.map((item: any) => ({
          value: item.id_kelurahan.toString(),
          label: item.nama_kelurahan,
          id_kelurahan: item.id_kelurahan,
        }));
        setKelurahanOptions(options);
      }
    } catch (error) {
      console.error("Error fetching kelurahan data:", error);
      setKelurahanOptions([]);
    }
  };

  useLayoutEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get("action");

    console.log(router.query);
    console.log(Object.values(tambahAkunStore));
    console.log(tambahAkunStore);

    // Load data kecamatan saat component mount
    getKecamatanData();

    // jika create
    formInstance.resetFields();
    setForm(cloneDeep(tmpForm));

    if (action === "edit") {
      // jika edit set valuenya
      // jika idnya kosong (dia melakukan refresh) balikin ke table
      if (tambahAkunStore.id_user == null || tambahAkunStore.id_user == 0) {
        router.push("/dashboard/admin/manajemen/profil");
        return;
      }

      setPassword({
        required: false,
      });

      setForm({
        // id_kecamatan: tambahAkunStore.id_kecamatan?.toString() ?? "",
        // id_kelurahan: tambahAkunStore.id_kelurahan?.toString() ?? "",
        // alamat_tempat: tambahAkunStore.alamat_tempat?.toString() ?? "",
        // notelp: tambahAkunStore.nohp?.toString() ?? "",
        // email: tambahAkunStore.email?.toString() ?? "",
        oldid: tambahAkunStore.id_user?.toString() ?? "",
        nama_user: tambahAkunStore.nama_user?.toString() ?? "",
        username: tambahAkunStore.username?.toString() ?? "",
        noreg_tempat: tambahAkunStore.noreg_tempat?.toString() ?? "",
        level: tambahAkunStore.level?.toString() ?? "",
        password: "",
        id_kecamatan: tambahAkunStore.id_kecamatan?.toString() ?? "",
        id_kelurahan: tambahAkunStore.id_kelurahan?.toString() ?? "",
        email: tambahAkunStore.email?.toString() ?? "",
        nohp: tambahAkunStore.nohp?.toString() ?? "",
        link_manifest: tambahAkunStore.link_manifest?.toString() ?? "",
        link_logbook: tambahAkunStore.link_logbook?.toString() ?? "",
        link_lab_ipal: tambahAkunStore.link_lab_ipal?.toString() ?? "",
        link_lab_lain: tambahAkunStore.link_lab_lain?.toString() ?? "",
        link_dokumen_lingkungan_rs:
          tambahAkunStore.link_dokumen_lingkungan_rs?.toString() ?? "",
        link_izin_transporter: tambahAkunStore.link_izin_transporter?.toString() ?? "",
        link_mou_transporter: tambahAkunStore.link_mou_transporter?.toString() ?? "",
        link_swa_pantau: tambahAkunStore.link_swa_pantau?.toString() ?? "",
        link_ujilab_cair: tambahAkunStore.link_ujilab_cair?.toString() ?? "",
        link_lab_limbah_cair:
          tambahAkunStore.link_lab_limbah_cair?.toString() ?? "",
        link_izin_ipal: tambahAkunStore.link_izin_ipal?.toString() ?? "",
        link_izin_tps: tambahAkunStore.link_izin_tps?.toString() ?? "",
        link_ukl: tambahAkunStore.link_ukl?.toString() ?? "",
        link_upl: tambahAkunStore.link_upl?.toString() ?? "",
        kapasitas_ipal: tambahAkunStore.kapasitas_ipal?.toString() ?? "",
        kapasitas_ipal_option: tambahAkunStore.kapasitas_ipal === "Tidak ada pemeriksaan" ? "tidak_ada" : "ada",
      });
      // setForm({
      //   oldid: tambahAkunStore.id_user?.toString() ?? "",
      //   nama_user: "",
      //   noreg_tempat: "",
      //   level: "",
      //   username: "",
      //   password: "",
      //   link_manifest: "",
      //   link_logbook: "",
      //   link_lab_ipal: "",
      //   link_lab_lain: "",
      //   link_dokumen_lingkungan_rs: "",
      //   link_swa_pantau: "",
      //   link_ujilab_cair: "",
      //   link_izin_transporter: "",
      //   link_mou_transporter: "",
      //   link_lab_limbah_cair: "",
      //   link_izin_ipal: "",
      //   link_izin_tps: "",
      //   link_ukl: "",
      //   link_upl: "",
      //   kapasitas_ipal: "",
      // });

      formInstance.setFieldsValue({
        form_namauser: tambahAkunStore.nama_user,
        form_username: tambahAkunStore.username,
        form_noreg: tambahAkunStore.noreg_tempat,
        level: tambahAkunStore.level.toString(),
        form_kecamatan: tambahAkunStore.id_kecamatan?.toString(),
        form_kelurahan: tambahAkunStore.id_kelurahan?.toString(),
        form_email: tambahAkunStore.email,
        form_nohp: tambahAkunStore.nohp,
        form_link_manifest: tambahAkunStore.link_manifest,
        form_link_logbook: tambahAkunStore.link_logbook,
        form_link_lab_ipal: tambahAkunStore.link_lab_ipal,
        form_link_lab_lain: tambahAkunStore.link_lab_lain,
        form_link_dokumen_lingkungan_rs:
          tambahAkunStore.link_dokumen_lingkungan_rs,
        form_link_izin_transporter: tambahAkunStore.link_izin_transporter,
        form_link_mou_transporter: tambahAkunStore.link_mou_transporter,
        form_link_swa_pantau: tambahAkunStore.link_swa_pantau,
        form_link_ujilab_cair: tambahAkunStore.link_ujilab_cair,
        form_link_lab_limbah_cair: tambahAkunStore.link_lab_limbah_cair,
        form_link_izin_ipal: tambahAkunStore.link_izin_ipal,
        form_link_izin_tps: tambahAkunStore.link_izin_tps,
        form_link_ukl: tambahAkunStore.link_ukl,
        form_link_upl: tambahAkunStore.link_upl,
        form_kapasitas_ipal: tambahAkunStore.kapasitas_ipal,
      });

      // Load kelurahan data jika kecamatan sudah dipilih saat edit
      if (tambahAkunStore.id_kecamatan) {
        setSelectedKecamatan(tambahAkunStore.id_kecamatan);
        getKelurahanData(tambahAkunStore.id_kecamatan.toString());
      }
      if (tambahAkunStore.id_kelurahan) {
        setSelectedKelurahan(tambahAkunStore.id_kelurahan);
      }

      // getFile(pengajuanTransporterStore.files);
      // getFilesHere();
    }
  }, []);

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
    dataForm.append("email", form.email);
    dataForm.append("nohp", form.nohp);
    dataForm.append("link_manifest", form.link_manifest);
    dataForm.append("link_logbook", form.link_logbook);
    dataForm.append("link_lab_ipal", form.link_lab_ipal);
    dataForm.append("link_lab_lain", form.link_lab_lain);
    dataForm.append(
      "link_dokumen_lingkungan_rs",
      form.link_dokumen_lingkungan_rs
    );
    dataForm.append("link_izin_transporter", form.link_izin_transporter);
    dataForm.append("link_mou_transporter", form.link_mou_transporter);
    dataForm.append("link_swa_pantau", form.link_swa_pantau);
    dataForm.append("link_ujilab_cair", form.link_ujilab_cair);
    dataForm.append("link_lab_limbah_cair", form.link_lab_limbah_cair);
    dataForm.append("link_izin_ipal", form.link_izin_ipal);
    dataForm.append("link_izin_tps", form.link_izin_tps);
    dataForm.append("link_ukl", form.link_ukl);
    dataForm.append("link_upl", form.link_upl);
    dataForm.append("kapasitas_ipal", form.kapasitas_ipal);

    let url = "/user/puskesmas-rumahsakit/create";
    if (router.query.action == "edit") {
      url = "/user/puskesmas-rumahsakit/update";
    }

    try {
      if (globalStore.setLoading) globalStore.setLoading(true);
      Notif("success", "Success.!", "Berhasil Simpan Akun");
      let responsenya = await api.post(url, dataForm);

      router.push("/dashboard/admin/manajemen/profil");
    } catch (e) {
      console.error(e);
    } finally {
      if (globalStore.setLoading) globalStore.setLoading(false);
    }
  };

  const inputStyles = {
    width: "100%",
    maxWidth: "400px",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
    borderRadius: "6px",
  };

  const sectionTitleStyle = {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1890ff",
    marginBottom: "16px",
    marginTop: "24px",
    borderBottom: "2px solid #f0f0f0",
    paddingBottom: "8px",
  };

  const gridContainerStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
    marginBottom: "24px",
  };

  const responsiveGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
    "@media (max-width: 768px)": {
      gridTemplateColumns: "1fr",
      gap: "12px",
    },
  };

  return (
    <>
      <div style={{ 
        maxWidth: "1200px", 
        margin: "0 auto", 
        padding: "24px",
        "@media (max-width: 768px)": {
          padding: "16px",
          maxWidth: "100%"
        }
      }}>
        <Form
          {...layout}
          onFinish={handleSubmit}
          name="control-hooks"
          form={formInstance}
          style={{ width: "100%" }}
        >
          {/* Basic Information Section */}
          <div style={sectionTitleStyle}>Informasi Dasar</div>
          
          <div style={responsiveGridStyle}>
            <Form.Item
              name="form_namauser"
              label="Nama Instansi"
              rules={[{ required: true }]}
            >
              <Input
                onChange={handleChangeInput}
                value={form.nama_user}
                style={inputStyles}
                name="nama_user"
              />
            </Form.Item>
            
            <Form.Item
              name="form_kecamatan"
              label="Kecamatan"
              rules={[{ required: true }]}
            >
              <Select
                style={inputStyles}
                showSearch
                onChange={(v) => handleChangeSelect(v, "id_kecamatan", event)}
                placeholder="Silahkan Pilih Kecamatan"
                allowClear
                options={kecamatanOptions}
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
            
            <Form.Item
              name="form_kelurahan"
              label="Kelurahan"
              rules={[{ required: true }]}
            >
              <Select
                style={inputStyles}
                showSearch
                onChange={(v) => handleChangeSelect(v, "id_kelurahan", event)}
                placeholder="Silahkan Pilih Kelurahan"
                allowClear
                disabled={!selectedKecamatan}
                options={kelurahanOptions}
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
              />
            </Form.Item>
            
            <Form.Item
              name="form_username"
              label="Username"
              rules={[{ required: true }]}
            >
              <Input
                onChange={handleChangeInput}
                value={form.username}
                name="username"
                style={inputStyles}
              />
            </Form.Item>
            
            <Form.Item name="password" label="Password" rules={[getPassword]}>
              <Input.Password
                onChange={handleChangeInput}
                value={form.password}
                name="password"
                style={inputStyles}
              />
            </Form.Item>
            
            <Form.Item
              name="form_noreg"
              label="Nomor registrasi / Nomor izin RS"
              rules={[{ required: false }]}
            >
              <Input
                onChange={handleChangeInput}
                value={form.noreg_tempat}
                name="noreg_tempat"
                style={inputStyles}
              />
            </Form.Item>
          </div>
          
          <div style={responsiveGridStyle}>
            <Form.Item
              name="level"
              label="Jenis Instansi"
              initialValue={form.level}
              rules={[{ required: true }]}
            >
              <Select
                style={inputStyles}
                showSearch
                onChange={(v) => handleChangeSelect(v, "level", event)}
                placeholder="Silahkan Pilih Tipe Instansi"
                allowClear
                options={[
                  { value: "3", label: "Puskesmas" },
                  { value: "2", label: "Rumah Sakit" },
                ]}
              />
            </Form.Item>
            
            <Form.Item
              name="form_email"
              label="Email"
              rules={[{ required: true, type: "email", message: "Masukkan email yang valid!" }]}
            >
              <Input
                onChange={handleChangeInput}
                value={form.email}
                name="email"
                type="email"
                style={inputStyles}
              />
            </Form.Item>
          </div>
          
          <Form.Item
            name="form_nohp"
            label="Nomor HP"
            rules={[{ required: true }]}
            style={{ marginBottom: "32px" }}
          >
            <Input
              onChange={handleChangeInput}
              value={form.nohp}
              name="nohp"
              style={inputStyles}
            />
          </Form.Item>
          
          {/* Link Documents Section */}
          <div style={sectionTitleStyle}>Dokumen Link</div>
          
          <div style={responsiveGridStyle}>
            <Form.Item
              name="form_link_manifest"
              label="Link Manifest"
              rules={[{ required: false }]}
            >
              <Input
                onChange={handleChangeInput}
                value={form.link_manifest}
                name="link_manifest"
                style={inputStyles}
              />
            </Form.Item>
            
            <Form.Item
              name="form_link_logbook"
              label="Link Logbook"
              rules={[{ required: false }]}
            >
              <Input
                onChange={handleChangeInput}
                value={form.link_logbook}
                name="link_logbook"
                style={inputStyles}
              />
            </Form.Item>
            
            <Form.Item
              name="form_link_lab_ipal"
              label="Link Lab IPAL"
              rules={[{ required: false }]}
            >
              <Input
                onChange={handleChangeInput}
                value={form.link_lab_ipal}
                name="link_lab_ipal"
                style={inputStyles}
              />
            </Form.Item>
            
            <Form.Item
              name="form_link_lab_lain"
              label="Link Lab Lain"
              rules={[{ required: false }]}
            >
              <Input
                onChange={handleChangeInput}
                value={form.link_lab_lain}
                name="link_lab_lain"
                style={inputStyles}
              />
            </Form.Item>
            
            <Form.Item
              name="form_link_dokumen_lingkungan_rs"
              label="Link Dokumen Lingkungan Rumah Sakit"
              rules={[{ required: false }]}
            >
              <Input
                onChange={handleChangeInput}
                value={form.link_dokumen_lingkungan_rs}
                name="link_dokumen_lingkungan_rs"
                style={inputStyles}
              />
            </Form.Item>
            
            <Form.Item
              name="form_link_izin_transporter"
              label="Link Izin Transporter"
              rules={[{ required: false }]}
            >
              <Input
                onChange={handleChangeInput}
                value={form.link_izin_transporter}
                name="link_izin_transporter"
                style={inputStyles}
              />
            </Form.Item>
            
            <Form.Item
              name="form_link_mou_transporter"
              label="Link MOU Transporter"
              rules={[{ required: false }]}
            >
              <Input
                onChange={handleChangeInput}
                value={form.link_mou_transporter}
                name="link_mou_transporter"
                style={inputStyles}
              />
            </Form.Item>
            
            <Form.Item
              name="form_link_swa_pantau"
              label="Link Swa Pantau"
              rules={[{ required: false }]}
            >
              <Input
                onChange={handleChangeInput}
                value={form.link_swa_pantau}
                name="link_swa_pantau"
                style={inputStyles}
              />
            </Form.Item>
            
            <Form.Item
              name="form_link_ujilab_cair"
              label="Link Uji Lab Cair"
              rules={[{ required: false }]}
            >
              <Input
                onChange={handleChangeInput}
                value={form.link_ujilab_cair}
                name="link_ujilab_cair"
                style={inputStyles}
              />
            </Form.Item>
            
            <Form.Item
              name="form_link_lab_limbah_cair"
              label="Link Lab Limbah Cair"
              rules={[{ required: false }]}
            >
              <Input
                onChange={handleChangeInput}
                value={form.link_lab_limbah_cair}
                name="link_lab_limbah_cair"
                style={inputStyles}
              />
            </Form.Item>
            
            <Form.Item
              name="form_link_izin_ipal"
              label="Link Izin IPAL"
              rules={[{ required: false }]}
            >
              <Input
                onChange={handleChangeInput}
                value={form.link_izin_ipal}
                name="link_izin_ipal"
                style={inputStyles}
              />
            </Form.Item>
            
            <Form.Item
              name="form_link_izin_tps"
              label="Link Izin TPS"
              rules={[{ required: false }]}
            >
              <Input
                onChange={handleChangeInput}
                value={form.link_izin_tps}
                name="link_izin_tps"
                style={inputStyles}
              />
            </Form.Item>
            
            <Form.Item
              name="form_link_ukl"
              label="Link UKL"
              rules={[{ required: false }]}
            >
              <Input
                onChange={handleChangeInput}
                value={form.link_ukl}
                name="link_ukl"
                style={inputStyles}
              />
            </Form.Item>
            
            <Form.Item
              name="form_link_upl"
              label="Link UPL"
              rules={[{ required: false }]}
            >
              <Input
                onChange={handleChangeInput}
                value={form.link_upl}
                name="link_upl"
                style={inputStyles}
              />
            </Form.Item>
          </div>

          {/* Kapasitas IPAL Section */}
          <div style={sectionTitleStyle}>Kapasitas IPAL</div>
          
          <div style={{ 
            marginBottom: "24px",
            "@media (max-width: 768px)": {
              marginBottom: "16px"
            }
          }}>
            <Form.Item
              name="form_kapasitas_ipal_option"
              label="Status Kapasitas IPAL"
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
                name="form_kapasitas_ipal"
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
                  style={{ width: "100%", maxWidth: "400px" }}
                  placeholder="Masukkan nilai kapasitas dalam m³"
                  min={0}
                  step={0.1}
                  addonAfter="m³"
                />
              </Form.Item>
            )}
          </div>

          <Form.Item style={{ 
            marginTop: "32px", 
            textAlign: "center",
            "@media (max-width: 768px)": {
              marginTop: "24px"
            }
          }}>
            <Button 
              type="primary" 
              htmlType="submit"
              size="large"
              style={{
                minWidth: "120px",
                height: "40px",
                borderRadius: "6px",
                fontWeight: "600",
                "@media (max-width: 768px)": {
                  width: "100%",
                  maxWidth: "300px"
                }
              }}
            >
              Simpan Akun
            </Button>
          </Form.Item>
        </Form>
      </div>
    </>
  );
};

export default FormTambahAkun;
