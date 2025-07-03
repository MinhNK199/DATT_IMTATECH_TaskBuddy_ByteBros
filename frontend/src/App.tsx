import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout, Avatar, Space, Badge, Dropdown, Menu, Modal, Tooltip, notification } from 'antd';
import { UserOutlined, BellOutlined, SettingOutlined, LogoutOutlined, IdcardOutlined } from '@ant-design/icons';
import './App.css';
import { Dashboard, Users, Tasks, Reports, AdminLayout } from './admin';

const { Header, Content, Footer } = Layout;

const App = () => {
  const [isLogoutModalVisible, setLogoutModalVisible] = React.useState(false);

  const handleMenuClick = (e: any) => {
    if (e.key === 'logout') {
      setLogoutModalVisible(true);
    }
  };

  const handleLogout = () => {
    setLogoutModalVisible(false);
    notification.success({ message: 'Đăng xuất thành công!' });
    // Thực hiện logic đăng xuất ở đây
  };

  const avatarMenu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="profile" icon={<IdcardOutlined />}>
        <span>Trang cá nhân</span>
      </Menu.Item>
      <Menu.Item key="logout" icon={<LogoutOutlined style={{ color: 'red' }} />} style={{ color: 'red' }}>
        <span>Đăng xuất</span>
      </Menu.Item>
    </Menu>
  );

  return (
    <Router>
      <Layout className="min-h-screen">
        <Header className="bg-white shadow">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <h1 className="text-xl font-bold">My App</h1>
            <Space size="large">
              <Tooltip title="Thông báo">
                <Badge count={3}>
                  <BellOutlined style={{ fontSize: 20, cursor: 'pointer' }} />
                </Badge>
              </Tooltip>
              <Tooltip title="Cài đặt">
                <SettingOutlined style={{ fontSize: 20, cursor: 'pointer' }} />
              </Tooltip>
              <Tooltip title="Tài khoản">
                <Dropdown overlay={avatarMenu} placement="bottomRight" trigger={["click"]}>
                  <Avatar style={{ backgroundColor: '#1890ff', cursor: 'pointer' }} icon={<UserOutlined />} />
                </Dropdown>
              </Tooltip>
            </Space>
            <Modal
              title="Xác nhận đăng xuất"
              open={isLogoutModalVisible}
              onOk={handleLogout}
              onCancel={() => setLogoutModalVisible(false)}
              okText="Đăng xuất"
              okButtonProps={{ danger: true }}
              cancelText="Hủy"
            >
              Bạn có chắc chắn muốn đăng xuất không?
            </Modal>
          </div>
        </Header>
        <Content className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<div>Home Page</div>} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="reports" element={<Reports />} />
            </Route>
          </Routes>
        </Content>
        <Footer className="text-center">
          My App ©{new Date().getFullYear()} Created with React
        </Footer>
      </Layout>
    </Router>
  );
}

export default App;
