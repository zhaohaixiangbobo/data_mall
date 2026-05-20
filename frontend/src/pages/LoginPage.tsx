import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      const res = await login(username, password);
      window.localStorage.setItem('upload_token', res.access_token);
      navigate('/upload', { replace: true });
    } catch (e: any) {
      const detail = e?.response?.data?.detail;
      setError(detail || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eaf4fc] flex flex-col font-sans text-gray-900">
      <header className="relative w-full h-36 bg-gradient-to-r from-blue-300 via-cyan-200 to-blue-200 overflow-hidden shadow-sm">
        <div className="w-[98%] xl:w-[95%] max-w-[1800px] mx-auto h-full relative flex items-center justify-center">
          <h1 className="text-3xl md:text-4xl font-bold tracking-widest text-white drop-shadow-md">
            数据上传登录
          </h1>
        </div>
      </header>

      <main className="flex-1 w-[98%] xl:w-[95%] max-w-[1800px] mx-auto py-8">
        <div className="w-full max-w-[520px] mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="grid grid-cols-1 gap-3">
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="用户名"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="密码"
              type="password"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmit();
              }}
            />
            <button
              onClick={handleSubmit}
              disabled={loading || !username || !password}
              className="w-full px-6 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 disabled:opacity-50 disabled:hover:bg-teal-500 text-white text-sm font-medium"
            >
              {loading ? '登录中...' : '登录'}
            </button>
          </div>

          {error && <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">{error}</div>}

          <div className="mt-6 flex justify-center">
            <button
              onClick={() => navigate('/', { replace: true })}
              className="text-sm text-gray-500 hover:text-teal-600"
            >
              返回首页
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
