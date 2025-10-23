import React, { useEffect } from "react";
import { useState, createContext, useContext } from "react";
import api from "../utils/HttpRequest";
const CobaApiPage: React.FC = () => {
  const [datanya, setDatanya] = useState("");
  const [datalogin, setDatalogin] = useState("");
  const [dataCRUD, setDataCRUD] = useState("");
  const [filenya, setFilenya] = useState<FileList | null>(null);
  const clearData = () => {
    setDatanya("");
    setDatalogin("");
    setDataCRUD("");
    setFilenya(null);
  };

  const getData = async () => {
    let responsenya = await api.post("/user/pengajuan-transporter/data");
    console.log(responsenya);
    setDatanya(JSON.stringify(responsenya.data, null, 4));
  };

  const cobaLogin = async () => {
    let dari_form_username = "puskesmas001";
    let dari_form_password = "123";

    let dataForm = new FormData();
    dataForm.append("username", dari_form_username);
    dataForm.append("password", dari_form_password);

    let responsenya = await api.post("/login", dataForm);
    // Jangan simpan JWT di localStorage; backend akan set cookie HttpOnly
    console.log(responsenya);
    setDatalogin(JSON.stringify(responsenya.data, null, 4));
  };

  const cobaCRUD = async () => {
    if (filenya === null) {
      alert("isi filenya dulu oy");
      return;
    }

    let dari_form_username = "xxxxxx" + Math.random(); // biar random buat testing
    let dari_form_password = "xxxxxx";
    let dari_form_nama_user = "BAYU";
    let dari_form_level = "3";
    let dari_form_file_izin_ipal = filenya[0]; // ambil file ke 1, karena cuman 1 file aja, cek console log buat detainya
    console.log(filenya);
    console.log(dari_form_file_izin_ipal);

    let dataForm = new FormData();
    dataForm.append("username", dari_form_username);
    dataForm.append("password", dari_form_password);
    dataForm.append("nama_user", dari_form_nama_user);
    dataForm.append("level", dari_form_level);
    dataForm.append("file_izin_ipal", dari_form_file_izin_ipal);

    try {
      let responsenya = await api.post(
        "/user/puskesmas-rumahsakit/create",
        dataForm
      );
      console.log(responsenya);
      setDataCRUD(JSON.stringify(responsenya.data, null, 4));
    } catch (error) {
      console.error("API error:", error);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const onChangeFile = async (event: any) => {
    console.log(event.target.files);
    if (event.target.files) {
      setFilenya(event.target.files);
    }
  };
  return (
    <>
      <pre>{datanya}</pre>
      <button onClick={() => getData()}>Get Data</button>
      <button onClick={() => clearData()}>Clear Data</button>
      <hr />
      <pre>{datalogin}</pre>
      <button onClick={() => cobaLogin()}>Coba Login</button>
      <button onClick={() => clearData()}>Clear Data</button>
      <hr />
      <pre>{dataCRUD}</pre>
      <input type="file" onChange={(event) => onChangeFile(event)} />
      <button onClick={() => cobaCRUD()}>Coba CRUD</button>
      <button onClick={() => clearData()}>Clear Data</button>
    </>
  );
};

export default CobaApiPage;
