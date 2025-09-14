import React, { useState } from 'react';
import { Button, Modal } from 'antd';
import {
  LoginOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
} from "@ant-design/icons";

const ModalValidasiTransporter: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const showModal = () => {
    setOpen(true);
  };

  const handleOk = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOpen(false);
    }, 3000);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <>
      <Button icon={<EyeOutlined />} type="primary" onClick={showModal}>
        View
      </Button>
      <Modal
        open={open}
        title="Form Validasi Transporter"
        onOk={handleOk}
        onCancel={handleCancel}
        footer={[
          <Button key="submit" type="primary" loading={loading} onClick={handleOk}>
            Validasi
          </Button>,
          <Button key="back" onClick={handleCancel}>
            Tolak
          </Button>,
        ]}
      >
        <p>Nama Transporter</p>
        <p>NPWP</p>
        <p>Kecamatan</p>
        <p>Kelurahan</p>
        <p>Alamat</p>
        <p>Nomor Handphone</p>
        <p>Email</p>
        <p>MOU</p>
      </Modal>
    </>
  );
};

export default ModalValidasiTransporter;