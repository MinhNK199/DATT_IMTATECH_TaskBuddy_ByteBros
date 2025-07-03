import React from 'react';
import { Table, Tag, Avatar } from 'antd';
import { UserOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';

const data = [
  {
    key: '1',
    title: 'Thiết kế giao diện',
    assignee: 'Nguyễn Văn A',
    status: 'done',
    deadline: '2024-07-10',
  },
  {
    key: '2',
    title: 'Tích hợp API',
    assignee: 'Trần Thị B',
    status: 'pending',
    deadline: '2024-07-12',
  },
  {
    key: '3',
    title: 'Kiểm thử hệ thống',
    assignee: 'Lê Văn C',
    status: 'overdue',
    deadline: '2024-07-01',
  },
];

const columns = [
  {
    title: 'Tiêu đề',
    dataIndex: 'title',
    key: 'title',
  },
  {
    title: 'Người thực hiện',
    dataIndex: 'assignee',
    key: 'assignee',
    render: (name: string) => <span><Avatar size="small" icon={<UserOutlined />} className="mr-2" />{name}</span>,
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    key: 'status',
    render: (status: string) => {
      if (status === 'done') return <Tag color="green" icon={<CheckCircleOutlined />}>Hoàn thành</Tag>;
      if (status === 'pending') return <Tag color="blue" icon={<ClockCircleOutlined />}>Đang làm</Tag>;
      if (status === 'overdue') return <Tag color="red" icon={<ClockCircleOutlined />}>Quá hạn</Tag>;
      return null;
    },
  },
  {
    title: 'Hạn chót',
    dataIndex: 'deadline',
    key: 'deadline',
  },
];

const Tasks: React.FC = () => (
  <div className="bg-white rounded-lg shadow p-6">
    <h2 className="text-2xl font-bold mb-4">Danh sách công việc</h2>
    <Table columns={columns} dataSource={data} pagination={false} />
  </div>
);

export default Tasks; 