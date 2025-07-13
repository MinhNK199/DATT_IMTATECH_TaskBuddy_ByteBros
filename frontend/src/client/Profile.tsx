import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    displayName: '',
    theme: 'light',
    notifications: true,
    aiSuggestions: true
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Load user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      try {
        const response = await api.get('/users/profile');
        if (response.data.success) {
          setProfile(response.data.data);
          setFormData({
            displayName: response.data.data.displayName || '',
            theme: response.data.data.preferences?.theme || 'light',
            notifications: response.data.data.preferences?.notifications ?? true,
            aiSuggestions: response.data.data.preferences?.aiSuggestions ?? true
          });
        } else {
          setError(response.data.message || 'Không thể tải hồ sơ');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Đã xảy ra lỗi khi tải hồ sơ');
        console.error('Profile loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setError(null);
    
    try {
      const response = await api.put('/users/profile', {
        displayName: formData.displayName,
        preferences: {
          theme: formData.theme,
          notifications: formData.notifications,
          aiSuggestions: formData.aiSuggestions
        }
      });
      
      if (response.data.success) {
        setProfile(response.data.data);
        setSuccessMessage('Cập nhật hồ sơ thành công');
        setIsEditing(false);
      } else {
        setError(response.data.message || 'Không thể cập nhật hồ sơ');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đã xảy ra lỗi khi cập nhật hồ sơ');
      console.error('Profile update error:', err);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-10">
          <p className="text-gray-500">Đang tải hồ sơ...</p>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Hồ sơ của bạn</h1>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
            <p>{error}</p>
          </div>
        )}
        
        {successMessage && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">
            <p>{successMessage}</p>
          </div>
        )}
        
        {!isEditing ? (
          <div className="bg-white shadow-md rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                {profile.photoURL ? (
                  <img 
                    src={profile.photoURL} 
                    alt={profile.displayName} 
                    className="h-16 w-16 rounded-full mr-4"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold mr-4">
                    {profile.displayName?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-semibold">{profile.displayName}</h2>
                  <p className="text-gray-600">{profile.email}</p>
                </div>
              </div>
              <button 
                onClick={() => setIsEditing(true)}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Chỉnh sửa hồ sơ
              </button>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-lg font-medium mb-3">Thông tin tài khoản</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Loại tài khoản</p>
                  <p>{profile.provider === 'google' ? 'Google' : 'Email'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Thành viên từ</p>
                  <p>{new Date(profile.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4 mt-4">
              <h3 className="text-lg font-medium mb-3">Tùy chọn</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Giao diện</p>
                  <p>{profile.preferences?.theme === 'dark' ? 'Chế độ tối' : 'Chế độ sáng'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Thông báo</p>
                  <p>{profile.preferences?.notifications ? 'Đã bật' : 'Đã tắt'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gợi ý từ AI</p>
                  <p>{profile.preferences?.aiSuggestions ? 'Đã bật' : 'Đã tắt'}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Chỉnh sửa hồ sơ</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="displayName" className="block text-gray-700 text-sm font-bold mb-2">
                  Tên hiển thị
                </label>
                <input
                  id="displayName"
                  name="displayName"
                  type="text"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={formData.displayName}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="theme" className="block text-gray-700 text-sm font-bold mb-2">
                  Giao diện
                </label>
                <select
                  id="theme"
                  name="theme"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={formData.theme}
                  onChange={handleChange}
                >
                  <option value="light">Chế độ sáng</option>
                  <option value="dark">Chế độ tối</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="notifications"
                    checked={formData.notifications}
                    onChange={handleChange}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">Bật thông báo</span>
                </label>
              </div>
              
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="aiSuggestions"
                    checked={formData.aiSuggestions}
                    onChange={handleChange}
                    className="form-checkbox h-5 w-5 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">Bật gợi ý từ AI</span>
                </label>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile; 