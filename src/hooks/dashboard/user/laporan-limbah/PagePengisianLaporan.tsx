import React, { useMemo, useState } from "react";
import { Card, Select, Input, Steps, Typography, Space, Divider, Result, Button } from "antd";
import MainLayout from "@/components/MainLayout";
import FormPengajuanLimbah from "@/components/formpuskesmas/pengajuanLimbah/FormPengajuanLimbah";
import FormPengajuanLimbahCair from "@/components/formpuskesmas/pengajuanLimbah/FormPengajuanLimbahCair";
import FormLaporanLabSimple from "@/components/lab/FormLaporanLabSimple";
import api from "@/utils/HttpRequest";
import { useNotification } from "@/utils/Notif";

const { Title, Text } = Typography;

const monthOptions = [
  { value: 1, label: "Januari" },
  { value: 2, label: "Februari" },
  { value: 3, label: "Maret" },
  { value: 4, label: "April" },
  { value: 5, label: "Mei" },
  { value: 6, label: "Juni" },
  { value: 7, label: "Juli" },
  { value: 8, label: "Agustus" },
  { value: 9, label: "September" },
  { value: 10, label: "Oktober" },
  { value: 11, label: "November" },
  { value: 12, label: "Desember" },
];

const PagePengisianLaporan: React.FC = () => {
  const [periode, setPeriode] = useState<number>(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState<number>(new Date().getFullYear());
  const [current, setCurrent] = useState<number>(0);
  const [finished, setFinished] = useState<boolean>(false);
  const [padatData, setPadatData] = useState<FormData | null>(null);
  const [cairData, setCairData] = useState<FormData | null>(null);
  const [padatDraft, setPadatDraft] = useState<any | null>(null);
  const [cairDraft, setCairDraft] = useState<any | null>(null);
  const [labDraft, setLabDraft] = useState<any | null>(null);
  const { showNotification } = useNotification();

  const monthLabel = useMemo(() => monthOptions.find(m => m.value === periode)?.label || "Januari", [periode]);

  const handleFinalSubmit = async (labPayload: any) => {
    try {
      if (!padatData || !cairData) {
        showNotification('warning', 'Data belum lengkap', 'Mohon lengkapi Limbah B3 dan Limbah Cair sebelum submit laporan lab.');
        return;
      }
      // Simpan padat
      const resPadat = await api.post('/user/laporan-bulanan/create', padatData).catch((e: any) => {
        const msg = e?.response?.data?.message || 'Gagal menyimpan laporan Limbah B3';
        showNotification('error', 'Gagal', msg);
        throw e;
      });
      // Simpan cair
      const resCair = await api.post('/user/limbah-cair/create', cairData).catch((e: any) => {
        const msg = e?.response?.data?.message || 'Gagal menyimpan laporan Limbah Cair';
        showNotification('error', 'Gagal', msg);
        throw e;
      });
      // Simpan lab
      const resLab = await api.post('/user/laporan-lab/simple-create', labPayload).catch((e: any) => {
        const msg = e?.response?.data?.message || 'Gagal menyimpan laporan Lab';
        showNotification('error', 'Gagal', msg);
        throw e;
      });

      if (resPadat?.data?.success && resCair?.data?.success && resLab?.data?.success) {
        showNotification('success', 'Sukses', 'Semua laporan berhasil disimpan.');
        setFinished(true);
      } else {
        showNotification('error', 'Gagal', 'Terjadi masalah saat menyimpan laporan.');
      }
    } catch (err) {
      // Error details ditangani pada masing-masing catch di atas
    }
  };

  return (
    <MainLayout title="Pengisian Laporan">
      <Card style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Title level={4}>Pengisian Laporan Berurutan</Title>
        <Text type="secondary">Isi laporan Limbah Padat, Limbah Cair, dan Laporan Lab dalam satu alur.</Text>
        <Divider />
        {/* Periode/Tahun dihapus dari wizard untuk menghindari input ganda.
            Nilai akan ditentukan dari langkah 1 (Limbah B3) dan dikunci untuk langkah berikutnya. */}

        <Steps
          current={current}
          items={[
            { title: "Limbah B3 (Padat)" },
            { title: "Limbah Cair" },
            { title: "Laporan Lab" },
          ]}
        />

        <Divider />

        {!finished && current === 0 && (
          <div style={{ marginTop: 12 }}>
            <Title level={5}>Langkah 1: Laporan Limbah B3 (Padat)</Title>
            <Text type="secondary">Periode: {monthLabel}, Tahun: {tahun}</Text>
            <Divider />
            <FormPengajuanLimbah
              initialPeriode={periode}
              initialTahun={tahun}
              lockPeriodYear={false}
              disableRedirect
              deferSubmit
              onCollectData={(fd) => { setPadatData(fd); setCurrent(1); }}
              onCollectDraft={(d) => setPadatDraft(d)}
              draftData={padatDraft || undefined}
              onSuccess={() => setCurrent(1)}
              onPeriodYearChange={(p, t) => {
                const numP = typeof p === 'string' ? parseInt(p) : p;
                const numT = typeof t === 'string' ? parseInt(t as string) : (t as number);
                if (!isNaN(numP)) setPeriode(numP);
                if (!isNaN(numT)) setTahun(numT);
              }}
            />
          </div>
        )}

        {!finished && current === 1 && (
          <div style={{ marginTop: 12 }}>
            <Title level={5}>Langkah 2: Laporan Limbah Cair</Title>
            <Text type="secondary">Periode: {monthLabel}, Tahun: {tahun}</Text>
            <Divider />
            <Space style={{ marginBottom: 12 }}>
              <Button onClick={() => setCurrent(0)}>Kembali</Button>
            </Space>
            <FormPengajuanLimbahCair
              initialPeriode={periode}
              initialTahun={tahun}
              lockPeriodYear
              disableRedirect
              deferSubmit
              onCollectData={(fd) => { setCairData(fd); setCurrent(2); }}
              onCollectDraft={(d) => setCairDraft(d)}
              draftData={cairDraft || undefined}
              onSuccess={() => setCurrent(2)}
            />
          </div>
        )}

        {!finished && current === 2 && (
          <div style={{ marginTop: 12 }}>
            <Title level={5}>Langkah 3: Laporan Pemeriksaan Lab</Title>
            <Text type="secondary">Periode: {monthLabel}, Tahun: {tahun}</Text>
            <Divider />
            <Space style={{ marginBottom: 12 }}>
              <Button onClick={() => setCurrent(1)}>Kembali</Button>
            </Space>
            <FormLaporanLabSimple
              initialPeriode={periode}
              initialTahun={tahun}
              lockPeriodYear
              disableRedirect
              onFinalSubmit={handleFinalSubmit}
              onDraftChange={(d) => setLabDraft(d)}
              draftData={labDraft || undefined}
              onSuccess={() => setFinished(true)}
            />
          </div>
        )}

        {finished && (
          <Result
            status="success"
            title="Pengisian Laporan Selesai"
            subTitle={`Semua langkah selesai untuk periode ${monthLabel} ${tahun}.`}
            extra={[
              <Button key="back-padat" href="/dashboard/user/limbah-padat">Ke Laporan Limbah B3</Button>,
              <Button key="back-cair" href="/dashboard/user/limbah-cair">Ke Laporan Limbah Cair</Button>,
              <Button key="back-lab" href="/dashboard/user/lab-lainnya">Ke Laporan Lab</Button>,
            ]}
          />
        )}
      </Card>
    </MainLayout>
  );
};

export default PagePengisianLaporan;