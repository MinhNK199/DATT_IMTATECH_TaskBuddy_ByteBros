import React from 'react';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  FileDoneOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';

const { Sider, Content } = Layout;

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // Lấy key menu từ path
  const selectedKey =
    location.pathname === '/admin' ? 'dashboard'
    : location.pathname === '/admin/users' ? 'users'
    : location.pathname === '/admin/tasks' ? 'tasks'
    : location.pathname === '/admin/reports' ? 'reports'
    : '';

  const handleMenuClick = (e: any) => {
    if (e.key === 'dashboard') navigate('/admin');
    if (e.key === 'users') navigate('/admin/users');
    if (e.key === 'tasks') navigate('/admin/tasks');
    if (e.key === 'reports') navigate('/admin/reports');
  };

  return (
    <Layout style={{ minHeight: '100vh', margin: 0, padding: 0 }}>
      <Sider breakpoint="lg" collapsedWidth="0" style={{ background: '#fff', margin: 0, padding: 0 }}>
        <Menu mode="inline" selectedKeys={[selectedKey]} style={{ height: '100%', borderRight: 0 }} onClick={handleMenuClick}>
          <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
            Dashboard
          </Menu.Item>
          <Menu.Item key="users" icon={<UserOutlined />}>
            Users
          </Menu.Item>
          <Menu.Item key="tasks" icon={<FileDoneOutlined />}>
            Tasks
          </Menu.Item>
          <Menu.Item key="reports" icon={<FileTextOutlined />}>
            Reports
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout style={{ margin: 0, padding: 0 }}>
        <Content className="bg-gray-100" style={{ padding: 0, margin: 0, minHeight: '100vh' }}>
          <div className="max-w-6xl mx-auto p-4 pt-4">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout; 