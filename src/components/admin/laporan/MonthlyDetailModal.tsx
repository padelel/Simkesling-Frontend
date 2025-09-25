import React from 'react';
import { Modal, Table, Tag, Row, Col, Statistic, Card } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface MonthlyData {
  periode: number;
  periode_nama: string;
  berat_total: number;
  status_laporan: string;
  tanggal_lapor: string;
}

interface YearlyWasteData {
  key: string;
  id_user: number;
  nama_fasilitas: string;
  tipe_tempat: string;
  alamat_tempat: string;
  kelurahan: string;
  kecamatan: string;
  tahun: number;
  total_berat_tahunan: number;
  total_laporan_submitted: number;
  bulan_data: MonthlyData[];
  persentase_kelengkapan: number;
  rata_rata_bulanan: number;
}

interface MonthlyDetailModalProps {
  visible: boolean;
  onClose: () => void;
  facilityData: YearlyWasteData | null;
}

const MonthlyDetailModal: React.FC<MonthlyDetailModalProps> = ({
  visible,
  onClose,
  facilityData
}) => {
  if (!facilityData) return null;

  // Create complete monthly data (Jan-Dec) with missing months
  const completeMonthlyData = Array.from({ length: 12 }, (_, index) => {
    const periode = index + 1;
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    
    const existingData = facilityData.bulan_data.find(item => item.periode === periode);
    
    return existingData || {
      periode,
      periode_nama: monthNames[index],
      berat_total: 0,
      status_laporan: 'Belum Lapor',
      tanggal_lapor: '-'
    };
  });

  const columns: ColumnsType<MonthlyData> = [
    {
      title: 'Bulan',
      dataIndex: 'periode_nama',
      key: 'periode_nama',
      width: 120,
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {facilityData.tahun}
          </div>
        </div>
      ),
    },
    {
      title: 'Berat Limbah (Kg)',
      dataIndex: 'berat_total',
      key: 'berat_total',
      width: 150,
      align: 'right',
      render: (value) => (
        <span style={{ 
          fontWeight: value > 0 ? 'bold' : 'normal',
          color: value > 0 ? '#1890ff' : '#999'
        }}>
          {value > 0 
            ? value.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : '0.00'
          }
        </span>
      ),
    },
    {
      title: 'Status Laporan',
      dataIndex: 'status_laporan',
      key: 'status_laporan',
      width: 120,
      align: 'center',
      render: (status) => (
        <Tag color={status === 'Sudah Lapor' ? 'green' : 'red'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Tanggal Lapor',
      dataIndex: 'tanggal_lapor',
      key: 'tanggal_lapor',
      width: 120,
      align: 'center',
      render: (date) => (
        <span style={{ color: date === '-' ? '#999' : '#333' }}>
          {date}
        </span>
      ),
    },
  ];

  // Calculate monthly statistics
  const monthsWithData = completeMonthlyData.filter(item => item.berat_total > 0);
  const highestMonth = monthsWithData.reduce((max, item) => 
    item.berat_total > max.berat_total ? item : max, 
    { periode_nama: '-', berat_total: 0 }
  );
  const lowestMonth = monthsWithData.reduce((min, item) => 
    item.berat_total < min.berat_total && item.berat_total > 0 ? item : min, 
    { periode_nama: '-', berat_total: monthsWithData.length > 0 ? monthsWithData[0].berat_total : 0 }
  );

  return (
    <Modal
      title={
        <div>
          <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
            Detail Bulanan - {facilityData.nama_fasilitas}
          </div>
          <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
            {facilityData.tipe_tempat} • {facilityData.kelurahan}, {facilityData.kecamatan} • Tahun {facilityData.tahun}
          </div>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      style={{ top: 20 }}
    >
      {/* Summary Statistics */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              title="Total Tahunan"
              value={facilityData.total_berat_tahunan}
              precision={2}
              suffix="Kg"
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Laporan Masuk"
              value={facilityData.total_laporan_submitted}
              suffix="/ 12 Bulan"
              valueStyle={{ 
                color: facilityData.total_laporan_submitted >= 12 ? '#52c41a' : 
                       facilityData.total_laporan_submitted >= 6 ? '#faad14' : '#ff4d4f'
              }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Rata-rata Bulanan"
              value={facilityData.rata_rata_bulanan}
              precision={2}
              suffix="Kg"
              valueStyle={{ color: '#722ed1' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Kelengkapan"
              value={facilityData.persentase_kelengkapan}
              precision={1}
              suffix="%"
              valueStyle={{ 
                color: facilityData.persentase_kelengkapan >= 80 ? '#52c41a' : 
                       facilityData.persentase_kelengkapan >= 50 ? '#faad14' : '#ff4d4f'
              }}
            />
          </Col>
        </Row>
      </Card>

      {/* Monthly Highlights */}
      {monthsWithData.length > 0 && (
        <Card size="small" style={{ marginBottom: '16px' }}>
          <Row gutter={16}>
            <Col span={12}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: '#666' }}>Bulan Tertinggi</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#52c41a' }}>
                  {highestMonth.periode_nama}
                </div>
                <div style={{ fontSize: '14px', color: '#1890ff' }}>
                  {highestMonth.berat_total.toLocaleString('id-ID', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })} Kg
                </div>
              </div>
            </Col>
            <Col span={12}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: '#666' }}>Bulan Terendah</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#faad14' }}>
                  {lowestMonth.periode_nama}
                </div>
                <div style={{ fontSize: '14px', color: '#1890ff' }}>
                  {lowestMonth.berat_total.toLocaleString('id-ID', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })} Kg
                </div>
              </div>
            </Col>
          </Row>
        </Card>
      )}

      {/* Monthly Data Table */}
      <Table
        columns={columns}
        dataSource={completeMonthlyData}
        pagination={false}
        size="small"
        rowKey="periode"
        rowClassName={(record) => 
          record.status_laporan === 'Belum Lapor' ? 'row-missing-data' : ''
        }
      />

      <style jsx>{`
        .row-missing-data {
          background-color: #fff2f0;
        }
        .row-missing-data:hover {
          background-color: #ffebe6 !important;
        }
      `}</style>
    </Modal>
  );
};

export default MonthlyDetailModal;