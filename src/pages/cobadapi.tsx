import React, { useState, useEffect } from "react";
import api from "../utils/HttpRequest";
import { Select } from "antd";

const Cobadapi: React.FC = () => {
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

  const clearData = () => {
    setSelectedKecamatan(null);
    setSelectedKelurahan(null);
    setKecamatanOptions([]);
    setKelurahanOptions([]);
  };

  const getKecamatanData = async () => {
    try {
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
    }
  };

  const getKelurahanData = async (id_kecamatan: number) => {
    try {
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
    }
  };

  const handleKecamatanSelectChange = (value: string) => {
    const id_kecamatan = parseInt(value);
    setSelectedKecamatan(id_kecamatan);
    setSelectedKelurahan(null);
    getKelurahanData(id_kecamatan);
  };

  const handleKelurahanSelectChange = (value: string) => {
    setSelectedKelurahan(parseInt(value));
  };

  useEffect(() => {
    getKecamatanData();
  }, []);

  return (
    <>
      <button onClick={() => getKecamatanData()}>Get Kecamatan Data</button>
      <button onClick={() => clearData()}>Clear Data</button>

      <br />
      <br />

      <Select
        style={{ width: 500 }}
        showSearch
        placeholder="Select kecamatan"
        optionFilterProp="children"
        filterOption={(input, option) =>
          (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
        }
        value={selectedKecamatan?.toString() || undefined}
        onChange={handleKecamatanSelectChange}
        options={kecamatanOptions}
      />

      <br />
      <br />

      <Select
        style={{ width: 500 }}
        showSearch
        placeholder="Select kelurahan"
        optionFilterProp="children"
        filterOption={(input, option) =>
          (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
        }
        value={selectedKelurahan?.toString() || undefined}
        onChange={handleKelurahanSelectChange}
        options={kelurahanOptions}
      />
    </>
  );
};

export default Cobadapi;
