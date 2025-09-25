import React, { useState } from 'react';
import { Form, Input, InputNumber, Select, Button, Card, Row, Col } from 'antd';
import { ParameterLimbahCair, HasilLimbahCair, BaseParameter, BaseResult } from '@/models/MLaporanLab';

interface FormLimbahCairProps {
  onSubmit: (data: {
    parameter_uji: ParameterLimbahCair;
    hasil_uji: HasilLimbahCair;
  }) => void;
  initialData?: {
    parameter_uji?: ParameterLimbahCair;
    hasil_uji?: HasilLimbahCair;
  };
}

const FormLimbahCair: React.FC<FormLimbahCairProps> = ({ onSubmit, initialData }) => {
  const [form] = Form.useForm();

  const defaultParameter: ParameterLimbahCair = {
    ph: { satuan: 'pH', nilai: null },
    tss: { satuan: 'mg/L', nilai: null },
    bod: { satuan: 'mg/L', nilai: null },
    cod: { satuan: 'mg/L', nilai: null },
    minyak_lemak: { satuan: 'mg/L', nilai: null },
    amonia: { satuan: 'mg/L', nilai: null },
    deterjen: { satuan: 'mg/L', nilai: null }
  };

  const defaultHasil: HasilLimbahCair = {
    ph: { nilai: null, status: 'normal', keterangan: '' },
    tss: { nilai: null, status: 'normal', keterangan: '' },
    bod: { nilai: null, status: 'normal', keterangan: '' },
    cod: { nilai: null, status: 'normal', keterangan: '' },
    minyak_lemak: { nilai: null, status: 'normal', keterangan: '' },
    amonia: { nilai: null, status: 'normal', keterangan: '' },
    deterjen: { nilai: null, status: 'normal', keterangan: '' }
  };

  const [parameterData, setParameterData] = useState<ParameterLimbahCair>(
    initialData?.parameter_uji || defaultParameter
  );
  const [hasilData, setHasilData] = useState<HasilLimbahCair>(
    initialData?.hasil_uji || defaultHasil
  );

  const handleParameterChange = (field: keyof ParameterLimbahCair, key: keyof BaseParameter, value: any) => {
    setParameterData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [key]: value
      }
    }));
  };

  const handleHasilChange = (field: keyof HasilLimbahCair, key: keyof BaseResult, value: any) => {
    setHasilData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [key]: value
      }
    }));
  };

  const handleSubmit = () => {
    onSubmit({
      parameter_uji: parameterData,
      hasil_uji: hasilData
    });
  };

  const parameterFields = [
    { key: 'ph', label: 'pH', defaultUnit: 'pH' },
    { key: 'tss', label: 'TSS (Total Suspended Solids)', defaultUnit: 'mg/L' },
    { key: 'bod', label: 'BOD (Biochemical Oxygen Demand)', defaultUnit: 'mg/L' },
    { key: 'cod', label: 'COD (Chemical Oxygen Demand)', defaultUnit: 'mg/L' },
    { key: 'minyak_lemak', label: 'Minyak & Lemak', defaultUnit: 'mg/L' },
    { key: 'amonia', label: 'Amonia', defaultUnit: 'mg/L' },
    { key: 'deterjen', label: 'Deterjen', defaultUnit: 'mg/L' }
  ];

  return (
    <Card title="Form Pemeriksaan Limbah Cair" style={{ width: '100%' }}>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        {parameterFields.map((field) => (
          <Card key={field.key} size="small" style={{ marginBottom: 16 }}>
            <h4>{field.label}</h4>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="Satuan">
                  <Input
                    value={parameterData[field.key as keyof ParameterLimbahCair].satuan}
                    onChange={(e) => handleParameterChange(field.key as keyof ParameterLimbahCair, 'satuan', e.target.value)}
                    placeholder={field.defaultUnit}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Nilai Parameter">
                  <InputNumber
                    style={{ width: '100%' }}
                    value={parameterData[field.key as keyof ParameterLimbahCair].nilai}
                    onChange={(value) => handleParameterChange(field.key as keyof ParameterLimbahCair, 'nilai', value)}
                    placeholder="Masukkan nilai"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Hasil Uji">
                  <InputNumber
                    style={{ width: '100%' }}
                    value={hasilData[field.key as keyof HasilLimbahCair].nilai}
                    onChange={(value) => handleHasilChange(field.key as keyof HasilLimbahCair, 'nilai', value)}
                    placeholder="Hasil pengujian"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Status">
                  <Select
                    value={hasilData[field.key as keyof HasilLimbahCair].status}
                    onChange={(value) => handleHasilChange(field.key as keyof HasilLimbahCair, 'status', value)}
                  >
                    <Select.Option value="normal">Normal</Select.Option>
                    <Select.Option value="abnormal">Abnormal</Select.Option>
                    <Select.Option value="tidak_terdeteksi">Tidak Terdeteksi</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Keterangan">
                  <Input
                    value={hasilData[field.key as keyof HasilLimbahCair].keterangan}
                    onChange={(e) => handleHasilChange(field.key as keyof HasilLimbahCair, 'keterangan', e.target.value)}
                    placeholder="Keterangan tambahan"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        ))}
        
        <Form.Item>
          <Button type="primary" htmlType="submit" size="large">
            Simpan Data Limbah Cair
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default FormLimbahCair;