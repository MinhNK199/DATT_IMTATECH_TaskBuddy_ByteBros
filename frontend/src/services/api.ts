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
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // TẠM THỜI không xóa token và không redirect để debug
      // localStorage.removeItem('token');
      // window.location.href = '/login';
      console.error('401 Unauthorized:', error);
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