import React, { useState } from 'react';
import { Card, Form, Input, Button, message, Space, Typography } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import api from '@/utils/HttpRequest';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface FormData {
  kualitas_udara: string;
  kualitas_air: string;
  kualitas_makanan: string;
  usap_alat_medis_linen: string;
  limbah_cair: string;
}

const FormLaporanLabSimple: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    kualitas_udara: '',
    kualitas_air: '',
    kualitas_makanan: '',
    usap_alat_medis_linen: '',
    limbah_cair: ''
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Validasi sederhana
      const emptyFields = Object.entries(formData).filter(([_, value]) => !value.trim());
      if (emptyFields.length > 0) {
        message.warning('Mohon isi semua field pemeriksaan');
        return;
      }

      // API call ke backend
      const result = await api.post('/user/laporan-lab/simple-create', formData);

      if (result.data?.success) {
        message.success('Laporan lab berhasil disimpan!');
        
        // Reset form
        setFormData({
          kualitas_udara: '',
          kualitas_air: '',
          kualitas_makanan: '',
          usap_alat_medis_linen: '',
          limbah_cair: ''
        });
        form.resetFields();
      } else {
        message.error(result.data?.message || 'Gagal menyimpan laporan lab');
      }
      
    } catch (error: any) {
      message.error('Gagal menyimpan laporan lab');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Form Laporan Pemeriksaan Laboratorium" style={{ maxWidth: 800, margin: '0 auto' }}>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          
          {/* Pemeriksaan Kualitas Udara */}
          <div>
            <Title level={5}>1. Pemeriksaan Kualitas Udara</Title>
            <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: 8 }}>
              Meliputi: pencahayaan, kebisingan, udara ambien, emisi, kelembapan
            </Text>
            <Form.Item
              name="kualitas_udara"
              rules={[{ required: true, message: 'Mohon isi hasil pemeriksaan kualitas udara' }]}
            >
              <TextArea
                rows={3}
                placeholder="Masukkan hasil pemeriksaan kualitas udara..."
                value={formData.kualitas_udara}
                onChange={(e) => handleInputChange('kualitas_udara', e.target.value)}
              />
            </Form.Item>
          </div>

          {/* Pemeriksaan Kualitas Air */}
          <div>
            <Title level={5}>2. Pemeriksaan Kualitas Air</Title>
            <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: 8 }}>
              Meliputi: air minum, air hemodialisa, air untuk keperluan hygiene sanitasi
            </Text>
            <Form.Item
              name="kualitas_air"
              rules={[{ required: true, message: 'Mohon isi hasil pemeriksaan kualitas air' }]}
            >
              <TextArea
                rows={3}
                placeholder="Masukkan hasil pemeriksaan kualitas air..."
                value={formData.kualitas_air}
                onChange={(e) => handleInputChange('kualitas_air', e.target.value)}
              />
            </Form.Item>
          </div>

          {/* Pemeriksaan Kualitas Makanan */}
          <div>
            <Title level={5}>3. Pemeriksaan Kualitas Makanan</Title>
            <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: 8 }}>
              Meliputi: makanan, usap alat makan & masak, usap dubur
            </Text>
            <Form.Item
              name="kualitas_makanan"
              rules={[{ required: true, message: 'Mohon isi hasil pemeriksaan kualitas makanan' }]}
            >
              <TextArea
                rows={3}
                placeholder="Masukkan hasil pemeriksaan kualitas makanan..."
                value={formData.kualitas_makanan}
                onChange={(e) => handleInputChange('kualitas_makanan', e.target.value)}
              />
            </Form.Item>
          </div>

          {/* Pemeriksaan Usap Alat Medis dan Linen */}
          <div>
            <Title level={5}>4. Pemeriksaan Usap Alat Medis dan Linen</Title>
            <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: 8 }}>
              Pemeriksaan kebersihan alat medis dan linen rumah sakit
            </Text>
            <Form.Item
              name="usap_alat_medis_linen"
              rules={[{ required: true, message: 'Mohon isi hasil pemeriksaan usap alat medis dan linen' }]}
            >
              <TextArea
                rows={3}
                placeholder="Masukkan hasil pemeriksaan usap alat medis dan linen..."
                value={formData.usap_alat_medis_linen}
                onChange={(e) => handleInputChange('usap_alat_medis_linen', e.target.value)}
              />
            </Form.Item>
          </div>

          {/* Pemeriksaan Limbah Cair */}
          <div>
            <Title level={5}>5. Pemeriksaan Limbah Cair</Title>
            <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: 8 }}>
              Pemeriksaan kualitas limbah cair dari fasilitas kesehatan
            </Text>
            <Form.Item
              name="limbah_cair"
              rules={[{ required: true, message: 'Mohon isi hasil pemeriksaan limbah cair' }]}
            >
              <TextArea
                rows={3}
                placeholder="Masukkan hasil pemeriksaan limbah cair..."
                value={formData.limbah_cair}
                onChange={(e) => handleInputChange('limbah_cair', e.target.value)}
              />
            </Form.Item>
          </div>

          {/* Submit Button */}
          <Form.Item style={{ marginTop: 24 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SaveOutlined />}
              size="large"
              block
            >
              Simpan Laporan
            </Button>
          </Form.Item>

        </Space>
      </Form>
    </Card>
  );
};

export default FormLaporanLabSimple;