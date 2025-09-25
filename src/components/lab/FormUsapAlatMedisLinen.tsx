import React, { useState } from 'react';
import { Form, Input, InputNumber, Select, Button, Card, Row, Col } from 'antd';
import { ParameterUsapAlatMedisLinen, HasilUsapAlatMedisLinen, BaseParameter, BaseResult } from '@/models/MLaporanLab';

interface FormUsapAlatMedisLinenProps {
  onSubmit: (data: {
    parameter_uji: ParameterUsapAlatMedisLinen;
    hasil_uji: HasilUsapAlatMedisLinen;
  }) => void;
  initialData?: {
    parameter_uji?: ParameterUsapAlatMedisLinen;
    hasil_uji?: HasilUsapAlatMedisLinen;
  };
}

const FormUsapAlatMedisLinen: React.FC<FormUsapAlatMedisLinenProps> = ({ onSubmit, initialData }) => {
  const [form] = Form.useForm();

  const defaultParameter: ParameterUsapAlatMedisLinen = {
    alat_medis: { satuan: 'CFU/cm²', nilai: null },
    linen: { satuan: 'CFU/cm²', nilai: null }
  };

  const defaultHasil: HasilUsapAlatMedisLinen = {
    alat_medis: { nilai: null, status: 'normal', keterangan: '' },
    linen: { nilai: null, status: 'normal', keterangan: '' }
  };

  const [parameterData, setParameterData] = useState<ParameterUsapAlatMedisLinen>(
    initialData?.parameter_uji || defaultParameter
  );
  const [hasilData, setHasilData] = useState<HasilUsapAlatMedisLinen>(
    initialData?.hasil_uji || defaultHasil
  );

  const handleParameterChange = (field: keyof ParameterUsapAlatMedisLinen, key: keyof BaseParameter, value: any) => {
    setParameterData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [key]: value
      }
    }));
  };

  const handleHasilChange = (field: keyof HasilUsapAlatMedisLinen, key: keyof BaseResult, value: any) => {
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
    { key: 'alat_medis', label: 'Alat Medis', defaultUnit: 'CFU/cm²' },
    { key: 'linen', label: 'Linen', defaultUnit: 'CFU/cm²' }
  ];

  return (
    <Card title="Form Pemeriksaan Usap Alat Medis dan Linen" style={{ width: '100%' }}>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        {parameterFields.map((field) => (
          <Card key={field.key} size="small" style={{ marginBottom: 16 }}>
            <h4>{field.label}</h4>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="Satuan">
                  <Input
                    value={parameterData[field.key as keyof ParameterUsapAlatMedisLinen].satuan}
                    onChange={(e) => handleParameterChange(field.key as keyof ParameterUsapAlatMedisLinen, 'satuan', e.target.value)}
                    placeholder={field.defaultUnit}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Nilai Parameter">
                  <InputNumber
                    style={{ width: '100%' }}
                    value={parameterData[field.key as keyof ParameterUsapAlatMedisLinen].nilai}
                    onChange={(value) => handleParameterChange(field.key as keyof ParameterUsapAlatMedisLinen, 'nilai', value)}
                    placeholder="Masukkan nilai"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Hasil Uji">
                  <InputNumber
                    style={{ width: '100%' }}
                    value={hasilData[field.key as keyof HasilUsapAlatMedisLinen].nilai}
                    onChange={(value) => handleHasilChange(field.key as keyof HasilUsapAlatMedisLinen, 'nilai', value)}
                    placeholder="Hasil pengujian"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Status">
                  <Select
                    value={hasilData[field.key as keyof HasilUsapAlatMedisLinen].status}
                    onChange={(value) => handleHasilChange(field.key as keyof HasilUsapAlatMedisLinen, 'status', value)}
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
                    value={hasilData[field.key as keyof HasilUsapAlatMedisLinen].keterangan}
                    onChange={(e) => handleHasilChange(field.key as keyof HasilUsapAlatMedisLinen, 'keterangan', e.target.value)}
                    placeholder="Keterangan tambahan"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        ))}
        
        <Form.Item>
          <Button type="primary" htmlType="submit" size="large">
            Simpan Data Usap Alat Medis dan Linen
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default FormUsapAlatMedisLinen;