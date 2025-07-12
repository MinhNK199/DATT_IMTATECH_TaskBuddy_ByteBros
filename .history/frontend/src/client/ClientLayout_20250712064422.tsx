import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import api from '../services/api';

const ClientLayout: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const location = useLocation();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await api.get('/api/auth/check');
        if (response.data.success) {
          setUser(response.data.data.user);
        }
      } catch (error) {
        console.error('Failed to fetch user profile', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/api/auth/logout');
      localStorage.removeItem('token');
      window.location.href = '/login';
    } catch (error) {
      console.error('Failed to logout', error);
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-indigo-700' : '';
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header with gradient */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <Link to="/" className="text-2xl font-bold tracking-tight">TaskBuddy</Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            {!loading && user && (
              <>
                <div className="flex items-center space-x-2 bg-white/20 rounded-full py-1 px-3">
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName} 
                      className="h-8 w-8 rounded-full border-2 border-white"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-indigo-800 flex items-center justify-center text-white text-sm font-medium border-2 border-white">
                      {user.displayName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className="font-medium">Hi, {user.displayName?.split(' ')[0]}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-4 rounded-full transition-all duration-200"
                >
                  Logout
                </button>
              </>
            )}
            {!loading && !user && (
              <>
                <Link to="/login" className="text-white hover:text-indigo-100 transition-colors">Login</Link>
                <Link to="/register" className="bg-white text-indigo-700 hover:bg-indigo-100 font-medium py-2 px-4 rounded-full transition-colors">
                  Register
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <button
            className="md:hidden text-white bg-white/20 p-2 rounded-lg"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
        
        {/* Mobile menu with animation */}
        {menuOpen && (
          <div className="md:hidden bg-indigo-700 overflow-hidden transition-all duration-200 ease-in-out">
            <nav className="flex flex-col px-4 py-2 space-y-2 animate-fadeIn">
              {!loading && user && (
                <>
                  <div className="flex items-center space-x-2 py-2">
                    {user.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt={user.displayName} 
                        className="h-8 w-8 rounded-full border-2 border-white"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-indigo-800 flex items-center justify-center text-white text-sm font-medium border-2 border-white">
                        {user.displayName?.charAt(0).toUpperCase() || 'U'}
                      </div>
                    )}
                    <span className="text-white font-medium">Hi, {user.displayName?.split(' ')[0]}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-left py-2 text-white hover:bg-indigo-600 rounded px-2 transition-colors"
                  >
                    Logout
                  </button>
                </>
              )}
              {!loading && !user && (
                <>
                  <Link to="/login" className="py-2 text-white hover:bg-indigo-600 rounded px-2 transition-colors">Login</Link>
                  <Link to="/register" className="py-2 text-white hover:bg-indigo-600 rounded px-2 transition-colors">Register</Link>
                </>
              )}
            </nav>
          </div>
        )}
        
        {/* Navigation tabs with active indicator */}
        {user && (
          <div className="bg-indigo-800 shadow-inner">
            <nav className="container mx-auto px-4 overflow-x-auto">
              <ul className="flex">
                <li className="relative">
                  <Link
                    to="/"
                    className={`inline-block py-3 px-4 text-white hover:text-indigo-100 font-medium ${isActive('/')}`}
                  >
                    Home
                    {location.pathname === '/' && <span className="absolute bottom-0 left-0 w-full h-1 bg-white rounded-t-md"></span>}
                  </Link>
                </li>
                <li className="relative">
                  <Link
                    to="/tasks"
                    className={`inline-block py-3 px-4 text-white hover:text-indigo-100 font-medium ${isActive('/tasks')}`}
                  >
                    Tasks
                    {location.pathname === '/tasks' && <span className="absolute bottom-0 left-0 w-full h-1 bg-white rounded-t-md"></span>}
                  </Link>
                </li>
                <li className="relative">
                  <Link
                    to="/reports"
                    className={`inline-block py-3 px-4 text-white hover:text-indigo-100 font-medium ${isActive('/reports')}`}
                  >
                    Reports
                    {location.pathname === '/reports' && <span className="absolute bottom-0 left-0 w-full h-1 bg-white rounded-t-md"></span>}
                  </Link>
                </li>
                <li className="relative">
                  <Link
                    to="/profile"
                    className={`inline-block py-3 px-4 text-white hover:text-indigo-100 font-medium ${isActive('/profile')}`}
                  >
                    Profile
                    {location.pathname === '/profile' && <span className="absolute bottom-0 left-0 w-full h-1 bg-white rounded-t-md"></span>}
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </header>

      {/* Main content with a subtle shadow */}
      <main className="flex-grow container mx-auto px-4 py-6 md:py-8 lg:py-10">
        <div className="bg-white shadow-sm rounded-lg p-1">
          <Outlet />
        </div>
      </main>

      {/* Footer with gradient */}
      <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-2">TaskBuddy</h3>
              <p className="text-gray-300 text-sm">Your personal task management solution</p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2">Quick Links</h3>
              <ul className="space-y-1 text-sm">
                <li><Link to="/" className="text-gray-300 hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/tasks" className="text-gray-300 hover:text-white transition-colors">Tasks</Link></li>
                <li><Link to="/profile" className="text-gray-300 hover:text-white transition-colors">Profile</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-2">Contact</h3>
              <p className="text-gray-300 text-sm">support@taskbuddy.com</p>
            </div>
          </div>
          <div className="mt-8 pt-4 border-t border-gray-700 text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} TaskBuddy. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Add additional styles for animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ClientLayout; 