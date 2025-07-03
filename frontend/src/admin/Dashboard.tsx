import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CheckCircleOutlined, ExclamationCircleOutlined, ClockCircleOutlined, UserOutlined, FileDoneOutlined } from '@ant-design/icons';

const stats = [
  {
    title: 'Tổng số người dùng',
    value: 123,
    icon: <UserOutlined style={{ fontSize: 22, color: '#2563eb' }} />, 
    bg: 'bg-blue-100',
    iconBg: 'bg-blue-200',
  },
  {
    title: 'Tổng số task',
    value: 456,
    icon: <FileDoneOutlined style={{ fontSize: 22, color: '#a21caf' }} />, 
    bg: 'bg-purple-100',
    iconBg: 'bg-purple-200',
  },
  {
    title: 'Task hoàn thành',
    value: 320,
    icon: <CheckCircleOutlined style={{ fontSize: 22, color: '#16a34a' }} />, 
    bg: 'bg-green-50',
    iconBg: 'bg-green-100',
  },
  {
    title: 'Task quá hạn',
    value: 15,
    icon: <ClockCircleOutlined style={{ fontSize: 22, color: '#ef4444' }} />, 
    bg: 'bg-red-50',
    iconBg: 'bg-red-100',
  },
  {
    title: 'Báo cáo chưa xử lý',
    value: 5,
    icon: <ExclamationCircleOutlined style={{ fontSize: 22, color: '#eab308' }} />, 
    bg: 'bg-yellow-50',
    iconBg: 'bg-yellow-100',
  },
];

const chartData = [
  { month: 'Jan', done: 20 },
  { month: 'Feb', done: 35 },
  { month: 'Mar', done: 50 },
  { month: 'Apr', done: 40 },
  { month: 'May', done: 60 },
  { month: 'Jun', done: 80 },
  { month: 'Jul', done: 70 },
  { month: 'Aug', done: 90 },
  { month: 'Sep', done: 100 },
  { month: 'Oct', done: 110 },
  { month: 'Nov', done: 95 },
  { month: 'Dec', done: 120 },
];

const Dashboard: React.FC = () => (
  <>
    <h1 className="text-3xl font-bold mb-6 mt-0">Admin Dashboard</h1>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
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
      <h2 className="text-xl font-semibold mb-4">Thống kê task hoàn thành theo tháng</h2>
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
      <h2 className="text-xl font-semibold mb-2">Báo cáo gần đây</h2>
      <ul className="list-disc pl-5 text-gray-700">
        <li>Báo cáo 1</li>
        <li>Báo cáo 2</li>
        <li>Báo cáo 3</li>
      </ul>
    </div>
  </>
);

export default Dashboard; 