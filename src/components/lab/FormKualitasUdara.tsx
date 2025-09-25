import React, { useState } from 'react';
import { Form, Input, InputNumber, Select, Button, Card, Row, Col, Space } from 'antd';
import { PlusOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { ParameterKualitasUdara, HasilKualitasUdara, BaseParameter, BaseResult } from '@/models/MLaporanLab';

interface FormKualitasUdaraProps {
  onSubmit: (data: {
    parameter_uji: ParameterKualitasUdara;
    hasil_uji: HasilKualitasUdara;
  }) => void;
  initialData?: {
    parameter_uji?: ParameterKualitasUdara;
    hasil_uji?: HasilKualitasUdara;
  };
}

const FormKualitasUdara: React.FC<FormKualitasUdaraProps> = ({ onSubmit, initialData }) => {
  const [form] = Form.useForm();

  const defaultParameter: ParameterKualitasUdara = {
    pencahayaan: { satuan: 'lux', nilai: null },
    kebisingan: { satuan: 'dB', nilai: null },
    udara_ambien: { satuan: 'µg/m³', nilai: null },
    emisi: { satuan: 'mg/m³', nilai: null },
    kelembapan: { satuan: '%', nilai: null }
  };

  const defaultHasil: HasilKualitasUdara = {
    pencahayaan: { nilai: null, status: 'normal', keterangan: '' },
    kebisingan: { nilai: null, status: 'normal', keterangan: '' },
    udara_ambien: { nilai: null, status: 'normal', keterangan: '' },
    emisi: { nilai: null, status: 'normal', keterangan: '' },
    kelembapan: { nilai: null, status: 'normal', keterangan: '' }
  };

  const [parameterData, setParameterData] = useState<ParameterKualitasUdara>(
    initialData?.parameter_uji || defaultParameter
  );
  const [hasilData, setHasilData] = useState<HasilKualitasUdara>(
    initialData?.hasil_uji || defaultHasil
  );

  const handleParameterChange = (field: keyof ParameterKualitasUdara, key: keyof BaseParameter, value: any) => {
    setParameterData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [key]: value
      }
    }));
  };

  const handleHasilChange = (field: keyof HasilKualitasUdara, key: keyof BaseResult, value: any) => {
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
    { key: 'pencahayaan', label: 'Pencahayaan', defaultUnit: 'lux' },
    { key: 'kebisingan', label: 'Kebisingan', defaultUnit: 'dB' },
    { key: 'udara_ambien', label: 'Udara Ambien', defaultUnit: 'µg/m³' },
    { key: 'emisi', label: 'Emisi', defaultUnit: 'mg/m³' },
    { key: 'kelembapan', label: 'Kelembapan', defaultUnit: '%' }
  ];

  return (
    <Card title="Form Pemeriksaan Kualitas Udara" style={{ width: '100%' }}>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        {parameterFields.map((field) => (
          <Card key={field.key} size="small" style={{ marginBottom: 16 }}>
            <h4>{field.label}</h4>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="Satuan">
                  <Input
                    value={parameterData[field.key as keyof ParameterKualitasUdara].satuan}
                    onChange={(e) => handleParameterChange(field.key as keyof ParameterKualitasUdara, 'satuan', e.target.value)}
                    placeholder={field.defaultUnit}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Nilai Parameter">
                  <InputNumber
                    style={{ width: '100%' }}
                    value={parameterData[field.key as keyof ParameterKualitasUdara].nilai}
                    onChange={(value) => handleParameterChange(field.key as keyof ParameterKualitasUdara, 'nilai', value)}
                    placeholder="Masukkan nilai"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Hasil Uji">
                  <InputNumber
                    style={{ width: '100%' }}
                    value={hasilData[field.key as keyof HasilKualitasUdara].nilai}
                    onChange={(value) => handleHasilChange(field.key as keyof HasilKualitasUdara, 'nilai', value)}
                    placeholder="Hasil pengujian"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Status">
                  <Select
                    value={hasilData[field.key as keyof HasilKualitasUdara].status}
                    onChange={(value) => handleHasilChange(field.key as keyof HasilKualitasUdara, 'status', value)}
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
                    value={hasilData[field.key as keyof HasilKualitasUdara].keterangan}
                    onChange={(e) => handleHasilChange(field.key as keyof HasilKualitasUdara, 'keterangan', e.target.value)}
                    placeholder="Keterangan tambahan"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        ))}
        
        <Form.Item>
          <Button type="primary" htmlType="submit" size="large">
            Simpan Data Kualitas Udara
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default FormKualitasUdara;