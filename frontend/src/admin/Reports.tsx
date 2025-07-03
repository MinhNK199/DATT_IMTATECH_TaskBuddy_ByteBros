import React from 'react';
import { Table, Tag, Avatar } from 'antd';
import { UserOutlined, FileTextOutlined, ExclamationCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';

const data = [
  {
    key: '1',
    title: 'Báo cáo lỗi đăng nhập',
    sender: 'Nguyễn Văn A',
    date: '2024-07-01',
    status: 'pending',
  },
  {
    key: '2',
    title: 'Đề xuất tính năng mới',
    sender: 'Trần Thị B',
    date: '2024-07-02',
    status: 'resolved',
  },
  {
    key: '3',
    title: 'Báo cáo spam',
    sender: 'Lê Văn C',
    date: '2024-07-03',
    status: 'pending',
  },
];

const columns = [
  {
    title: 'Tiêu đề',
    dataIndex: 'title',
    key: 'title',
    render: (title: string) => <span><FileTextOutlined className="mr-2 text-blue-500" />{title}</span>,
  },
  {
    title: 'Người gửi',
    dataIndex: 'sender',
    key: 'sender',
    render: (name: string) => <span><Avatar size="small" icon={<UserOutlined />} className="mr-2" />{name}</span>,
  },
  {
    title: 'Ngày gửi',
    dataIndex: 'date',
    key: 'date',
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    key: 'status',
    render: (status: string) => {
      if (status === 'pending') return <Tag color="orange" icon={<ExclamationCircleOutlined />}>Chưa xử lý</Tag>;
      if (status === 'resolved') return <Tag color="green" icon={<CheckCircleOutlined />}>Đã xử lý</Tag>;
      return null;
    },
  },
];

const Reports: React.FC = () => (
  <div className="bg-white rounded-lg shadow p-6">
    <h2 className="text-2xl font-bold mb-4">Danh sách báo cáo</h2>
    <Table columns={columns} dataSource={data} pagination={false} />
  </div>
);

export default Reports; 