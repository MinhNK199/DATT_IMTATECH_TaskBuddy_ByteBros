import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Task } from '../interfaces/interfaces';
import '../App.css';

const TaskClient: React.FC = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
    keyword: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: 'personal',
    priority: 'medium',
    dueDate: new Date().toISOString().split('T')[0],
    estimatedHours: 1
  });
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, [filters, pagination.page, pagination.limit]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.priority) queryParams.append('priority', filters.priority);
      if (filters.keyword) queryParams.append('keyword', filters.keyword);
      queryParams.append('page', pagination.page.toString());
      queryParams.append('limit', pagination.limit.toString());

      const response = await api.get(`/tasks?${queryParams.toString()}`);
      if (response.data.success) {
        setTasks(response.data.data);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      } else {
        setError('Không thể tải danh sách nhiệm vụ');
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Lỗi kết nối đến máy chủ');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Kiểm tra trường bắt buộc
    if (!newTask.title || !newTask.dueDate) {
      setError('Vui lòng nhập đầy đủ tiêu đề và hạn chót cho task!');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        title: newTask.title,
        description: newTask.description,
        category: newTask.category,
        priority: newTask.priority,
        dueDate: new Date(newTask.dueDate).toISOString(),
        estimatedHours: newTask.estimatedHours
      };
      const response = await api.post('/tasks', payload);
      if (response.data.success) {
        // Thêm task mới vào đầu danh sách và cập nhật phân trang
        setTasks([response.data.data, ...tasks]);
        setPagination(prev => ({
          ...prev,
          total: prev.total + 1,
          pages: Math.ceil((prev.total + 1) / prev.limit)
        }));
        setShowNewTaskForm(false);
        setNewTask({
          title: '',
          description: '',
          category: 'personal',
          priority: 'medium',
          dueDate: new Date().toISOString().split('T')[0],
          estimatedHours: 1
        });
        setSuccessMessage('Tạo nhiệm vụ thành công!');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      console.error('Error creating task:', err);
      setError('Không thể tạo nhiệm vụ');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const response = await api.patch(`/tasks/${taskId}/status`, {
        status: newStatus
      });
      if (response.data.success) {
        setTasks(tasks.map(task => 
          task._id === taskId ? { ...task, status: newStatus as 'not_started' | 'in_progress' | 'completed' } : task
        ));
        setSuccessMessage('Cập nhật trạng thái nhiệm vụ thành công!');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      console.error('Error updating task status:', err);
      setError('Không thể cập nhật trạng thái nhiệm vụ');
    }
  };

  const handleDeleteTask = async (taskId: string, taskTitle: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa "${taskTitle}"?`)) return;
    
    try {
      const response = await api.delete(`/tasks/${taskId}`);
      if (response.data.success) {
        setTasks(tasks.filter(task => task._id !== taskId));
        setPagination(prev => {
          const newTotal = prev.total - 1;
          return {
            ...prev,
            total: newTotal,
            pages: Math.ceil(newTotal / prev.limit),
            page: prev.page > Math.ceil(newTotal / prev.limit) ? Math.ceil(newTotal / prev.limit) : prev.page
          };
        });
        setSuccessMessage('Xóa nhiệm vụ thành công!');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Không thể xóa nhiệm vụ');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not_started': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'border-l-green-500';
      case 'medium': return 'border-l-yellow-500';
      case 'high': return 'border-l-red-500';
      default: return 'border-l-gray-500';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low':
        return (
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
            Thấp
          </span>
        );
      case 'medium':
        return (
          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></span>
            Trung bình
          </span>
        );
      case 'high':
        return (
          <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
            <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
            Cao
          </span>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Check if a task is overdue
  const isOverdue = (dueDate: string, status: string) => {
    return new Date(dueDate) < new Date() && status !== 'completed';
  };

  // Get time remaining for task
  const getTimeRemaining = (dueDate: string, status: string) => {
    if (status === 'completed') return null;

    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      const abs = Math.abs(diffDays);
      return <span className="text-red-600 font-medium text-sm">Quá hạn {abs} {abs === 1 ? 'ngày' : 'ngày'}</span>;
    } else if (diffDays === 0) {
      return <span className="text-orange-600 font-medium text-sm">Đến hạn hôm nay</span>;
    } else if (diffDays === 1) {
      return <span className="text-orange-500 text-sm">Đến hạn ngày mai</span>;
    } else if (diffDays <= 3) {
      return <span className="text-amber-600 text-sm">Còn {diffDays} ngày</span>;
    } else {
      return <span className="text-gray-500 text-sm">Còn {diffDays} ngày</span>;
    }
  };

  return (
    <div className="px-4 py-6 md:py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header and actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quản lý nhiệm vụ</h1>
            <p className="text-gray-600">Tổ chức và theo dõi nhiệm vụ của bạn</p>
          </div>
          
          <button
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
            onClick={() => setShowNewTaskForm(!showNewTaskForm)}
          >
            {showNewTaskForm ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Hủy
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nhiệm vụ mới
              </>
            )}
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md" role="alert">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6 rounded-md" role="alert">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* New Task Form */}
        {showNewTaskForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Tạo nhiệm vụ mới</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Nhập tiêu đề nhiệm vụ"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  id="description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Nhập mô tả cho nhiệm vụ này"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Danh mục
                  </label>
                  <select
                    id="category"
                    value={newTask.category}
                    onChange={(e) => setNewTask({...newTask, category: e.target.value as 'personal' | 'work' | 'study'})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="personal">Cá nhân</option>
                    <option value="work">Công việc</option>
                    <option value="study">Học tập</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                    Mức độ ưu tiên
                  </label>
                  <select
                    id="priority"
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value as 'low' | 'medium' | 'high'})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="low">Thấp</option>
                    <option value="medium">Trung bình</option>
                    <option value="high">Cao</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày hết hạn <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    id="dueDate"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="estimatedHours" className="block text-sm font-medium text-gray-700 mb-1">
                    Thời gian ước tính (giờ)
                  </label>
                  <input
                    type="number"
                    id="estimatedHours"
                    min="0.5"
                    step="0.5"
                    max="24"
                    value={newTask.estimatedHours}
                    onChange={(e) => setNewTask({...newTask, estimatedHours: parseFloat(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewTaskForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors flex items-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang xử lý...
                    </>
                  ) : 'Lưu nhiệm vụ'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Task Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="keyword" className="block text-xs font-medium text-gray-500 mb-1">
                Tìm kiếm
              </label>
              <input
                type="text"
                id="keyword"
                value={filters.keyword}
                onChange={(e) => setFilters({...filters, keyword: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Tìm kiếm theo tiêu đề..."
              />
            </div>

            <div>
              <label htmlFor="filter-status" className="block text-xs font-medium text-gray-500 mb-1">
                Trạng thái
              </label>
              <select
                id="filter-status"
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="not_started">Chưa bắt đầu</option>
                <option value="in_progress">Đang thực hiện</option>
                <option value="completed">Hoàn thành</option>
              </select>
            </div>

            <div>
              <label htmlFor="filter-category" className="block text-xs font-medium text-gray-500 mb-1">
                Danh mục
              </label>
              <select
                id="filter-category"
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Tất cả danh mục</option>
                <option value="personal">Cá nhân</option>
                <option value="work">Công việc</option>
                <option value="study">Học tập</option>
              </select>
            </div>

            <div>
              <label htmlFor="filter-priority" className="block text-xs font-medium text-gray-500 mb-1">
                Mức độ ưu tiên
              </label>
              <select
                id="filter-priority"
                value={filters.priority}
                onChange={(e) => setFilters({...filters, priority: e.target.value})}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Tất cả mức ưu tiên</option>
                <option value="low">Thấp</option>
                <option value="medium">Trung bình</option>
                <option value="high">Cao</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tasks */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
          ) : tasks.length > 0 ? (
            <>
              <div className="divide-y divide-gray-200">
                {tasks.map((task) => (
                  <div key={task._id} className={`p-4 ${getPriorityColor(task.priority)} border-l-4`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start">
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                            <div className="mt-1 flex flex-wrap gap-2">
                              {getPriorityBadge(task.priority)}
                              <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getStatusColor(task.status)}`}>
                                {task.status === 'not_started' ? 'Chưa bắt đầu' : 
                                 task.status === 'in_progress' ? 'Đang thực hiện' : 'Hoàn thành'}
                              </span>
                              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-800">
                                {task.category === 'personal' ? 'Cá nhân' : 
                                 task.category === 'work' ? 'Công việc' : 'Học tập'}
                              </span>
                            </div>
                            {task.description && (
                              <p className="mt-2 text-sm text-gray-600">{task.description}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end space-y-2">
                        <div className="text-sm text-gray-500">
                          Hạn: {formatDate(task.dueDate)}
                        </div>
                        {task.isOverdue ? (
                          <span className="text-red-600 font-medium text-sm">Quá hạn</span>
                        ) : (
                          getTimeRemaining(task.dueDate, task.status)
                        )}
                        <div className="flex space-x-2">
                          {task.status !== 'completed' && (
                            <button
                              onClick={() => handleUpdateTaskStatus(task._id, 'completed')}
                              className="text-xs bg-green-100 hover:bg-green-200 text-green-800 py-1 px-2 rounded transition-colors"
                            >
                              Hoàn thành
                            </button>
                          )}
                          {task.status === 'not_started' && (
                            <button
                              onClick={() => handleUpdateTaskStatus(task._id, 'in_progress')}
                              className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 py-1 px-2 rounded transition-colors"
                            >
                              Bắt đầu
                            </button>
                          )}
                          {task.status === 'in_progress' && (
                            <button
                              onClick={() => handleUpdateTaskStatus(task._id, 'not_started')}
                              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 px-2 rounded transition-colors"
                            >
                              Tạm dừng
                            </button>
                          )}
                          {task.status === 'completed' && (
                            <button
                              onClick={() => handleUpdateTaskStatus(task._id, 'in_progress')}
                              className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 py-1 px-2 rounded transition-colors"
                            >
                              Làm lại
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteTask(task._id, task.title)}
                            className="text-xs bg-red-100 hover:bg-red-200 text-red-800 py-1 px-2 rounded transition-colors"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setPagination({...pagination, page: Math.max(1, pagination.page - 1)})}
                      disabled={pagination.page === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Trước
                    </button>
                    <button
                      onClick={() => setPagination({...pagination, page: Math.min(pagination.pages, pagination.page + 1)})}
                      disabled={pagination.page === pagination.pages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Sau
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Hiển thị <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> đến <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> trong số <span className="font-medium">{pagination.total}</span> nhiệm vụ
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => setPagination({...pagination, page: Math.max(1, pagination.page - 1)})}
                          disabled={pagination.page === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <span className="sr-only">Trang trước</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        {/* Page numbers */}
                        {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                          let pageNumber: number;
                          if (pagination.pages <= 5) {
                            pageNumber = i + 1;
                          } else if (pagination.page <= 3) {
                            pageNumber = i + 1;
                          } else if (pagination.page >= pagination.pages - 2) {
                            pageNumber = pagination.pages - 4 + i;
                          } else {
                            pageNumber = pagination.page - 2 + i;
                          }
                          
                          return (
                            <button
                              key={`page-${pageNumber}`}
                              onClick={() => setPagination({...pagination, page: pageNumber})}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                pagination.page === pageNumber
                                  ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {pageNumber}
                            </button>
                          );
                        })}
                        
                        <button
                          onClick={() => setPagination({...pagination, page: Math.min(pagination.pages, pagination.page + 1)})}
                          disabled={pagination.page === pagination.pages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          <span className="sr-only">Trang sau</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-20 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Không tìm thấy nhiệm vụ nào</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                Không tìm thấy nhiệm vụ nào với bộ lọc hiện tại. Hãy thử điều chỉnh bộ lọc hoặc tạo một nhiệm vụ mới.
              </p>
              <button
                onClick={() => setShowNewTaskForm(true)}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Tạo nhiệm vụ mới
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskClient; 