import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message, Space, Typography, Select } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import api from '@/utils/HttpRequest';
import { useLaporanLabStore } from '@/stores/laporanLabStore';
import { useNotification } from '@/utils/Notif';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface FormData {
  periode: string;
  tahun: number;
  kualitas_udara: string;
  kualitas_air: string;
  kualitas_makanan: string;
  usap_alat_medis: string;
  limbah_cair: string;
  catatan: string;
}

type FormLaporanLabSimpleProps = {
  disableRedirect?: boolean;
  onSuccess?: (data?: any) => void;
  initialPeriode?: number;
  initialTahun?: number | string;
  lockPeriodYear?: boolean;
  onFinalSubmit?: (payload: any) => Promise<void> | void;
  onDraftChange?: (draft: any) => void;
  draftData?: any;
};

const FormLaporanLabSimple: React.FC<FormLaporanLabSimpleProps> = ({
  disableRedirect,
  onSuccess,
  initialPeriode,
  initialTahun,
  lockPeriodYear,
  onFinalSubmit,
  onDraftChange,
  draftData,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const laporanLabStore = useLaporanLabStore();
  const { action } = router.query; // Get action parameter from URL
  const { showNotification, contextHolder } = useNotification();
  const isEditMode = action === 'edit';
  const [isPeriodTaken, setIsPeriodTaken] = useState(false);
  
  // Function to get current month name in Indonesian
  const getCurrentPeriode = () => {
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const currentMonth = new Date().getMonth();
    return monthNames[currentMonth];
  };
  
  const monthNameByNumber = (n?: number) => {
  const map = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  if (!n || n < 1 || n > 12) return getCurrentPeriode();
  return map[n-1];
  };
  
  const [formData, setFormData] = useState<FormData>({
  periode: monthNameByNumber(initialPeriode) || getCurrentPeriode(),
  tahun: initialTahun != null ? parseInt(String(initialTahun)) : new Date().getFullYear(),
     kualitas_udara: '',
     kualitas_air: '',
     kualitas_makanan: '',
     usap_alat_medis: '',
     limbah_cair: '',
     catatan: ''
   });
  
  // Set initial values for form fields
  useEffect(() => {
    // Check if this is edit mode and we have data from store
    if (action === 'edit' && laporanLabStore.id_laporan_lab) {
      // Set form data from store for edit mode
      const editData = {
        periode: laporanLabStore.periode_nama || getCurrentPeriode(),
        tahun: parseInt(laporanLabStore.tahun || new Date().getFullYear().toString()),
        kualitas_udara: laporanLabStore.kualitas_udara || '',
        kualitas_air: laporanLabStore.kualitas_air || '',
        kualitas_makanan: laporanLabStore.kualitas_makanan || '',
        usap_alat_medis: laporanLabStore.usap_alat_medis || '',
        limbah_cair: laporanLabStore.limbah_cair || '',
        catatan: laporanLabStore.catatan || ''
      };
      
      setFormData(editData);
      form.setFieldsValue(editData);
      // Jangan emit draft saat restore/prefill agar tidak loop
    } else {
      // Jika ada draftData dari wizard, gunakan untuk restore
      if (draftData) {
        const restored = {
          periode: draftData.periode ?? (monthNameByNumber(initialPeriode) || getCurrentPeriode()),
          tahun: draftData.tahun ?? (initialTahun != null ? parseInt(String(initialTahun)) : new Date().getFullYear()),
          kualitas_udara: draftData.kualitas_udara ?? '',
          kualitas_air: draftData.kualitas_air ?? '',
          kualitas_makanan: draftData.kualitas_makanan ?? '',
          usap_alat_medis: draftData.usap_alat_medis ?? '',
          limbah_cair: draftData.limbah_cair ?? '',
          catatan: draftData.catatan ?? ''
        };
        setFormData(restored);
        form.setFieldsValue(restored);
        // Jangan emit draft saat restore agar tidak menyebabkan loop
      } else {
        // Default values for new form (respect initial props if provided)
        const defaultVal = {
          periode: monthNameByNumber(initialPeriode) || getCurrentPeriode(),
          tahun: initialTahun != null ? parseInt(String(initialTahun)) : new Date().getFullYear(),
        } as Partial<FormData>;
        form.setFieldsValue(defaultVal);
      }
    }
  }, [form, action, laporanLabStore, draftData]);

  // Info notifikasi saat halaman dibuka
  useEffect(() => {
    showNotification('info', 'Form Laporan Lab', 'Lengkapi semua field pemeriksaan. Catatan opsional.');
  }, []);

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      if (onDraftChange) {
        try { onDraftChange(next); } catch {}
      }
      return next;
    });
    try { form.setFieldsValue({ [field]: value }); } catch {}
  };

  // Precheck duplikasi periode/tahun
  const precheckExistingPeriod = async (
    periodeOverride?: string,
    tahunOverride?: number | string
  ): Promise<boolean> => {
    try {
      const monthMapping: Record<string, number> = {
        'Januari': 1, 'Februari': 2, 'Maret': 3, 'April': 4,
        'Mei': 5, 'Juni': 6, 'Juli': 7, 'Agustus': 8,
        'September': 9, 'Oktober': 10, 'November': 11, 'Desember': 12,
        'Triwulan 1': 3, 'Triwulan 2': 6, 'Triwulan 3': 9, 'Triwulan 4': 12,
        'Semester 1': 6, 'Semester 2': 12, 'Tahunan': 12
      };
      const pName = typeof periodeOverride !== 'undefined' ? periodeOverride : String(formData.periode);
      const tRaw = typeof tahunOverride !== 'undefined' ? tahunOverride : formData.tahun;
      const p = monthMapping[pName] ?? 1;
      const t = parseInt(String(tRaw));
      if (isNaN(p) || isNaN(t) || isEditMode) {
        setIsPeriodTaken(false);
        return false;
      }
      const resp = await api.post('/user/laporan-lab/data', { periode: p, tahun: t }).catch(() => null);
      const arrA = resp?.data?.data; // bentuk: data: []
      const arrB = resp?.data?.data?.data; // bentuk: data: { data: [] }
      const list = Array.isArray(arrA) ? arrA : (Array.isArray(arrB) ? arrB : []);
      const taken = Array.isArray(list) && list.length > 0;
      setIsPeriodTaken(taken);
      if (taken) {
        showNotification('warning', 'Periode sudah ada', 'Periode yang dipilih sudah memiliki data laporan lab. Silakan pilih periode lain atau gunakan mode edit.');
      }
      return taken;
    } catch (err) {
      setIsPeriodTaken(false);
      return false;
    }
  };

  // Trigger precheck saat periode/tahun berubah
  useEffect(() => {
    precheckExistingPeriod().catch(() => {});
  }, [formData.periode, formData.tahun, isEditMode]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Validasi sederhana
      if (!formData.periode || !formData.tahun) {
        // message.warning('Mohon pilih periode dan tahun laporan');
        showNotification('warning', 'Validasi', 'Mohon pilih periode dan tahun laporan');
        return;
      }
      
      if (!isEditMode && isPeriodTaken) {
        showNotification('warning', 'Periode sudah ada', 'Periode yang dipilih sudah memiliki data laporan lab. Silakan pilih periode lain atau gunakan mode edit.');
        return;
      }
      const emptyFields = Object.entries(formData).filter(([key, value]) => {
        if (key === 'periode' || key === 'tahun' || key === 'catatan') return false; // Skip periode, tahun, dan catatan karena catatan opsional
        return typeof value === 'string' && !value.trim();
      });
      
      if (emptyFields.length > 0) {
        // message.warning('Mohon isi semua field pemeriksaan');
        showNotification('warning', 'Validasi', 'Mohon isi semua field pemeriksaan');
        return;
      }

      // Pre-check duplikasi untuk menghindari HTTP 400 dari backend
      const monthMapping: Record<string, number> = {
        'Januari': 1, 'Februari': 2, 'Maret': 3, 'April': 4,
        'Mei': 5, 'Juni': 6, 'Juli': 7, 'Agustus': 8,
        'September': 9, 'Oktober': 10, 'November': 11, 'Desember': 12,
        'Triwulan 1': 3, 'Triwulan 2': 6, 'Triwulan 3': 9, 'Triwulan 4': 12,
        'Semester 1': 6, 'Semester 2': 12, 'Tahunan': 12
      };
      const periodeNumber = monthMapping[String(formData.periode)] ?? 1;
      const tahunInt = typeof formData.tahun === 'string' ? parseInt(formData.tahun, 10) : formData.tahun;

      if (action !== 'edit') {
        const precheckRes = await api.post('/user/laporan-lab/data', { periode: periodeNumber, tahun: tahunInt }).catch(() => null);
        const existingList = precheckRes?.data?.data?.data;
        if (Array.isArray(existingList) && existingList.length > 0) {
          showNotification('warning', 'Periode sudah ada', 'Periode yang dipilih sudah memiliki data. Silahkan pilih periode lain.');
          return;
        }
      }

      // Determine API endpoint and payload based on mode
      let apiEndpoint = '/user/laporan-lab/simple-create';
      let payload = formData;
      
      if (action === 'edit' && laporanLabStore.id_laporan_lab) {
        // Edit mode - use update endpoint with oldid
        apiEndpoint = '/user/laporan-lab/simple-update';
        payload = {
          ...formData,
          oldid: laporanLabStore.id_laporan_lab
        };
      }

      // Jika ada handler final submit dari wizard, gunakan itu dan jangan panggil API default
      if (typeof onFinalSubmit === 'function') {
        await onFinalSubmit(payload);
        return;
      }

      // API call ke backend (tangani error 400 dengan .catch agar tidak memunculkan overlay)
      const result = await api.post(apiEndpoint, payload).catch((error: any) => {
        const defaultErrorMsg = action === 'edit' ? 'Gagal mengupdate laporan lab' : 'Gagal menyimpan laporan lab';
        const status = error?.response?.status;
        const backendMsg = error?.response?.data?.message || error?.response?.data?.error || error?.message;

        if (status === 400) {
          const msg = 'Periode yang dipilih sudah memiliki data. Silahkan pilih periode lain.';
          showNotification('warning', 'Periode sudah ada', msg);
        } else {
          showNotification('error', 'Gagal', backendMsg || defaultErrorMsg);
        }
        console.error('Submit error:', error);
        return null;
      });
      if (!result) {
        return;
      }

      if (result.data?.success) {
        const successMessage = action === 'edit' ? 'Laporan lab berhasil diupdate!' : 'Laporan lab berhasil disimpan!';
        // message.success(successMessage);
        showNotification('success', 'Sukses', successMessage);
        // Reset form
        setFormData({
          periode: getCurrentPeriode(),
          tahun: new Date().getFullYear(),
          kualitas_udara: '',
          kualitas_air: '',
          kualitas_makanan: '',
          usap_alat_medis: '',
          limbah_cair: '',
          catatan: ''
        });
        form.resetFields();
        if (onSuccess) {
          try { onSuccess(result.data); } catch {}
        }
        if (!disableRedirect) {
          setTimeout(() => {
            router.push('/dashboard/user/lab-lainnya');
          }, 1500);
        }
        

       } else {
         // message.error(result.data?.message || 'Gagal menyimpan laporan lab');
         showNotification('error', 'Gagal', result.data?.message || 'Gagal menyimpan laporan lab');
       }
    } catch (error: any) {
      showNotification('error', 'Gagal', 'Terjadi kesalahan tak terduga saat submit.');
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Card title="Form Laporan Pemeriksaan Laboratorium" style={{ maxWidth: 800, margin: '0 auto' }}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            
            {/* Periode dan Tahun */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <div style={{ flex: 1 }}>
                <Title level={5}>Periode Laporan</Title>
                <Form.Item
                  name="periode"
                  rules={[{ required: true, message: 'Mohon pilih periode laporan' }]}
                >
                  <Select
                    placeholder="Pilih periode..."
                    value={formData.periode}
                    onChange={(value) => handleInputChange('periode', value)}
                    disabled={action === 'edit' || !!lockPeriodYear}
                    options={[
                      { value: 'Januari', label: 'Januari' },
                      { value: 'Februari', label: 'Februari' },
                      { value: 'Maret', label: 'Maret' },
                      { value: 'April', label: 'April' },
                      { value: 'Mei', label: 'Mei' },
                      { value: 'Juni', label: 'Juni' },
                      { value: 'Juli', label: 'Juli' },
                      { value: 'Agustus', label: 'Agustus' },
                      { value: 'September', label: 'September' },
                      { value: 'Oktober', label: 'Oktober' },
                      { value: 'November', label: 'November' },
                      { value: 'Desember', label: 'Desember' },
                      { value: 'Triwulan 1', label: 'Triwulan 1 (Jan-Mar)' },
                      { value: 'Triwulan 2', label: 'Triwulan 2 (Apr-Jun)' },
                      { value: 'Triwulan 3', label: 'Triwulan 3 (Jul-Sep)' },
                      { value: 'Triwulan 4', label: 'Triwulan 4 (Okt-Des)' },
                      { value: 'Semester 1', label: 'Semester 1 (Jan-Jun)' },
                      { value: 'Semester 2', label: 'Semester 2 (Jul-Des)' },
                      { value: 'Tahunan', label: 'Tahunan' }
                    ]}
                  />
                </Form.Item>
              </div>
              
              <div style={{ flex: 1 }}>
                <Title level={5}>Tahun</Title>
                <Form.Item
                  name="tahun"
                  rules={[
                    { required: true, message: 'Mohon masukkan tahun' },
                    { 
                      pattern: /^\d{4}$/,
                      message: 'Tahun harus berupa 4 digit angka' 
                    },
                    {
                      validator: (_, value) => {
                        if (!value) return Promise.resolve();
                        const year = parseInt(value);
                        const currentYear = new Date().getFullYear();
                        if (year < 2000 || year > currentYear + 5) {
                          return Promise.reject(new Error(`Tahun harus antara 2000 - ${currentYear + 5}`));
                        }
                        return Promise.resolve();
                      }
                    }
                  ]}
                >
                  <Input
                    placeholder="Masukkan tahun (contoh: 2024)"
                    value={formData.tahun}
                    onChange={(e) => handleInputChange('tahun', e.target.value)}
                    disabled={action === 'edit' || !!lockPeriodYear}
                    maxLength={4}
                  />
                </Form.Item>
              </div>
            </div>
            
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
                name="usap_alat_medis"
                rules={[{ required: true, message: 'Mohon isi hasil pemeriksaan usap alat medis dan linen' }]}
              >
                <TextArea
                  rows={3}
                  placeholder="Masukkan hasil pemeriksaan usap alat medis dan linen..."
                  value={formData.usap_alat_medis}
                  onChange={(e) => handleInputChange('usap_alat_medis', e.target.value)}
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

            {/* Catatan */}
            <div>
              <Title level={5}>Catatan</Title>
              <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: 8 }}>
                Catatan tambahan atau keterangan khusus terkait laporan laboratorium
              </Text>
              <Form.Item
                name="catatan"
              >
                <TextArea
                  rows={3}
                  placeholder="Masukkan catatan tambahan (opsional)..."
                  value={formData.catatan}
                  onChange={(e) => handleInputChange('catatan', e.target.value)}
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
                disabled={!isEditMode && isPeriodTaken}
              >
                Simpan Laporan
              </Button>
            </Form.Item>

          </Space>
        </Form>
      </Card>
    </>
  );
};

export default FormLaporanLabSimple;