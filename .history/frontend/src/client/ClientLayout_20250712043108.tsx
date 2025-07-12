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
    return location.pathname === path ? 'bg-blue-700' : '';
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold">TaskBuddy</Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            {!loading && user && (
              <>
                <span>Hello, {user.displayName}</span>
                <button
                  onClick={handleLogout}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded"
                >
                  Logout
                </button>
              </>
            )}
            {!loading && !user && (
              <>
                <Link to="/login" className="hover:text-blue-200">Login</Link>
                <Link to="/register" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded">
                  Register
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile menu button */}
          <button
            className="md:hidden text-white"
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
        
        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-blue-500 pb-2">
            <nav className="flex flex-col px-4">
              {!loading && user && (
                <>
                  <span className="py-2 text-white">Hello, {user.displayName}</span>
                  <button
                    onClick={handleLogout}
                    className="text-left py-2 text-white hover:text-blue-200"
                  >
                    Logout
                  </button>
                </>
              )}
              {!loading && !user && (
                <>
                  <Link to="/login" className="py-2 text-white hover:text-blue-200">Login</Link>
                  <Link to="/register" className="py-2 text-white hover:text-blue-200">Register</Link>
                </>
              )}
            </nav>
          </div>
        )}
        
        {/* Navigation tabs */}
        {user && (
          <div className="bg-blue-500 shadow-inner">
            <nav className="container mx-auto px-4">
              <ul className="flex overflow-x-auto">
                <li>
                  <Link
                    to="/"
                    className={`inline-block py-2 px-4 text-white hover:bg-blue-700 ${isActive('/')}`}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/tasks"
                    className={`inline-block py-2 px-4 text-white hover:bg-blue-700 ${isActive('/tasks')}`}
                  >
                    Tasks
                  </Link>
                </li>
                <li>
                  <Link
                    to="/reports"
                    className={`inline-block py-2 px-4 text-white hover:bg-blue-700 ${isActive('/reports')}`}
                  >
                    Reports
                  </Link>
                </li>
                <li>
                  <Link
                    to="/profile"
                    className={`inline-block py-2 px-4 text-white hover:bg-blue-700 ${isActive('/profile')}`}
                  >
                    Profile
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-grow bg-gray-50">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} TaskBuddy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default ClientLayout; 