import React, { useState } from 'react';
import { Form, Input, InputNumber, Select, Button, Card, Row, Col } from 'antd';
import { ParameterKualitasMakanan, HasilKualitasMakanan, BaseParameter, BaseResult } from '@/models/MLaporanLab';

interface FormKualitasMakananProps {
  onSubmit: (data: {
    parameter_uji: ParameterKualitasMakanan;
    hasil_uji: HasilKualitasMakanan;
  }) => void;
  initialData?: {
    parameter_uji?: ParameterKualitasMakanan;
    hasil_uji?: HasilKualitasMakanan;
  };
}

const FormKualitasMakanan: React.FC<FormKualitasMakananProps> = ({ onSubmit, initialData }) => {
  const [form] = Form.useForm();

  const defaultParameter: ParameterKualitasMakanan = {
    makanan: { satuan: 'CFU/g', nilai: null },
    usap_alat_makan_masak: { satuan: 'CFU/cm²', nilai: null },
    usap_dubur: { satuan: 'CFU/swab', nilai: null }
  };

  const defaultHasil: HasilKualitasMakanan = {
    makanan: { nilai: null, status: 'normal', keterangan: '' },
    usap_alat_makan_masak: { nilai: null, status: 'normal', keterangan: '' },
    usap_dubur: { nilai: null, status: 'normal', keterangan: '' }
  };

  const [parameterData, setParameterData] = useState<ParameterKualitasMakanan>(
    initialData?.parameter_uji || defaultParameter
  );
  const [hasilData, setHasilData] = useState<HasilKualitasMakanan>(
    initialData?.hasil_uji || defaultHasil
  );

  const handleParameterChange = (field: keyof ParameterKualitasMakanan, key: keyof BaseParameter, value: any) => {
    setParameterData(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [key]: value
      }
    }));
  };

  const handleHasilChange = (field: keyof HasilKualitasMakanan, key: keyof BaseResult, value: any) => {
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
    { key: 'makanan', label: 'Makanan', defaultUnit: 'CFU/g' },
    { key: 'usap_alat_makan_masak', label: 'Usap Alat Makan & Masak', defaultUnit: 'CFU/cm²' },
    { key: 'usap_dubur', label: 'Usap Dubur', defaultUnit: 'CFU/swab' }
  ];

  return (
    <Card title="Form Pemeriksaan Kualitas Makanan" style={{ width: '100%' }}>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        {parameterFields.map((field) => (
          <Card key={field.key} size="small" style={{ marginBottom: 16 }}>
            <h4>{field.label}</h4>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="Satuan">
                  <Input
                    value={parameterData[field.key as keyof ParameterKualitasMakanan].satuan}
                    onChange={(e) => handleParameterChange(field.key as keyof ParameterKualitasMakanan, 'satuan', e.target.value)}
                    placeholder={field.defaultUnit}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Nilai Parameter">
                  <InputNumber
                    style={{ width: '100%' }}
                    value={parameterData[field.key as keyof ParameterKualitasMakanan].nilai}
                    onChange={(value) => handleParameterChange(field.key as keyof ParameterKualitasMakanan, 'nilai', value)}
                    placeholder="Masukkan nilai"
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Hasil Uji">
                  <InputNumber
                    style={{ width: '100%' }}
                    value={hasilData[field.key as keyof HasilKualitasMakanan].nilai}
                    onChange={(value) => handleHasilChange(field.key as keyof HasilKualitasMakanan, 'nilai', value)}
                    placeholder="Hasil pengujian"
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Status">
                  <Select
                    value={hasilData[field.key as keyof HasilKualitasMakanan].status}
                    onChange={(value) => handleHasilChange(field.key as keyof HasilKualitasMakanan, 'status', value)}
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
                    value={hasilData[field.key as keyof HasilKualitasMakanan].keterangan}
                    onChange={(e) => handleHasilChange(field.key as keyof HasilKualitasMakanan, 'keterangan', e.target.value)}
                    placeholder="Keterangan tambahan"
                  />
                </Form.Item>
              </Col>
            </Row>
          </Card>
        ))}
        
        <Form.Item>
          <Button type="primary" htmlType="submit" size="large">
            Simpan Data Kualitas Makanan
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default FormKualitasMakanan;