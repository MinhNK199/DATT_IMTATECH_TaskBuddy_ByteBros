import React, { useState } from 'react';
import { Card, Avatar, Tabs, Form, Input, Button, DatePicker, Upload, message } from 'antd';
import { UserOutlined, UploadOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import moment from 'moment';

const { TabPane } = Tabs;

const Profile: React.FC = () => {
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const mockUser = {
    username: 'nguyenvan',
    fullName: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    phone: '0912345678',
    birthday: '1990-01-01',
    avatar: null,
  };

  const onFinish = (values: any) => {
    setLoading(true);
    // Giả lập API call
    setTimeout(() => {
      console.log('Thông tin đã cập nhật:', values);
      message.success('Cập nhật thông tin thành công!');
      setLoading(false);
    }, 1000);
  };

  const onPasswordChange = (values: any) => {
    setLoading(true);
    // Giả lập API call
    setTimeout(() => {
      console.log('Mật khẩu đã thay đổi');
      message.success('Thay đổi mật khẩu thành công!');
      passwordForm.resetFields();
      setLoading(false);
    }, 1000);
  };

  const uploadProps = {
    name: 'avatar',
    action: 'https://api.example.com/upload', // Thay bằng API upload thật
    headers: {
      authorization: 'authorization-text',
    },
    onChange(info: any) {
      if (info.file.status === 'done') {
        message.success(`${info.file.name} upload thành công`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} upload thất bại`);
      }
    },
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row items-center">
          <div className="mb-4 sm:mb-0 sm:mr-6">
            <Avatar 
              size={100} 
              icon={<UserOutlined />} 
              src={mockUser.avatar} 
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">{mockUser.fullName}</h2>
            <p className="text-gray-600">@{mockUser.username}</p>
            <p className="text-gray-600">{mockUser.email}</p>
          </div>
        </div>
      </Card>

      <Card>
        <Tabs defaultActiveKey="1">
          <TabPane tab="Thông tin cá nhân" key="1">
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                fullName: mockUser.fullName,
                email: mockUser.email,
                phone: mockUser.phone,
                birthday: mockUser.birthday ? moment(mockUser.birthday) : undefined,
              }}
              onFinish={onFinish}
            >
              <Form.Item label="Ảnh đại diện">
                <Upload {...uploadProps}>
                  <Button icon={<UploadOutlined />}>Tải ảnh lên</Button>
                </Upload>
              </Form.Item>

              <Form.Item
                name="fullName"
                label="Họ và tên"
                rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Họ và tên" />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email!' },
                  { type: 'email', message: 'Email không hợp lệ!' },
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="Email" />
              </Form.Item>

              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
              >
                <Input prefix={<PhoneOutlined />} placeholder="Số điện thoại" />
              </Form.Item>

              <Form.Item
                name="birthday"
                label="Ngày sinh"
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Cập nhật thông tin
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          <TabPane tab="Đổi mật khẩu" key="2">
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={onPasswordChange}
            >
              <Form.Item
                name="currentPassword"
                label="Mật khẩu hiện tại"
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu hiện tại" />
              </Form.Item>

              <Form.Item
                name="newPassword"
                label="Mật khẩu mới"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                  { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu mới" />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Xác nhận mật khẩu mới"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Mật khẩu xác nhận không trùng khớp!'));
                    },
                  }),
                ]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="Xác nhận mật khẩu mới" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Đổi mật khẩu
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default Profile; 