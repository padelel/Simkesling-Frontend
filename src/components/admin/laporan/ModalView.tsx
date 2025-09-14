import React, { useState, } from 'react';
import { Button, Modal, Row, Col, Divider } from 'antd';
import {
  LoginOutlined,
  EditOutlined,
  EyeOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import ShowFile from './ShowFile';

const info = () => {
  Modal.info({
    title: 'Detail Laporan',
    centered: true,
    content: (
      <div>
      <Row>
        <Col span={10}>
          Nama Transporter :
        </Col>
        <Col>
          PT God of Warrior
        </Col>
      </Row>
      <Row>
        <Col span={10}>
          Nama Pemusnah :
        </Col>
        <Col>
          PT God of Warrior
        </Col>
      </Row>
      <Row>
        <Col span={10}>
          Metode Pemusnah :
        </Col>
        <Col>
          PT God of Warrior
        </Col>
      </Row>
      <Row>
        <Col span={10}>
          Memiliki Penyimpanan/TPS :
        </Col>
        <Col>
          PT God of Warrior
        </Col>
      </Row>
      <Row>
        <Col span={10}>
          Ukuran :
        </Col>
        <Col>
          PT God of Warrior
        </Col>
      </Row>
      <Row>
        <Col span={10}>
          Manifest :
        </Col>
        <Col>
          <ShowFile />
        </Col>
      </Row>
      <Row>
        <Col span={10}>
          Logbook :
        </Col>
        <Col>
          <ShowFile />
        </Col>
      </Row>
      <Divider />
      <Row style={{ justifyContent: "center" }}>
        <h4>Limbah Cair</h4>
      </Row>
      <Row>
        <Col span={10}>
          Debit Limbah Cair :
        </Col>
        <Col>
          500 L
        </Col>
      </Row>
      <Row>
        <Col span={10}>
          Apakah Memenuhi Syarat :
        </Col>
        <Col>
          Tidak
        </Col>
      </Row>
      <Row>
        <Col span={10}>
          Catatan :
        </Col>
        <Col>
          Tidak ada
        </Col>
      </Row>
      <Divider />
      <Row style={{ justifyContent: "center" }}>
        <h4>Limbah Padat</h4>
      </Row>
      <Row>
        <Col span={10}>
          B3 Non-Covid :
        </Col>
        <Col>
          500 KG
        </Col>
      </Row>
      <Row>
        <Col span={10}>
          B3 Covid :
        </Col>
        <Col>
          100 KG
        </Col>
      </Row>
      <Row>
        <Col span={10}>
          B3 Padat :
        </Col>
      </Row>
      <Row>
        <Col span={10}>
        Kategori
        </Col>
        <Col span={10}>
        Catatan
        </Col>
        <Col>
        Total
        </Col>
      </Row>
      <Row>
        <Col span={10}>
        Infeksius
        </Col>
        <Col span={10}>
        Aktifitas Medis
        </Col>
        <Col>
        500 KG
        </Col>
      </Row>
      <Row>
        <Col span={10}>
        Kimiawi
        </Col>
        <Col span={10}>
        B3 Perkantoran
        </Col>
        <Col>
        100 KG
        </Col>
      </Row>
      </div>
    ),
    onOk() {},
  });
};

const ModalView: React.FC = () => {

  return (
    <>
      <Button icon={<EyeOutlined />} type="primary" onClick={info}>
        View
      </Button>
    </>
  );
};

export default ModalView;