import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const Home: React.FC = () => {
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0
  });
  const [recentTasks, setRecentTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Get task stats
        const statsResponse = await api.get('/api/tasks/stats');
        if (statsResponse.data.success) {
          setStats(statsResponse.data.data);
        }

        // Get recent tasks
        const tasksResponse = await api.get('/api/tasks?limit=5&sortBy=createdAt&sortOrder=desc');
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Welcome to TaskBuddy</h1>

      {loading ? (
        <div className="text-center py-10">
          <p className="text-gray-500">Loading dashboard data...</p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
              <h3 className="text-gray-500 text-sm font-medium">Total Tasks</h3>
              <p className="text-3xl font-bold">{stats.totalTasks}</p>
              <Link to="/tasks" className="text-blue-500 hover:underline text-sm">View all tasks</Link>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
              <h3 className="text-gray-500 text-sm font-medium">Completed Tasks</h3>
              <p className="text-3xl font-bold">{stats.completedTasks}</p>
              <Link to="/tasks?status=completed" className="text-blue-500 hover:underline text-sm">View completed</Link>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
              <h3 className="text-gray-500 text-sm font-medium">Overdue Tasks</h3>
              <p className="text-3xl font-bold">{stats.overdueTasks}</p>
              <Link to="/tasks?overdue=true" className="text-blue-500 hover:underline text-sm">View overdue</Link>
            </div>
          </div>

          {/* Recent Tasks */}
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="border-b px-6 py-4">
              <h2 className="text-xl font-semibold">Recent Tasks</h2>
            </div>
            
            {recentTasks.length > 0 ? (
              <div className="divide-y">
                {recentTasks.map((task) => (
                  <div key={task._id} className="px-6 py-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-medium">{task.title}</h3>
                      <p className="text-sm text-gray-500">Due: {formatDate(task.dueDate)}</p>
                    </div>
                    <div className="flex items-center">
                      <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(task.status)}`}>
                        {task.status === 'not_started' ? 'Not Started' : 
                         task.status === 'in_progress' ? 'In Progress' : 'Completed'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-8 text-center">
                <p className="text-gray-500">No tasks found. Get started by creating a new task.</p>
                <Link 
                  to="/tasks" 
                  className="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Create Task
                </Link>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow">
            <div className="border-b px-6 py-4">
              <h2 className="text-xl font-semibold">Quick Actions</h2>
            </div>
            <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link 
                to="/tasks" 
                className="bg-blue-50 hover:bg-blue-100 p-4 rounded text-center"
              >
                <h3 className="font-medium text-blue-700">Create New Task</h3>
                <p className="text-sm text-gray-500">Add a new task to your list</p>
              </Link>
              
              <Link 
                to="/profile" 
                className="bg-purple-50 hover:bg-purple-100 p-4 rounded text-center"
              >
                <h3 className="font-medium text-purple-700">Update Profile</h3>
                <p className="text-sm text-gray-500">Edit your account settings</p>
              </Link>
              
              <Link 
                to="/tasks?status=in_progress" 
                className="bg-amber-50 hover:bg-amber-100 p-4 rounded text-center"
              >
                <h3 className="font-medium text-amber-700">View In Progress</h3>
                <p className="text-sm text-gray-500">Check your ongoing tasks</p>
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Home; 