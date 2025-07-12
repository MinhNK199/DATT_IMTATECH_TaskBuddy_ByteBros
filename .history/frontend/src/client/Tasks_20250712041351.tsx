import React, { useState } from 'react';
import { Table, Tag, Button, Modal, Form, Input, DatePicker, Select, Space } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, PlusOutlined } from '@ant-design/icons';

const { Option } = Select;

const mockTasks = [
  {
    key: '1',
    title: 'Thiết kế trang chủ',
    status: 'done',
    priority: 'high',
    deadline: '2024-07-10',
  },
  {
    key: '2',
    title: 'Thêm tính năng thông báo',
    status: 'pending',
    priority: 'medium',
    deadline: '2024-07-12',
  },
  {
    key: '3',
    title: 'Tối ưu tốc độ tải trang',
    status: 'pending',
    priority: 'low',
    deadline: '2024-07-15',
  },
  {
    key: '4',
    title: 'Báo cáo tiến độ dự án',
    status: 'overdue',
    priority: 'high',
    deadline: '2024-07-01',
  },
];

const Tasks: React.FC = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [tasks, setTasks] = useState(mockTasks);

  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => {
        if (priority === 'high') return <Tag color="red">Cao</Tag>;
        if (priority === 'medium') return <Tag color="orange">Trung bình</Tag>;
        if (priority === 'low') return <Tag color="blue">Thấp</Tag>;
        return null;
      },
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
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record: any) => (
        <Space size="middle">
          {record.status !== 'done' && (
            <Button type="primary" size="small" onClick={() => markAsDone(record.key)}>
              Hoàn thành
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const markAsDone = (key: string) => {
    const updatedTasks = tasks.map(task => {
      if (task.key === key) {
        return { ...task, status: 'done' };
      }
      return task;
    });
    setTasks(updatedTasks);
  };

  const handleAddTask = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleOk = () => {
    form
      .validateFields()
      .then(values => {
        const newTask = {
          key: (tasks.length + 1).toString(),
          title: values.title,
          priority: values.priority,
          status: 'pending',
          deadline: values.deadline.format('YYYY-MM-DD'),
        };
        setTasks([...tasks, newTask]);
        setIsModalVisible(false);
        form.resetFields();
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Danh sách công việc</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddTask}>
          Thêm công việc
        </Button>
      </div>
      <Table columns={columns} dataSource={tasks} />

      <Modal
        title="Thêm công việc mới"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Thêm"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical" name="add_task_form">
          <Form.Item
            name="title"
            label="Tiêu đề"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề công việc!' }]}
          >
            <Input placeholder="Nhập tiêu đề công việc" />
          </Form.Item>
          <Form.Item
            name="priority"
            label="Mức độ ưu tiên"
            rules={[{ required: true, message: 'Vui lòng chọn mức độ ưu tiên!' }]}
          >
            <Select placeholder="Chọn mức độ ưu tiên">
              <Option value="high">Cao</Option>
              <Option value="medium">Trung bình</Option>
              <Option value="low">Thấp</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="deadline"
            label="Hạn chót"
            rules={[{ required: true, message: 'Vui lòng chọn hạn chót!' }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Tasks; 