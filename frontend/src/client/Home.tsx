import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { getAISuggestions, getAIPerformance } from '../services/api';

const Home: React.FC = () => {
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0
  });
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [aiSuggestions, setAISuggestions] = useState<any[]>([]);
  const [aiPerformance, setAIPerformance] = useState<any>(null);
  
  // Chat box states
  const [showChatBox, setShowChatBox] = useState(false);
  const [messages, setMessages] = useState<{text: string, sender: 'user' | 'assistant', timestamp: Date}[]>([
    {
      text: 'Xin chào! Tôi là trợ lý ảo TaskBuddy. Tôi có thể hướng dẫn bạn sử dụng ứng dụng. Hãy hỏi tôi về:\n- Cách tạo nhiệm vụ mới\n- Quản lý nhiệm vụ\n- Phân loại và ưu tiên\n- Thống kê và báo cáo\n\nHoặc gõ "trợ giúp" để xem danh sách các lệnh.',
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get('/auth/check');
        if (response.data.success) {
          setUser(response.data.data.user);
        }
      } catch (error) {
        console.error('Failed to fetch user profile', error);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Get task stats
        const statsResponse = await api.get('/tasks/stats');
        if (statsResponse.data.success) {
          setStats(statsResponse.data.data);
        }

        // Get recent tasks
        const tasksResponse = await api.get('/tasks?limit=5&sortBy=createdAt&sortOrder=desc');
        if (tasksResponse.data.success) {
          setRecentTasks(tasksResponse.data.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    // Fetch AI suggestions
    getAISuggestions().then(res => {
      if (res.data.success) setAISuggestions(res.data.suggestions);
    }).catch(() => {});
    // Fetch AI performance
    getAIPerformance().then(res => {
      if (res.data.success) setAIPerformance(res.data);
    }).catch(() => {});
  }, []);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Get color for task status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get priority indicator
  const getPriorityIndicator = (priority: string) => {
    switch (priority) {
      case 'high':
        return <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 mr-2"></span>;
      case 'medium':
        return <span className="flex h-2.5 w-2.5 rounded-full bg-yellow-500 mr-2"></span>;
      case 'low':
        return <span className="flex h-2.5 w-2.5 rounded-full bg-green-500 mr-2"></span>;
      default:
        return null;
    }
  };

  // Get time difference in days
  const getDaysDifference = (dateString: string) => {
    const today = new Date();
    const dueDate = new Date(dateString);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return <span className="text-red-600 font-medium">Overdue by {Math.abs(diffDays)} days</span>;
    } else if (diffDays === 0) {
      return <span className="text-orange-600 font-medium">Due today</span>;
    } else if (diffDays === 1) {
      return <span className="text-orange-500">Due tomorrow</span>;
    } else {
      return <span className="text-gray-500">Due in {diffDays} days</span>;
    }
  };

  // Thêm hàm mới để hiển thị thời gian bằng tiếng Việt
  const getTimeRemainingVietnamese = (dueDate: string, status: string) => {
    if (status === 'completed') return null;

    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      const abs = Math.abs(diffDays);
      return <span className="text-red-600 font-medium text-sm">Quá hạn {abs} {abs === 1 ? 'ngày' : 'ngày'}</span>;
    } else if (diffDays === 0) {
      return <span className="text-orange-600 font-medium text-sm">Hạn hôm nay</span>;
    } else if (diffDays === 1) {
      return <span className="text-orange-500 text-sm">Hạn ngày mai</span>;
    } else if (diffDays <= 3) {
      return <span className="text-amber-600 text-sm">Còn {diffDays} ngày</span>;
    } else {
      return <span className="text-gray-500 text-sm">Còn {diffDays} ngày</span>;
    }
  };

  // Handle sending a new message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Add user message to chat
    const userMessage = {
      text: newMessage,
      sender: 'user' as const,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    try {
      // Simulate API call to get AI response
      setTimeout(() => {
        let response = '';
        const query = newMessage.toLowerCase();
        
        // Hướng dẫn tổng quan về ứng dụng
        if (query.includes('hướng dẫn') || query.includes('cách sử dụng') || query.includes('giới thiệu')) {
          response = 'TaskBuddy là ứng dụng quản lý nhiệm vụ giúp bạn tổ chức công việc hiệu quả. Bạn muốn tìm hiểu về tính năng nào? Hãy hỏi về: "tạo nhiệm vụ", "quản lý nhiệm vụ", "phân loại", "thống kê" hoặc "hồ sơ".';
        }
        // Hướng dẫn tạo nhiệm vụ mới
        else if (query.includes('tạo nhiệm vụ') || query.includes('thêm task') || query.includes('nhiệm vụ mới')) {
          response = 'Để tạo nhiệm vụ mới:\n1. Nhấp vào nút "Tạo nhiệm vụ mới" ở trang chủ hoặc đi đến trang Nhiệm vụ\n2. Điền thông tin nhiệm vụ: tiêu đề, mô tả, danh mục, mức ưu tiên, hạn chót\n3. Nhấp "Lưu nhiệm vụ" để hoàn tất\n\nLưu ý: Tiêu đề và hạn chót là thông tin bắt buộc.';
        }
        // Hướng dẫn quản lý nhiệm vụ
        else if (query.includes('quản lý nhiệm vụ') || query.includes('cập nhật task') || query.includes('sửa nhiệm vụ')) {
          response = 'Để quản lý nhiệm vụ:\n1. Vào trang Nhiệm vụ để xem danh sách\n2. Bạn có thể thay đổi trạng thái nhiệm vụ bằng các nút: Bắt đầu, Hoàn thành, Tạm dừng\n3. Để xóa nhiệm vụ, nhấp vào nút "Xóa"\n4. Sử dụng bộ lọc để tìm nhiệm vụ theo trạng thái, danh mục, mức ưu tiên';
        }
        // Hướng dẫn về phân loại và tổ chức
        else if (query.includes('phân loại') || query.includes('danh mục') || query.includes('ưu tiên')) {
          response = 'TaskBuddy cho phép phân loại nhiệm vụ theo:\n1. Danh mục: Cá nhân, Công việc, Học tập\n2. Mức ưu tiên: Thấp, Trung bình, Cao\n3. Trạng thái: Chưa bắt đầu, Đang thực hiện, Hoàn thành\n\nBạn có thể sử dụng các bộ lọc này để sắp xếp và tìm kiếm nhiệm vụ.';
        }
        // Hướng dẫn về thống kê và báo cáo
        else if (query.includes('thống kê') || query.includes('báo cáo') || query.includes('tiến độ')) {
          response = 'Trang chủ hiển thị thống kê cơ bản về nhiệm vụ:\n1. Tổng số nhiệm vụ\n2. Số nhiệm vụ đã hoàn thành\n3. Số nhiệm vụ quá hạn\n\nBạn cũng có thể xem danh sách nhiệm vụ gần đây và nhận gợi ý từ AI để cải thiện năng suất.';
        }
        // Hướng dẫn về hồ sơ người dùng
        else if (query.includes('hồ sơ') || query.includes('tài khoản') || query.includes('profile')) {
          response = 'Để quản lý hồ sơ:\n1. Nhấp vào "Hồ sơ" trong menu\n2. Tại đây bạn có thể cập nhật thông tin cá nhân, đổi mật khẩu\n3. Bạn cũng có thể xem lịch sử hoạt động và thống kê cá nhân';
        }
        // Hướng dẫn về báo cáo vấn đề
        else if (query.includes('báo lỗi') || query.includes('vấn đề') || query.includes('hỗ trợ')) {
          response = 'Nếu bạn gặp vấn đề khi sử dụng TaskBuddy:\n1. Vào mục "Báo cáo" trong menu\n2. Điền thông tin chi tiết về vấn đề bạn gặp phải\n3. Đội ngũ hỗ trợ sẽ liên hệ lại trong thời gian sớm nhất';
        }
        // Hướng dẫn về tính năng AI
        else if (query.includes('ai') || query.includes('trí tuệ nhân tạo') || query.includes('gợi ý')) {
          response = 'TaskBuddy sử dụng AI để:\n1. Đưa ra gợi ý cải thiện năng suất dựa trên thói quen làm việc\n2. Phân tích hiệu suất hoàn thành nhiệm vụ\n3. Đề xuất cách sắp xếp thời gian hợp lý\n\nBạn có thể xem các gợi ý AI ở trang chủ.';
        }
        // Hướng dẫn về tính năng tìm kiếm
        else if (query.includes('tìm kiếm') || query.includes('search') || query.includes('lọc')) {
          response = 'Để tìm kiếm nhiệm vụ:\n1. Sử dụng thanh tìm kiếm ở trang Nhiệm vụ\n2. Lọc theo từ khóa, trạng thái, danh mục hoặc mức ưu tiên\n3. Kết quả sẽ được hiển thị ngay lập tức';
        }
        // Các lệnh trợ giúp
        else if (query.includes('help') || query.includes('trợ giúp') || query.includes('lệnh')) {
          response = 'Các lệnh hữu ích:\n- "hướng dẫn": Tổng quan về ứng dụng\n- "tạo nhiệm vụ": Cách tạo nhiệm vụ mới\n- "quản lý nhiệm vụ": Cách cập nhật và xóa nhiệm vụ\n- "phân loại": Thông tin về danh mục và ưu tiên\n- "thống kê": Xem báo cáo và tiến độ\n- "hồ sơ": Quản lý tài khoản\n- "báo lỗi": Cách báo cáo vấn đề';
        }
        // Chào hỏi
        else if (query.includes('xin chào') || query.includes('hello') || query.includes('hi') || query.includes('chào')) {
          response = `Xin chào${user ? ' ' + user.displayName.split(' ')[0] : ''}! Tôi là trợ lý TaskBuddy. Tôi có thể giúp bạn sử dụng ứng dụng. Hãy hỏi "trợ giúp" để xem các lệnh hữu ích.`;
        }
        // Cảm ơn
        else if (query.includes('cảm ơn') || query.includes('thank')) {
          response = 'Không có gì! Tôi luôn sẵn sàng hỗ trợ bạn sử dụng TaskBuddy. Có câu hỏi gì khác không?';
        }
        // Phản hồi mặc định
        else {
          response = 'Tôi chưa hiểu rõ câu hỏi của bạn. Bạn có thể hỏi về "hướng dẫn sử dụng", "tạo nhiệm vụ", "quản lý nhiệm vụ", hoặc gõ "trợ giúp" để xem danh sách các lệnh hữu ích.';
        }

        const assistantMessage = {
          text: response,
          sender: 'assistant' as const,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMessage]);
        setIsTyping(false);
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
    }
  };

  return (
    <div className="px-4 py-6 md:py-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-xl p-6 md:p-10 mb-8 text-white relative overflow-hidden">
          <div className="absolute right-0 top-0 w-1/3 h-full opacity-10">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
              <path fillRule="evenodd" d="M7.502 6h7.128A3.375 3.375 0 0118 9.375v9.375a3 3 0 003-3V6.108c0-1.505-1.125-2.811-2.664-2.94a48.972 48.972 0 00-.673-.05A3 3 0 0015 1.5h-1.5a3 3 0 00-2.663 1.618c-.225.015-.45.032-.673.05C8.662 3.295 7.554 4.542 7.502 6zM13.5 3A1.5 1.5 0 0012 4.5h4.5A1.5 1.5 0 0015 3h-1.5z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M3 9.375C3 8.339 3.84 7.5 4.875 7.5h9.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 013 20.625V9.375zM6 12a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V12zm2.25 0a.75.75 0 01.75-.75h3.75a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75zM6 15a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V15zm2.25 0a.75.75 0 01.75-.75h3.75a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75zM6 18a.75.75 0 01.75-.75h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H6.75a.75.75 0 01-.75-.75V18zm2.25 0a.75.75 0 01.75-.75h3.75a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75z" clipRule="evenodd" />
            </svg>
          </div>
          
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Chào mừng đến với TaskBuddy{user ? `, ${user.displayName.split(' ')[0]}` : ''}!</h1>
            <p className="text-indigo-100 max-w-2xl mb-6">Nền tảng quản lý công việc cá nhân được thiết kế để giúp bạn tổ chức, theo dõi và hoàn thành công việc một cách hiệu quả.</p>
            <Link to="/tasks" className="inline-flex items-center px-6 py-3 bg-white text-indigo-700 font-medium rounded-lg shadow hover:bg-indigo-50 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Tạo nhiệm vụ mới
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
                  <div className="rounded-full bg-indigo-100 p-3 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Tổng nhiệm vụ</p>
                    <h3 className="text-2xl font-bold text-gray-800">{stats.totalTasks}</h3>
                    <Link to="/tasks" className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">Xem tất cả nhiệm vụ</Link>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
                  <div className="rounded-full bg-green-100 p-3 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Đã hoàn thành</p>
                    <h3 className="text-2xl font-bold text-gray-800">{stats.completedTasks}</h3>
                    <Link to="/tasks?status=completed" className="text-xs text-green-600 hover:text-green-800 font-medium">Xem nhiệm vụ đã hoàn thành</Link>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
                  <div className="rounded-full bg-red-100 p-3 mr-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Quá hạn</p>
                    <h3 className="text-2xl font-bold text-gray-800">{stats.overdueTasks}</h3>
                    <Link to="/tasks?overdue=true" className="text-xs text-red-600 hover:text-red-800 font-medium">Xem nhiệm vụ quá hạn</Link>
                  </div>
                </div>
              </div>

              {/* Recent Tasks */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-800">Nhiệm vụ gần đây</h2>
                  <Link to="/tasks" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">Xem tất cả</Link>
                </div>
                
                {recentTasks.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {recentTasks.map((task) => (
                      <div key={task._id} className="px-6 py-4 transition-colors hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div className="flex items-start space-x-3">
                            {getPriorityIndicator(task.priority)}
                            <div>
                              <h3 className="font-medium text-gray-800">{task.title}</h3>
                              <div className="flex space-x-4 mt-1 text-sm">
                                <span className="text-gray-500">{task.category}</span>
                                <span>{getTimeRemainingVietnamese(task.dueDate, task.status)}</span>
                              </div>
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                            {task.status === 'not_started' ? 'Chưa bắt đầu' : 
                             task.status === 'in_progress' ? 'Đang thực hiện' : 'Hoàn thành'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-6 py-12 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-gray-500 mb-4">Không tìm thấy nhiệm vụ nào. Bắt đầu bằng cách tạo nhiệm vụ mới.</p>
                    <Link 
                      to="/tasks" 
                      className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Tạo nhiệm vụ
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <div>
              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-800">Hành động nhanh</h2>
                </div>
                <div className="p-6 space-y-4">
                  <Link 
                    to="/tasks" 
                    className="flex items-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    <div className="rounded-full bg-indigo-200 p-2 mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-indigo-700">Tạo nhiệm vụ mới</h3>
                      <p className="text-sm text-indigo-500">Thêm nhiệm vụ mới vào danh sách</p>
                    </div>
                  </Link>
                  
                  <Link 
                    to="/profile" 
                    className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <div className="rounded-full bg-purple-200 p-2 mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-purple-700">Cập nhật hồ sơ</h3>
                      <p className="text-sm text-purple-500">Chỉnh sửa thông tin tài khoản</p>
                    </div>
                  </Link>
                  
                  <Link 
                    to="/tasks?status=in_progress" 
                    className="flex items-center p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
                  >
                    <div className="rounded-full bg-amber-200 p-2 mr-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-amber-700">Xem nhiệm vụ đang thực hiện</h3>
                      <p className="text-sm text-amber-500">Kiểm tra các nhiệm vụ đang tiến hành</p>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Productivity Tips */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-sm border border-indigo-100 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Mẹo tăng năng suất</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-indigo-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Chia nhỏ các nhiệm vụ lớn thành các bước nhỏ, dễ quản lý</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-indigo-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Sử dụng "quy tắc 2 phút" - nếu làm dưới 2 phút, hãy làm ngay</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-indigo-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Đặt thời hạn cụ thể cho tất cả nhiệm vụ của bạn</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
        {/* AI Suggestions Section */}
        {aiSuggestions.length > 0 && (
          <div className="bg-yellow-50 rounded-xl shadow-sm border border-yellow-100 p-6 mb-6">
            <h3 className="text-lg font-bold text-yellow-800 mb-2">Gợi ý từ AI</h3>
            <ul className="list-disc pl-6 text-yellow-900">
              {aiSuggestions.map((s, idx) => (
                <li key={idx}>{s.suggestion || s}</li>
              ))}
            </ul>
          </div>
        )}
        {/* AI Performance Section */}
        {aiPerformance && aiPerformance.stats && (
          <div className="bg-blue-50 rounded-xl shadow-sm border border-blue-100 p-6 mb-6">
            <h3 className="text-lg font-bold text-blue-800 mb-2">Hiệu suất cá nhân (AI)</h3>
            <div className="mb-2">Tổng task: {aiPerformance.stats.totalTasks} | Hoàn thành: {aiPerformance.stats.completedTasks} | Quá hạn: {aiPerformance.stats.overdueTasks} | Tỉ lệ hoàn thành: {aiPerformance.stats.completionRate}%</div>
            {aiPerformance.suggestions && aiPerformance.suggestions.length > 0 && (
              <ul className="list-disc pl-6 text-blue-900">
                {aiPerformance.suggestions.map((s: any, idx: number) => (
                  <li key={idx}>{s.suggestion || s.insight || s}</li>
                ))}
              </ul>
            )}
          </div>
        )}
        
        {/* Chat Box Button - Fixed at bottom right */}
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setShowChatBox(!showChatBox)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-lg flex items-center justify-center transition-all duration-300"
            aria-label={showChatBox ? "Đóng hộp chat" : "Mở hộp chat"}
          >
            {showChatBox ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            )}
          </button>
        </div>

        {/* Chat Box */}
        {showChatBox && (
          <div className="fixed bottom-20 right-6 w-80 md:w-96 bg-white rounded-lg shadow-xl z-50 flex flex-col" style={{ height: '500px', maxHeight: '70vh' }}>
            {/* Chat Header */}
            <div className="bg-indigo-600 text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
              <div className="flex items-center">
                <div className="bg-white rounded-full p-1 mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium">Trợ lý TaskBuddy</h3>
                  <p className="text-xs text-indigo-200">Trực tuyến</p>
                </div>
              </div>
              <button 
                onClick={() => setShowChatBox(false)}
                className="text-white hover:text-indigo-200"
                aria-label="Đóng hộp chat"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {messages.map((message, index) => (
                <div key={index} className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      message.sender === 'user' 
                        ? 'bg-indigo-600 text-white rounded-br-none' 
                        : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start mb-4">
                  <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 rounded-bl-none">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4 bg-white rounded-b-lg">
              {/* Quick Help Buttons */}
              <div className="mb-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setNewMessage('hướng dẫn sử dụng');
                    setTimeout(() => handleSendMessage(new Event('submit') as any), 100);
                  }}
                  className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 text-xs py-1 px-2 rounded-full"
                >
                  Hướng dẫn sử dụng
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewMessage('tạo nhiệm vụ');
                    setTimeout(() => handleSendMessage(new Event('submit') as any), 100);
                  }}
                  className="bg-green-100 hover:bg-green-200 text-green-700 text-xs py-1 px-2 rounded-full"
                >
                  Tạo nhiệm vụ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewMessage('quản lý nhiệm vụ');
                    setTimeout(() => handleSendMessage(new Event('submit') as any), 100);
                  }}
                  className="bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs py-1 px-2 rounded-full"
                >
                  Quản lý nhiệm vụ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewMessage('thống kê');
                    setTimeout(() => handleSendMessage(new Event('submit') as any), 100);
                  }}
                  className="bg-amber-100 hover:bg-amber-200 text-amber-700 text-xs py-1 px-2 rounded-full"
                >
                  Thống kê
                </button>
              </div>
              <div className="flex items-center">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-r-lg"
                  aria-label="Gửi tin nhắn"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L13.586 11H3a1 1 0 110-2h10.586l-3.293-3.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home; 