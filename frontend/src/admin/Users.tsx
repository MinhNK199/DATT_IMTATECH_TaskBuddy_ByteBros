import React, { useState } from 'react';
import { Table, Tag, Avatar, Button, Modal, Form, Input, Select, Space, Popconfirm, message } from 'antd';
import { UserOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const initialData = [
  {
    key: '1',
    name: 'Nguyễn Văn A',
    email: 'a@example.com',
    role: 'Admin',
    status: 'active',
  },
  {
    key: '2',
    name: 'Trần Thị B',
    email: 'b@example.com',
    role: 'User',
    status: 'inactive',
  },
  {
    key: '3',
    name: 'Lê Văn C',
    email: 'c@example.com',
    role: 'User',
    status: 'active',
  },
  {
    key: '4',
    name: 'Phạm Văn D',
    email: 'd@example.com',
    role: 'Admin',
    status: 'active',
  },
  {
    key: '5',
    name: 'Ngô Thị E',
    email: 'e@example.com',
    role: 'User',
    status: 'inactive',
  },
  {
    key: '6',
    name: 'Đỗ Văn F',
    email: 'f@example.com',
    role: 'User',
    status: 'active',
  },
];

const Users: React.FC = () => {
  const [data, setData] = useState(initialData);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [form] = Form.useForm();
  const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 4 });
  const [addBtnHover, setAddBtnHover] = useState(false);
  const [search, setSearch] = useState('');

  const showAddModal = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const showEditModal = (record: any) => {
    setEditingUser(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleDelete = (key: string) => {
    setData(data.filter((item) => item.key !== key));
    message.success('Đã xóa người dùng!');
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      if (editingUser) {
        setData(data.map((item) => (item.key === editingUser.key ? { ...editingUser, ...values } : item)));
        message.success('Đã cập nhật người dùng!');
      } else {
        const newUser = { ...values, key: Date.now().toString() };
        setData([...data, newUser]);
        message.success('Đã thêm người dùng!');
      }
      setIsModalVisible(false);
    });
  };

  const handleTableChange = (pag: any) => {
    setPagination(pag);
  };

  const filteredData = data.filter((item) => {
    const keyword = search.toLowerCase();
    return (
      (!keyword || item.name.toLowerCase().includes(keyword) || item.email.toLowerCase().includes(keyword)) &&
      (roleFilter ? item.role === roleFilter : true) &&
      (statusFilter ? item.status === statusFilter : true)
    );
  });

  const columns = [
    {
      title: 'Avatar',
      dataIndex: 'avatar',
      key: 'avatar',
      render: (_: any, record: any) => <Avatar icon={<UserOutlined />} />,
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      filters: [
        { text: 'Admin', value: 'Admin' },
        { text: 'User', value: 'User' },
      ],
      filteredValue: roleFilter ? [roleFilter] : null,
      onFilter: (value: any, record: any) => record.role === value,
      render: (role: string) => <Tag color={role === 'Admin' ? 'geekblue' : 'green'}>{role}</Tag>,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Hoạt động', value: 'active' },
        { text: 'Ngừng', value: 'inactive' },
      ],
      filteredValue: statusFilter ? [statusFilter] : null,
      onFilter: (value: any, record: any) => record.status === value,
      render: (status: string) => <Tag color={status === 'active' ? 'green' : 'volcano'}>{status === 'active' ? 'Hoạt động' : 'Ngừng'}</Tag>,
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => showEditModal(record)} />
          <Popconfirm title="Bạn có chắc chắn muốn xóa?" onConfirm={() => handleDelete(record.key)} okText="Xóa" cancelText="Hủy">
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
        <h2 className="text-2xl font-bold mb-2 sm:mb-0">Danh sách người dùng</h2>
        <Button
          icon={<PlusOutlined />}
          onClick={showAddModal}
          className="w-full sm:w-auto"
          style={{
            backgroundColor: addBtnHover ? '#fff' : '#2563eb',
            borderColor: '#2563eb',
            color: addBtnHover ? '#2563eb' : '#fff',
            borderRadius: 6,
            fontWeight: 500,
          }}
          onMouseEnter={() => setAddBtnHover(true)}
          onMouseLeave={() => setAddBtnHover(false)}
        >
          Thêm mới
        </Button>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <Input.Search
          placeholder="Tìm kiếm tên hoặc email..."
          allowClear
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 220 }}
          className="mb-2 sm:mb-0"
        />
        <Select
          allowClear
          placeholder="Lọc vai trò"
          style={{ width: 140 }}
          value={roleFilter}
          onChange={setRoleFilter}
          options={[
            { value: 'Admin', label: 'Admin' },
            { value: 'User', label: 'User' },
          ]}
        />
        <Select
          allowClear
          placeholder="Lọc trạng thái"
          style={{ width: 140 }}
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'active', label: 'Hoạt động' },
            { value: 'inactive', label: 'Ngừng' },
          ]}
        />
      </div>
      <Table
        columns={columns}
        dataSource={filteredData}
        pagination={{ ...pagination, total: filteredData.length, showSizeChanger: true, pageSizeOptions: ['2', '4', '8', '16'] }}
        onChange={handleTableChange}
      />
      <Modal
        title={editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={() => setIsModalVisible(false)}
        okText={editingUser ? 'Cập nhật' : 'Thêm mới'}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Tên" rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}> <Input /> </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Vui lòng nhập email!' }]}> <Input /> </Form.Item>
          <Form.Item name="role" label="Vai trò" rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}> <Select options={[{ value: 'Admin', label: 'Admin' }, { value: 'User', label: 'User' }]} /> </Form.Item>
          <Form.Item name="status" label="Trạng thái" rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}> <Select options={[{ value: 'active', label: 'Hoạt động' }, { value: 'inactive', label: 'Ngừng' }]} /> </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Users; 