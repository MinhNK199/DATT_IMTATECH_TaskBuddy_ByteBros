export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
  total: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: PaginationParams;
}

export interface Task {
  _id: string;
  userId: string;
  title: string;
  description?: string;
  category: 'personal' | 'work' | 'study';
  priority: 'low' | 'medium' | 'high';
  status: 'not_started' | 'in_progress' | 'completed';
  dueDate: string;
  completedAt?: string;
  estimatedHours: number;
  actualHours?: number;
  tags?: string[];
  attachments?: { name: string; url: string; type: string }[];
  notes?: string;
  aiSuggestions?: { suggestion: string; type: string; createdAt: string }[];
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface TaskFilters {
  status?: string;
  category?: string;
  priority?: string;
  keyword?: string;
  startDate?: string;
  endDate?: string;
} 