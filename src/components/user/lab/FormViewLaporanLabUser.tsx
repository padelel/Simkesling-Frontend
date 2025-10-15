import React, { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Row,
  Typography,
  message,
  Spin,
} from "antd";
import { useRouter } from "next/router";
import { MLaporanLab } from "@/models/MLaporanLab";
import api from "@/utils/HttpRequest";
import { useLaporanLabStore } from '@/stores/laporanLabStore';

const { Title, Text } = Typography;

const FormViewLaporanLabUser: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const laporanLabStore = useLaporanLabStore();
  
  const [labData, setLabData] = useState<MLaporanLab | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('FormViewLaporanLabUser - ID from router:', id);
        console.log('FormViewLaporanLabUser - Store data:', laporanLabStore);

        // Jika ada ID dari query, fetch data dari API
        if (id) {
          console.log('FormViewLaporanLabUser - Fetching data for ID:', id);
          const response = await api.post('/user/laporan-lab/show', {
            id: id
          });

          console.log('FormViewLaporanLabUser - API Response:', response.data);

          if (response.data.success) {
            console.log('FormViewLaporanLabUser - Setting lab data:', response.data.data);
            setLabData(response.data.data);
          } else {
            console.log('FormViewLaporanLabUser - API Error:', response.data.message);
            setError(response.data.message || 'Gagal mengambil data laporan lab');
          }
        } 
        // Jika tidak ada ID, coba ambil dari store sebagai fallback
        else if (laporanLabStore && Object.keys(laporanLabStore).length > 1) {
          // Mengecek apakah store memiliki data yang valid (lebih dari properti default)
          console.log('FormViewLaporanLabUser - Using store data');
          setLabData(laporanLabStore as MLaporanLab);
        } 
        // Jika tidak ada ID dan tidak ada data di store
        else {
          console.log('FormViewLaporanLabUser - No ID and no store data');
          setError('Data laporan lab tidak ditemukan');
        }
      } catch (err: any) {
        console.error('Error fetching lab data:', err);
        setError(err.response?.data?.message || 'Terjadi kesalahan saat mengambil data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, laporanLabStore]);

  const handleBack = () => {
    router.back();
  };

  const openLink = (url: string) => {
    if (url && url !== '-' && url !== 'null') {
      window.open(url, '_blank');
    } else {
      message.info('Link tidak tersedia');
    }
  };

  const renderSpecificData = () => {
    if (!labData || !labData.item) return null;

    console.log('FormViewLaporanLabUser - Lab data in renderSpecificData:', labData);
    console.log('FormViewLaporanLabUser - Lab data keys:', Object.keys(labData));
    console.log('FormViewLaporanLabUser - Lab data structure:', JSON.stringify(labData, null, 2));

    // Access the actual data from the nested item object
    const itemData = labData.item;

    const specificFields = [
      { key: 'kualitas_udara', label: 'Kualitas Udara' },
      { key: 'kualitas_air', label: 'Kualitas Air' },
      { key: 'kualitas_makanan', label: 'Kualitas Makanan' },
      { key: 'usap_alat_medis', label: 'Usap Alat Medis' },
      { key: 'limbah_cair', label: 'Limbah Cair' },
    ];

    console.log('FormViewLaporanLabUser - Checking specific fields:', specificFields);

    const hasSpecificData = specificFields.some(field => {
      const fieldValue = itemData[field.key as keyof typeof itemData];
      console.log(`FormViewLaporanLabUser - Field ${field.key}:`, fieldValue);
      // Check if field has any meaningful data (not null, not empty string, not "null" string)
      return fieldValue && fieldValue !== null && fieldValue !== '' && fieldValue !== 'null';
    });

    console.log('FormViewLaporanLabUser - Has specific data:', hasSpecificData);

    if (!hasSpecificData) {
      console.log('FormViewLaporanLabUser - No specific data found, returning null');
      return null;
    }

    return (
      <Card title="Data Pemeriksaan Spesifik" size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          {specificFields.map(field => {
            const data = itemData[field.key as keyof typeof itemData];
            console.log(`FormViewLaporanLabUser - Rendering field ${field.key} with data:`, data);
            
            // Skip if no meaningful data
            if (!data || data === null || data === '' || data === 'null') {
              console.log(`FormViewLaporanLabUser - Skipping field ${field.key} - no meaningful data`);
              return null;
            }

            let parsedData;
            try {
              parsedData = typeof data === 'string' ? JSON.parse(data) : data;
            } catch {
              parsedData = data;
            }

            return (
              <Col span={24} key={field.key}>
                <Card size="small" title={field.label}>
                  {typeof parsedData === 'object' ? (
                    <Row gutter={[8, 8]}>
                      {Object.entries(parsedData).map(([key, value]) => (
                        <Col span={12} key={key}>
                          <Text strong>{key.replace(/_/g, ' ').toUpperCase()}: </Text>
                          {String(value).startsWith('http') ? (
                            <Button 
                              type="link" 
                              size="small"
                              onClick={() => window.open(String(value), '_blank')}
                              style={{ padding: 0, height: 'auto' }}
                            >
                              {String(value)}
                            </Button>
                          ) : (
                            <Text>{String(value)}</Text>
                          )}
                        </Col>
                      ))}
                    </Row>
                  ) : (
                    String(parsedData).startsWith('http') ? (
                      <Button 
                        type="link" 
                        size="small"
                        onClick={() => window.open(String(parsedData), '_blank')}
                        style={{ padding: 0, height: 'auto' }}
                      >
                        {String(parsedData)}
                      </Button>
                    ) : (
                      <Text>{String(parsedData)}</Text>
                    )
                  )}
                </Card>
              </Col>
            );
          })}
        </Row>
      </Card>
    );
  };

  const renderParameterUji = () => {
    // This function is no longer needed for simplified form
    return null;
  };

  const renderHasilUji = () => {
    // This function is no longer needed for simplified form  
    return null;
  };

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>
            <Text>Memuat data laporan lab...</Text>
          </div>
        </div>
      </Card>
    );
  }

  if (!labData) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Text>Data laporan lab tidak ditemukan</Text>
        </div>
      </Card>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={3}>Detail Laporan Pemeriksaan Lab</Title>
        
        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="Periode">
          {labData.item?.periode_nama}
        </Descriptions.Item>
        <Descriptions.Item label="Tahun">
          {labData.item?.tahun}
        </Descriptions.Item>
        </Descriptions>

        {/* Tampilkan Catatan jika ada */}
        {labData.item?.catatan && labData.item.catatan !== '' && labData.item.catatan !== 'null' && (
          <>
            <Divider />
            <Card title="Catatan" size="small" style={{ marginBottom: 16 }}>
              <Text>{labData.item.catatan}</Text>
            </Card>
          </>
        )}

        <Divider />

        {renderSpecificData()}

        <Divider />

        <div style={{ textAlign: 'center' }}>
          <Button onClick={handleBack}>Kembali</Button>
        </div>
      </Card>
    </div>
  );
};

export default FormViewLaporanLabUser;