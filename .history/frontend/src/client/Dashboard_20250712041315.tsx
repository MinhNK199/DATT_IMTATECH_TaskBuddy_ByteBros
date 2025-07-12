import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CheckCircleOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

const stats = [
  {
    title: 'Tổng số công việc',
    value: 28,
    icon: <ClockCircleOutlined style={{ fontSize: 22, color: '#2563eb' }} />, 
    bg: 'bg-blue-100',
    iconBg: 'bg-blue-200',
  },
  {
    title: 'Đã hoàn thành',
    value: 15,
    icon: <CheckCircleOutlined style={{ fontSize: 22, color: '#16a34a' }} />, 
    bg: 'bg-green-50',
    iconBg: 'bg-green-100',
  },
  {
    title: 'Đang thực hiện',
    value: 10,
    icon: <ClockCircleOutlined style={{ fontSize: 22, color: '#a21caf' }} />, 
    bg: 'bg-purple-100',
    iconBg: 'bg-purple-200',
  },
  {
    title: 'Quá hạn',
    value: 3,
    icon: <ExclamationCircleOutlined style={{ fontSize: 22, color: '#ef4444' }} />, 
    bg: 'bg-red-50',
    iconBg: 'bg-red-100',
  },
];

const chartData = [
  { month: 'Jan', done: 2 },
  { month: 'Feb', done: 3 },
  { month: 'Mar', done: 5 },
  { month: 'Apr', done: 4 },
  { month: 'May', done: 6 },
  { month: 'Jun', done: 8 },
  { month: 'Jul', done: 7 },
  { month: 'Aug', done: 9 },
  { month: 'Sep', done: 10 },
  { month: 'Oct', done: 11 },
  { month: 'Nov', done: 9 },
  { month: 'Dec', done: 12 },
];

const Dashboard: React.FC = () => (
  <>
    <h1 className="text-3xl font-bold mb-6 mt-0">Dashboard</h1>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, idx) => (
        <div key={idx} className={`flex items-center ${stat.bg} rounded-lg shadow p-4 hover:shadow-lg transition-shadow duration-200 min-w-0`}>
          <div className={`flex items-center justify-center rounded-full w-12 h-12 ${stat.iconBg} mr-4`}>
            {stat.icon}
          </div>
          <div className="truncate">
            <div className="text-base font-semibold mb-1 truncate">{stat.title}</div>
            <div className="text-xl font-bold">{stat.value}</div>
          </div>
        </div>
      ))}
    </div>
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h2 className="text-xl font-semibold mb-4">Thống kê công việc hoàn thành theo tháng</h2>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="done" fill="#2563eb" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-2">Công việc sắp đến hạn</h2>
      <ul className="list-disc pl-5 text-gray-700">
        <li>Hoàn thành thiết kế trang chủ - Hạn: 10/07/2024</li>
        <li>Thêm tính năng thông báo - Hạn: 12/07/2024</li>
        <li>Tối ưu tốc độ tải trang - Hạn: 15/07/2024</li>
      </ul>
    </div>
  </>
);

export default Dashboard; 