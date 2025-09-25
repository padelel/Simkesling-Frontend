import React, { useState } from 'react';
import { Form, Input, Select, Button, Card, Steps, message, Row, Col, DatePicker } from 'antd';
import { useRouter } from 'next/router';
import { MLaporanLab, JENIS_PEMERIKSAAN, JenisPemeriksaan, ParameterUji, HasilUji } from '@/models/MLaporanLab';
import FormKualitasUdara from './FormKualitasUdara';
import FormKualitasAir from './FormKualitasAir';
import FormKualitasMakanan from './FormKualitasMakanan';
import FormUsapAlatMedisLinen from './FormUsapAlatMedisLinen';
import FormLimbahCair from './FormLimbahCair';
import dayjs from 'dayjs';

const { Step } = Steps;
const { TextArea } = Input;

interface FormLaporanLabProps {
  initialData?: Partial<MLaporanLab>;
  isEdit?: boolean;
}

const FormLaporanLab: React.FC<FormLaporanLabProps> = ({ initialData, isEdit = false }) => {
  const router = useRouter();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Form data state
  const [basicData, setBasicData] = useState({
    nama_lab: initialData?.nama_lab || '',
    jenis_pemeriksaan: initialData?.jenis_pemeriksaan || 'kualitas_udara' as JenisPemeriksaan,
    lokasi_sampling: initialData?.lokasi_sampling || '',
    tanggal_sampling: initialData?.tanggal_sampling || null,
    tanggal_analisis: initialData?.tanggal_analisis || '',
    metode_analisis: initialData?.metode_analisis || '',
    catatan: initialData?.catatan || '',
    link_sertifikat_lab: initialData?.link_sertifikat_lab || '',
    link_hasil_uji: initialData?.link_hasil_uji || '',
    link_dokumen_pendukung: initialData?.link_dokumen_pendukung || '',
    periode: initialData?.periode || '',
    tahun: initialData?.tahun || new Date().getFullYear().toString()
  });

  const [examinationData, setExaminationData] = useState<{
    parameter_uji: ParameterUji | null;
    hasil_uji: HasilUji | null;
  }>({
    parameter_uji: initialData?.parameter_uji || null,
    hasil_uji: initialData?.hasil_uji || null
  });

  const handleBasicDataChange = (field: string, value: any) => {
    setBasicData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleExaminationDataSubmit = (data: { parameter_uji: ParameterUji; hasil_uji: HasilUji }) => {
    setExaminationData(data);
    setCurrentStep(2); // Move to review step
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const submitData: Partial<MLaporanLab> = {
        ...basicData,
        parameter_uji: examinationData.parameter_uji!,
        hasil_uji: examinationData.hasil_uji!,
        tanggal_sampling: basicData.tanggal_sampling ? dayjs(basicData.tanggal_sampling).format('YYYY-MM-DD') : ''
      };

      // Here you would make the API call to save the lab report
      console.log('Submitting lab report:', submitData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success(isEdit ? 'Laporan lab berhasil diperbarui!' : 'Laporan lab berhasil disimpan!');
      router.push('/dashboard/user/lab-lainnya');
    } catch (error) {
      console.error('Error submitting lab report:', error);
      message.error('Gagal menyimpan laporan lab. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const renderExaminationForm = () => {
    const commonProps = {
      onSubmit: handleExaminationDataSubmit,
      initialData: examinationData.parameter_uji && examinationData.hasil_uji ? {
        parameter_uji: examinationData.parameter_uji,
        hasil_uji: examinationData.hasil_uji
      } : undefined
    };

    switch (basicData.jenis_pemeriksaan) {
      case 'kualitas_udara':
        return <FormKualitasUdara {...commonProps} />;
      case 'kualitas_air':
        return <FormKualitasAir {...commonProps} />;
      case 'kualitas_makanan':
        return <FormKualitasMakanan {...commonProps} />;
      case 'usap_alat_medis_linen':
        return <FormUsapAlatMedisLinen {...commonProps} />;
      case 'limbah_cair':
        return <FormLimbahCair {...commonProps} />;
      default:
        return <div>Pilih jenis pemeriksaan terlebih dahulu</div>;
    }
  };

  const steps = [
    {
      title: 'Informasi Dasar',
      content: (
        <Card title="Informasi Dasar Laporan Lab">
          <Form form={form} layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Nama Laboratorium" required>
                  <Input
                    value={basicData.nama_lab}
                    onChange={(e) => handleBasicDataChange('nama_lab', e.target.value)}
                    placeholder="Masukkan nama laboratorium"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Jenis Pemeriksaan" required>
                  <Select
                    value={basicData.jenis_pemeriksaan}
                    onChange={(value) => handleBasicDataChange('jenis_pemeriksaan', value)}
                  >
                    <Select.Option value="kualitas_udara">Pemeriksaan Kualitas Udara</Select.Option>
                    <Select.Option value="kualitas_air">Pemeriksaan Kualitas Air</Select.Option>
                    <Select.Option value="kualitas_makanan">Pemeriksaan Kualitas Makanan</Select.Option>
                    <Select.Option value="usap_alat_medis_linen">Pemeriksaan Usap Alat Medis dan Linen</Select.Option>
                    <Select.Option value="limbah_cair">Pemeriksaan Limbah Cair</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Lokasi Sampling">
                  <Input
                    value={basicData.lokasi_sampling}
                    onChange={(e) => handleBasicDataChange('lokasi_sampling', e.target.value)}
                    placeholder="Masukkan lokasi sampling"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Tanggal Sampling">
                  <DatePicker
                    style={{ width: '100%' }}
                    value={basicData.tanggal_sampling ? dayjs(basicData.tanggal_sampling) : null}
                    onChange={(date) => handleBasicDataChange('tanggal_sampling', date)}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Tanggal Analisis">
                  <Input
                    value={basicData.tanggal_analisis}
                    onChange={(e) => handleBasicDataChange('tanggal_analisis', e.target.value)}
                    placeholder="Masukkan tanggal analisis"
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Metode Analisis">
                  <Input
                    value={basicData.metode_analisis}
                    onChange={(e) => handleBasicDataChange('metode_analisis', e.target.value)}
                    placeholder="Masukkan metode analisis"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="Periode">
                  <Select
                    value={basicData.periode}
                    onChange={(value) => handleBasicDataChange('periode', value)}
                    placeholder="Pilih periode"
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <Select.Option key={i + 1} value={(i + 1).toString()}>
                        {new Date(0, i).toLocaleString('id-ID', { month: 'long' })}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Tahun">
                  <Select
                    value={basicData.tahun}
                    onChange={(value) => handleBasicDataChange('tahun', value)}
                  >
                    {Array.from({ length: 5 }, (_, i) => {
                      const year = new Date().getFullYear() - 2 + i;
                      return (
                        <Select.Option key={year} value={year.toString()}>
                          {year}
                        </Select.Option>
                      );
                    })}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="Catatan">
              <TextArea
                rows={4}
                value={basicData.catatan}
                onChange={(e) => handleBasicDataChange('catatan', e.target.value)}
                placeholder="Masukkan catatan tambahan"
              />
            </Form.Item>

            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="Link Sertifikat Lab">
                  <Input
                    value={basicData.link_sertifikat_lab}
                    onChange={(e) => handleBasicDataChange('link_sertifikat_lab', e.target.value)}
                    placeholder="URL sertifikat laboratorium"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Link Hasil Uji">
                  <Input
                    value={basicData.link_hasil_uji}
                    onChange={(e) => handleBasicDataChange('link_hasil_uji', e.target.value)}
                    placeholder="URL hasil uji"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Link Dokumen Pendukung">
                  <Input
                    value={basicData.link_dokumen_pendukung}
                    onChange={(e) => handleBasicDataChange('link_dokumen_pendukung', e.target.value)}
                    placeholder="URL dokumen pendukung"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item>
              <Button 
                type="primary" 
                onClick={() => setCurrentStep(1)}
                disabled={!basicData.nama_lab || !basicData.jenis_pemeriksaan}
              >
                Lanjut ke Data Pemeriksaan
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )
    },
    {
      title: 'Data Pemeriksaan',
      content: renderExaminationForm()
    },
    {
      title: 'Review & Submit',
      content: (
        <Card title="Review Data Laporan Lab">
          <div style={{ marginBottom: 24 }}>
            <h3>Informasi Dasar</h3>
            <p><strong>Nama Lab:</strong> {basicData.nama_lab}</p>
            <p><strong>Jenis Pemeriksaan:</strong> {JENIS_PEMERIKSAAN[basicData.jenis_pemeriksaan]}</p>
            <p><strong>Lokasi Sampling:</strong> {basicData.lokasi_sampling}</p>
            <p><strong>Periode:</strong> {basicData.periode} / {basicData.tahun}</p>
          </div>

          <div style={{ marginBottom: 24 }}>
            <h3>Data Pemeriksaan</h3>
            <p>Parameter dan hasil uji telah diisi sesuai jenis pemeriksaan yang dipilih.</p>
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <Button onClick={() => setCurrentStep(1)}>
              Kembali ke Data Pemeriksaan
            </Button>
            <Button 
              type="primary" 
              loading={loading}
              onClick={handleSubmit}
              disabled={!examinationData.parameter_uji || !examinationData.hasil_uji}
            >
              {isEdit ? 'Update Laporan' : 'Simpan Laporan'}
            </Button>
          </div>
        </Card>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Steps current={currentStep} style={{ marginBottom: 24 }}>
        {steps.map(item => (
          <Step key={item.title} title={item.title} />
        ))}
      </Steps>
      
      <div>{steps[currentStep].content}</div>
    </div>
  );
};

export default FormLaporanLab;