import axios from 'axios';

const api = axios.create({
  baseURL: (process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('Gửi request với token:', token.substring(0, 20) + '...');
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('Gửi request không có token');
    }
    return config;
  },
  (error) => {
    console.error('Lỗi trong request interceptor:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data);
    
    if (error.response?.status === 401) {
      console.error('Lỗi xác thực 401:', error.response.data);
      
      // Nếu token không hợp lệ hoặc hết hạn
      if (error.response.data?.message?.includes('invalid') || 
          error.response.data?.message?.includes('expired') || 
          error.response.data?.message?.includes('unauthorized')) {
        console.log('Xóa token không hợp lệ và chuyển hướng về trang đăng nhập');
        localStorage.removeItem('token');
        // Chỉ redirect nếu không phải đang ở trang đăng nhập/đăng ký
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// AI APIs
export const getAISuggestions = () => api.get('/ai/suggest-tasks');
export const getAIPerformance = () => api.get('/ai/performance');
export const getAIReminders = () => api.get('/ai/reminders');
export const getAISummary = (type = 'day') => api.get(`/ai/summary?type=${type}`);
export const analyzeTask = (task: { title: string; description?: string; dueDate?: string }) => api.post('/ai/analyze-task', task);
export const getAIAggregateAdmin = () => api.get('/admin/ai/aggregate');

export default api; 