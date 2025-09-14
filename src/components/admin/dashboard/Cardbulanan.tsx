import React from 'react';
import { Card, Row, Col, Space } from 'antd';

const Cardbulanan: React.FC = () => (
  <Space direction="vertical" size={16}>
    <Row>
    <Col>
    <Card title="Default size card" style={{ width: 300 }}>
      <p>Card content</p>
      <p>Card content</p>
      <p>Card content</p>
    </Card>
    </Col>
    <Col>
    <Card size="small" title="Small size card" style={{ width: 300 }}>
      <p>Card content</p>
      <p>Card content</p>
      <p>Card content</p>
    </Card>
    </Col>
    </Row>
  </Space>
);

export default Cardbulanan;