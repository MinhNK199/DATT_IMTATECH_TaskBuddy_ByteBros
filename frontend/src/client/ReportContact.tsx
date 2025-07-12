import React, { useState } from 'react';
import api from '../services/api';

const ReportContact: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    if (!title || !content) {
      setError('Vui lòng nhập đầy đủ tiêu đề và nội dung!');
      setLoading(false);
      return;
    }
    try {
      const today = new Date();
      const payload = {
        type: 'custom',
        startDate: today.toISOString(),
        endDate: today.toISOString(),
        title,
        description: content
      };
      await api.post('/reports', payload);
      setSuccessMessage('Cảm ơn bạn đã gửi phản hồi!');
      setTitle('');
      setContent('');
    } catch (err) {
      setError('Gửi báo cáo thất bại. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white shadow-md rounded-lg p-8 mt-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Gửi liên hệ / phản hồi</h2>
      {successMessage && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4" role="alert">
          <p>{successMessage}</p>
        </div>
      )}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            placeholder="Nhập tiêu đề báo cáo"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung</label>
          <textarea
            className="w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={5}
            required
            placeholder="Nhập nội dung liên hệ hoặc phản hồi"
          />
        </div>
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          disabled={loading}
        >
          {loading ? 'Đang gửi...' : 'Gửi báo cáo'}
        </button>
      </form>
    </div>
  );
};

export default ReportContact; 