import React, { useState } from 'react';
import { PlusOutlined } from '@ant-design/icons';
import { Modal, Upload, Row, Col } from 'antd';
import type { RcFile, UploadProps } from 'antd/es/upload';
import type { UploadFile } from 'antd/es/upload/interface';

const getBase64 = (file: RcFile): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const ShowFile: React.FC = () => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [fileList, setFileList] = useState([
    {
      uid: '-1',
      name: 'cnn.pdf',
      status: 'done',
      url: 'http://localhost:7000/Abdurojak.pdf',
    },
  ]);

  const firstFileUrl = fileList[0].url;

  const handleCancel = () => setPreviewOpen(false);

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as RcFile);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
    setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
  };

  return (
    <>
      <Upload
        listType="text"
        onPreview={handlePreview}
      >
        {/* {fileList.length >= 8 ? null : uploadButton} */}
      </Upload>
      <Modal open={previewOpen} bodyStyle={{ height: "80vh" }} style={{ top: "5%" }} title={previewTitle} footer={null} onCancel={handleCancel}>
        <iframe src={firstFileUrl} style={{ width: "100%", height: "100%" }}></iframe>
      </Modal>
    </>
  );
};

export default ShowFile;