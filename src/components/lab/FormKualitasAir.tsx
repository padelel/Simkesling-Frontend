import React, { useState } from 'react';
import { Form, Input, InputNumber, Select, Button, Card, Row, Col } from 'antd';
import { ParameterKualitasAir, HasilKualitasAir, BaseParameter, BaseResult } from '@/models/MLaporanLab';

interface FormKualitasAirProps {
  onSubmit: (data: {
    parameter_uji: ParameterKualitasAir;
    hasil_uji: HasilKualitasAir;
  }) => void;
  initialData?: {
    parameter_uji?: ParameterKualitasAir;
    hasil_uji?: HasilKualitasAir;
  };
}

const FormKualitasAir: React.FC<FormKualitasAirProps> = ({ onSubmit, initialData }) => {
  const [form] = Form.useForm();

  const defaultParameter: ParameterKualitasAir = {
    air_minum: { satuan: 'mg/L', nilai: null },
    air_hemodialisa: { satuan: 'mg/L', nilai: null },
    air_hygiene_sanitasi: { satuan: 'mg/L', nilai: null }
  };

  const defaultHasil: HasilKualitasAir = {
    air_minum: { nilai: null, status: 'normal', keterangan: '' },
    air_hemodialisa: { nilai: null, status: 'normal', keterangan: '' },
    air_hygiene_sanitasi: { nilai: null, status: 'normal', keterangan: '' }
  };

  const [parameterData, setParameterData] = useState<ParameterKualitasAir>(
    initialData?.parameter_uji || defaultParameter
  );
  const [hasilData, setHasilData] = useState<HasilKualitasAir>(
    initialData?.hasil_uji || defaultHasil
  );

  const handleParameterChange = (field: keyof ParameterKualitasAir, key: keyof BaseParameter, value: any) => {
    setParameterData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [key]: value
      }
    }));
  };

  const handleHasilChange = (field: keyof HasilKualitasAir, key: keyof BaseResult, value: any) => {
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
    { key: 'air_minum', label: 'Air Minum', defaultUnit: 'mg/L' },
    { key: 'air_hemodialisa', label: 'Air Hemodialisa', defaultUnit: 'mg/L' },
    { key: 'air_hygiene_sanitasi', label: 'Air untuk Keperluan Hygiene Sanitasi', defaultUnit: 'mg/L' }
  ];

  return (
    <Card title="Form Pemeriksaan Kualitas Air" style={{ width: '100%' }}>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        {parameterFields.map((field) => (
          <Card key={field.key} size="small" style={{ marginBottom: 16 }}>
            <h4>{field.label}</h4>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="Satuan">
                  <Input
                    value={parameterData[field.key as keyof ParameterKualitasAir].satuan}
                    onChange={(e) => handleParameterChange(field.key as keyof ParameterKualitasAir, 'satuan', e.target.value)}
                    placeholder={field.defaultUnit}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Nilai Parameter">
                  <InputNumber
                    style={{ width: '100%' }}
                    value={parameterData[field.key as keyof ParameterKualitasAir].nilai}
                    onChange={(value) => handleParameterChange(field.key as keyof ParameterKualitasAir, 'nilai', value)}
                    placeholder="Masukkan nilai"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Hasil Uji">
                  <InputNumber
                    style={{ width: '100%' }}
                    value={hasilData[field.key as keyof HasilKualitasAir].nilai}
                    onChange={(value) => handleHasilChange(field.key as keyof HasilKualitasAir, 'nilai', value)}
                    placeholder="Hasil pengujian"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Status">
                  <Select
                    value={hasilData[field.key as keyof HasilKualitasAir].status}
                    onChange={(value) => handleHasilChange(field.key as keyof HasilKualitasAir, 'status', value)}
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
                    value={hasilData[field.key as keyof HasilKualitasAir].keterangan}
                    onChange={(e) => handleHasilChange(field.key as keyof HasilKualitasAir, 'keterangan', e.target.value)}
                    placeholder="Keterangan tambahan"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        ))}
        
        <Form.Item>
          <Button type="primary" htmlType="submit" size="large">
            Simpan Data Kualitas Air
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default FormKualitasAir;