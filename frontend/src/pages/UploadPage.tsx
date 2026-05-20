import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import DataUpload from '../components/DataUpload';

export default function UploadPage() {
  const navigate = useNavigate();
  const [token, setToken] = useState<string>(() => window.localStorage.getItem('upload_token') || '');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    window.localStorage.removeItem('upload_token');
    setToken('');
    navigate('/login', { replace: true });
  };

  const handleUnauthorized = () => {
    window.localStorage.removeItem('upload_token');
    setToken('');
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#eaf4fc] flex flex-col font-sans text-gray-900">
      <header className="relative w-full h-36 bg-gradient-to-r from-blue-300 via-cyan-200 to-blue-200 overflow-hidden shadow-sm">
        <div className="w-[98%] xl:w-[95%] max-w-[1800px] mx-auto h-full relative flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-bold tracking-widest text-white drop-shadow-md">
            数据上传
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/', { replace: true })}
              className="px-4 py-2 rounded-full text-sm font-medium border border-white/40 bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm transition-colors"
            >
              返回首页
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-full text-sm font-medium border border-white/40 bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm transition-colors"
            >
              退出
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-[98%] xl:w-[95%] max-w-[1800px] mx-auto py-8">
        <DataUpload token={token} onUnauthorized={handleUnauthorized} />
      </main>
    </div>
  );
}
