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

const { Title, Text } = Typography;

interface FormViewLaporanLabProps {
  propLabData?: MLaporanLab | false;
  selectedPeriode?: number;
  selectedTahun?: number;
  selectedIdLaporan?: number;
}

const FormViewLaporanLab: React.FC<FormViewLaporanLabProps> = ({ 
  propLabData,
  selectedPeriode,
  selectedTahun,
  selectedIdLaporan
}) => {
  const router = useRouter();
  
  const [labData, setLabData] = useState<MLaporanLab[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Normalisasi periode/tahun agar filter eksak, mencegah Januari (1) cocok ke Oktober (10)
  const monthNameToNumber = (val: any): number | null => {
    if (val === null || val === undefined) return null;
    if (typeof val === 'number') return val;
    const str = String(val).trim().toLowerCase();
    const asNum = parseInt(str, 10);
    if (!isNaN(asNum)) return asNum;
    const map: Record<string, number> = {
      'januari': 1,
      'februari': 2,
      'maret': 3,
      'april': 4,
      'mei': 5,
      'juni': 6,
      'juli': 7,
      'agustus': 8,
      'september': 9,
      'oktober': 10,
      'november': 11,
      'desember': 12,
    };
    return map[str] ?? null;
  };

  const extractPeriode = (item: any): number | null => {
    const d = item?.item ?? item;
    return monthNameToNumber(d?.periode ?? d?.periode_nama ?? item?.periode ?? item?.periode_nama);
  };

  const extractTahun = (item: any): number | null => {
    const d = item?.item ?? item;
    const t = d?.tahun ?? item?.tahun;
    if (t === null || t === undefined) return null;
    const num = typeof t === 'number' ? t : parseInt(String(t), 10);
    return isNaN(num) ? null : num;
  };

  const extractId = (item: any): number | null => {
    const d = item?.item ?? item;
    const id = d?.id_laporan_lab ?? item?.id_laporan_lab ?? d?.id ?? item?.id;
    if (id === null || id === undefined) return null;
    const num = typeof id === 'number' ? id : parseInt(String(id), 10);
    return isNaN(num) ? null : num;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('FormViewLaporanLab - Fetching lab data with filters:', { selectedPeriode, selectedTahun, selectedIdLaporan });
        
        // Build request payload with filters
        const requestPayload: any = {};
        if (selectedPeriode) {
          requestPayload.periode = selectedPeriode;
        }
        if (selectedTahun) {
          requestPayload.tahun = selectedTahun;
        }
        // Note: API may not support filtering by id directly; we filter client-side

        const response = await api.post('/user/laporan-lab/data', requestPayload);

        console.log('FormViewLaporanLab - API Response:', response.data);

        if (response.data.success && response.data.data && response.data.data.data) {
          let incomingData: any[] = response.data.data.data;

          // Terapkan filter eksak di frontend untuk memastikan hanya bulan/tahun terpilih yang tampil
          if (Array.isArray(incomingData)) {
            if (selectedIdLaporan) {
              incomingData = incomingData.filter((it) => extractId(it) === selectedIdLaporan);
            }
            if (selectedPeriode) {
              incomingData = incomingData.filter((it) => extractPeriode(it) === selectedPeriode);
            }
            if (selectedTahun) {
              incomingData = incomingData.filter((it) => extractTahun(it) === selectedTahun);
            }
          }

          console.log('FormViewLaporanLab - Setting lab data (filtered):', incomingData);
          setLabData(incomingData as MLaporanLab[]);
        } else {
          console.log('FormViewLaporanLab - API Error:', response.data.message);
          setError(response.data.message || 'Gagal mengambil data laporan lab');
          setLabData([]);
        }
      } catch (err: any) {
        console.error('Error fetching lab data:', err);
        setError(err.response?.data?.message || 'Terjadi kesalahan saat mengambil data');
        setLabData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedPeriode, selectedTahun, selectedIdLaporan]);

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

  const renderSpecificData = (labItem: MLaporanLab) => {
    if (!labItem) return null;

    console.log('FormViewLaporanLab - Lab data in renderSpecificData:', labItem);

    // Check if data is in the root level or nested in item
    const itemData = labItem.item || labItem;

    const specificFields = [
      { key: 'kualitas_udara', label: 'Kualitas Udara' },
      { key: 'kualitas_air', label: 'Kualitas Air' },
      { key: 'kualitas_makanan', label: 'Kualitas Makanan' },
      { key: 'usap_alat_medis', label: 'Usap Alat Medis' },
      { key: 'limbah_cair', label: 'Limbah Cair' },
    ];

    const hasSpecificData = specificFields.some(field => {
      const fieldValue = itemData[field.key as keyof typeof itemData];
      return fieldValue && fieldValue !== null && fieldValue !== '' && fieldValue !== 'null';
    });

    if (!hasSpecificData) {
      return (
        <Card title="Data Pemeriksaan Spesifik" size="small" style={{ marginBottom: 16 }}>
          <Text type="secondary">Tidak ada data pemeriksaan spesifik</Text>
        </Card>
      );
    }

    return (
      <Card title="Data Pemeriksaan Spesifik" size="small" style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]}>
          {specificFields.map(field => {
            const data = itemData[field.key as keyof typeof itemData];
            
            // Skip if no meaningful data
            if (!data || data === null || data === '' || data === 'null') {
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

  if (error) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Text type="danger">{error}</Text>
        </div>
      </Card>
    );
  }

  if (!labData || labData.length === 0) {
    const periodeName = selectedPeriode ? 
      ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
       'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][selectedPeriode] : '';
    
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Text>
            {selectedPeriode && selectedTahun 
              ? `Data laporan lab untuk ${periodeName} ${selectedTahun} tidak ditemukan`
              : 'Data laporan lab tidak ditemukan'
            }
          </Text>
        </div>
      </Card>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {labData.map((labItem, index) => {
        // Check if data is in the root level or nested in item
        const itemData = labItem.item || labItem;
        
        return (
          <Card key={labItem.id_laporan_lab || index} style={{ marginBottom: 24 }}>
            <Title level={3}>Detail Laporan Pemeriksaan Lab</Title>
            
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="Periode">
                {itemData?.periode_nama || labItem.periode_nama || itemData?.periode || labItem.periode || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="Tahun">
                {itemData?.tahun || labItem.tahun || '-'}
              </Descriptions.Item>
            </Descriptions>

            {/* Tampilkan Catatan jika ada */}
            {(itemData?.catatan && itemData.catatan !== '' && itemData.catatan !== 'null') && (
              <>
                <Divider />
                <Card title="Catatan" size="small" style={{ marginBottom: 16 }}>
                  <Text>{itemData.catatan}</Text>
                </Card>
              </>
            )}

            <Divider />

            {renderSpecificData(labItem)}

            {index < labData.length - 1 && <Divider />}
          </Card>
        );
      })}
      
      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <Button onClick={handleBack}>Kembali</Button>
      </div>
    </div>
  );
};

export default FormViewLaporanLab;