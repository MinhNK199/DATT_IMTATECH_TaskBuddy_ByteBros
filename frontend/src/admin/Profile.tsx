import React from 'react';
import { Card, Avatar, Typography, Button, Tag } from 'antd';
import { UserOutlined, EditOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const user = {
  name: 'Nguyễn Văn A',
  email: 'a@example.com',
  role: 'Admin',
  status: 'active',
};

const Profile: React.FC = () => (
  <Card className="max-w-md mx-auto" bordered={false} style={{ borderRadius: 16, boxShadow: '0 2px 8px #f0f1f2' }}>
    <div className="flex flex-col items-center justify-center">
      <Avatar size={96} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
      <Title level={3} className="mt-4 mb-1">{user.name}</Title>
      <Text type="secondary" className="mb-2">{user.email}</Text>
      <Tag color={user.role === 'Admin' ? 'geekblue' : 'green'} className="mb-2">{user.role}</Tag>
      <Button type="primary" icon={<EditOutlined />}>Chỉnh sửa thông tin</Button>
    </div>
  </Card>
);

export default Profile; 