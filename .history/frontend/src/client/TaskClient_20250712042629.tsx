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
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: 'personal',
    priority: 'medium',
    dueDate: new Date().toISOString().split('T')[0],
    estimatedHours: 1
  });
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.priority) queryParams.append('priority', filters.priority);
      if (filters.keyword) queryParams.append('keyword', filters.keyword);

      const response = await api.get(`/api/tasks?${queryParams.toString()}`);
      if (response.data.success) {
        setTasks(response.data.data);
      } else {
        setError('Failed to fetch tasks');
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/tasks', newTask);
      if (response.data.success) {
        setTasks([...tasks, response.data.data]);
        setShowNewTaskForm(false);
        setNewTask({
          title: '',
          description: '',
          category: 'personal',
          priority: 'medium',
          dueDate: new Date().toISOString().split('T')[0],
          estimatedHours: 1
        });
      }
    } catch (err) {
      console.error('Error creating task:', err);
      setError('Failed to create task');
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const response = await api.patch(`/api/tasks/${taskId}/status`, {
        status: newStatus
      });
      if (response.data.success) {
        setTasks(tasks.map(task => 
          task._id === taskId ? { ...task, status: newStatus } : task
        ));
      }
    } catch (err) {
      console.error('Error updating task status:', err);
      setError('Failed to update task status');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      const response = await api.delete(`/api/tasks/${taskId}`);
      if (response.data.success) {
        setTasks(tasks.filter(task => task._id !== taskId));
      }
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Failed to delete task');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not_started': return 'bg-gray-200';
      case 'in_progress': return 'bg-blue-200';
      case 'completed': return 'bg-green-200';
      default: return 'bg-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">TaskBuddy - Manage Your Tasks</h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
          <button 
            className="text-red-700 font-bold"
            onClick={() => setError(null)}
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <div>
            <label htmlFor="status-filter" className="sr-only">Filter by status</label>
            <select
              id="status-filter"
              className="border rounded p-2"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              aria-label="Filter tasks by status"
            >
              <option value="">All Statuses</option>
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label htmlFor="category-filter" className="sr-only">Filter by category</label>
            <select
              id="category-filter"
              className="border rounded p-2"
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
              aria-label="Filter tasks by category"
            >
              <option value="">All Categories</option>
              <option value="personal">Personal</option>
              <option value="work">Work</option>
              <option value="study">Study</option>
            </select>
          </div>

          <div>
            <label htmlFor="priority-filter" className="sr-only">Filter by priority</label>
            <select
              id="priority-filter"
              className="border rounded p-2"
              value={filters.priority}
              onChange={(e) => setFilters({...filters, priority: e.target.value})}
              aria-label="Filter tasks by priority"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div>
            <label htmlFor="keyword-filter" className="sr-only">Search tasks</label>
            <input
              id="keyword-filter"
              type="text"
              placeholder="Search tasks..."
              className="border rounded p-2"
              value={filters.keyword}
              onChange={(e) => setFilters({...filters, keyword: e.target.value})}
              aria-label="Search tasks by keyword"
            />
          </div>
        </div>

        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={() => setShowNewTaskForm(!showNewTaskForm)}
        >
          {showNewTaskForm ? 'Cancel' : 'New Task'}
        </button>
      </div>

      {showNewTaskForm && (
        <div className="bg-gray-100 p-4 mb-6 rounded">
          <h2 className="text-xl font-semibold mb-4">Create New Task</h2>
          <form onSubmit={handleCreateTask}>
            <div className="mb-4">
              <label htmlFor="task-title" className="block text-gray-700 text-sm font-bold mb-2">
                Title:
              </label>
              <input
                id="task-title"
                type="text"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight"
                value={newTask.title}
                onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                required
                aria-label="Task title"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="task-description" className="block text-gray-700 text-sm font-bold mb-2">
                Description:
              </label>
              <textarea
                id="task-description"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight"
                value={newTask.description}
                onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                aria-label="Task description"
              />
            </div>
            <div className="mb-4 flex flex-wrap gap-4">
              <div>
                <label htmlFor="task-category" className="block text-gray-700 text-sm font-bold mb-2">
                  Category:
                </label>
                <select
                  id="task-category"
                  className="shadow border rounded py-2 px-3 text-gray-700 leading-tight"
                  value={newTask.category}
                  onChange={(e) => setNewTask({...newTask, category: e.target.value})}
                  aria-label="Task category"
                >
                  <option value="personal">Personal</option>
                  <option value="work">Work</option>
                  <option value="study">Study</option>
                </select>
              </div>
              <div>
                <label htmlFor="task-priority" className="block text-gray-700 text-sm font-bold mb-2">
                  Priority:
                </label>
                <select
                  id="task-priority"
                  className="shadow border rounded py-2 px-3 text-gray-700 leading-tight"
                  value={newTask.priority}
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                  aria-label="Task priority"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label htmlFor="task-due-date" className="block text-gray-700 text-sm font-bold mb-2">
                  Due Date:
                </label>
                <input
                  id="task-due-date"
                  type="date"
                  className="shadow border rounded py-2 px-3 text-gray-700 leading-tight"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                  required
                  aria-label="Task due date"
                />
              </div>
              <div>
                <label htmlFor="task-hours" className="block text-gray-700 text-sm font-bold mb-2">
                  Est. Hours:
                </label>
                <input
                  id="task-hours"
                  type="number"
                  className="shadow border rounded py-2 px-3 text-gray-700 leading-tight"
                  value={newTask.estimatedHours}
                  onChange={(e) => setNewTask({...newTask, estimatedHours: Number(e.target.value)})}
                  min="0"
                  max="24"
                  required
                  aria-label="Estimated hours"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                Create Task
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10">
          <p className="text-gray-500">Loading tasks...</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">No tasks found. Create a new task to get started!</p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <div 
              key={task._id} 
              className={`border rounded-lg p-4 shadow hover:shadow-md ${
                new Date(task.dueDate) < new Date() && task.status !== 'completed' 
                  ? 'border-red-300'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold mb-2">{task.title}</h3>
                <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(task.priority)}`}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </span>
              </div>
              
              {task.description && (
                <p className="text-gray-600 mb-3 text-sm">{task.description}</p>
              )}
              
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                  {task.category}
                </span>
                <span className={`text-xs px-2 py-1 rounded ${getStatusColor(task.status)}`}>
                  {task.status === 'not_started' 
                    ? 'Not Started' 
                    : task.status === 'in_progress' 
                      ? 'In Progress' 
                      : 'Completed'}
                </span>
              </div>
              
              <div className="text-sm mb-4">
                <p><span className="font-medium">Due:</span> {formatDate(task.dueDate)}</p>
                <p><span className="font-medium">Est. Hours:</span> {task.estimatedHours}</p>
              </div>
              
              <div className="flex justify-between mt-3">
                <div className="flex gap-2">
                  <label htmlFor={`task-status-${task._id}`} className="sr-only">Update task status</label>
                  <select 
                    id={`task-status-${task._id}`}
                    className="text-sm border rounded px-2 py-1"
                    value={task.status}
                    onChange={(e) => handleUpdateTaskStatus(task._id, e.target.value)}
                    aria-label="Update task status"
                  >
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <button
                  onClick={() => handleDeleteTask(task._id)}
                  className="bg-red-100 hover:bg-red-200 text-red-800 font-bold py-1 px-2 rounded text-sm"
                  aria-label={`Delete task: ${task.title}`}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskClient; 