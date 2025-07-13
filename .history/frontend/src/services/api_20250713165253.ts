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
    
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.error('Lỗi xác thực:', error.response.data);
      
      // Nếu token không hợp lệ hoặc hết hạn
      if (error.response.data?.message?.includes('invalid') || 
          error.response.data?.message?.includes('expired') || 
          error.response.data?.message?.includes('unauthorized') ||
          error.response.data?.message?.includes('không hợp lệ') ||
          error.response.data?.message?.includes('hết hạn')) {
        console.log('Xóa token không hợp lệ và chuyển hướng về trang đăng nhập');
        localStorage.removeItem('token');
        // Chỉ redirect nếu không phải đang ở trang đăng nhập/đăng ký
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
          window.location.href = '/login';
        }
      }
    }
    
    // Xử lý lỗi Firebase
    if (error.code && error.code.startsWith('auth/')) {
      console.error('Firebase Auth Error:', error.code);
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

// Các hàm xử lý lỗi Firebase
export const getFirebaseErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email hoặc mật khẩu không chính xác';
    case 'auth/invalid-email':
      return 'Email không đúng định dạng';
    case 'auth/user-disabled':
      return 'Tài khoản đã bị vô hiệu hóa';
    case 'auth/too-many-requests':
      return 'Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau';
    case 'auth/network-request-failed':
      return 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối và thử lại';
    case 'auth/email-already-in-use':
      return 'Email này đã được đăng ký. Vui lòng sử dụng email khác hoặc đăng nhập';
    case 'auth/weak-password':
      return 'Mật khẩu không đủ mạnh. Vui lòng sử dụng ít nhất 6 ký tự';
    default:
      return 'Đã xảy ra lỗi trong quá trình xác thực. Vui lòng thử lại';
  }
};

export default api; 