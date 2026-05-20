import { useState } from 'react';
import { uploadExcel } from '../api';

export default function DataUpload({ token, onUnauthorized }: { token: string; onUnauthorized: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleUpload = async () => {
    if (!file || uploading) return;
    setUploading(true);
    setMessage('');
    setError('');
    try {
      const res = await uploadExcel(file, token);
      setMessage(`${res.message}（应用：${res.apps}，月度统计：${res.monthly_stats}）`);
    } catch (e: any) {
      const detail = e?.response?.data?.detail;
      const status = e?.response?.status;
      if (status === 401) {
        onUnauthorized();
      }
      setError(detail || '上传失败');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full max-w-[900px] mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="text-lg font-bold text-gray-800 text-center mb-4">上传 Excel 并刷新数据库</div>

        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <label className="flex-1 cursor-pointer">
            <div className="w-full border-2 border-dashed border-teal-300 hover:border-teal-400 bg-teal-50/50 rounded-xl px-4 py-4 transition-colors">
              <div className="text-sm font-medium text-teal-800">选择上传文件（.xlsx）</div>
              <div className="mt-1 text-xs text-gray-500">
                {file ? `已选择：${file.name}` : '点击此区域选择文件'}
              </div>
            </div>
            <input
              type="file"
              accept=".xlsx"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
            />
          </label>
          <button
            onClick={handleUpload}
            disabled={!file || uploading || !token}
            className="px-6 py-2 rounded-lg bg-teal-500 hover:bg-teal-600 disabled:opacity-50 disabled:hover:bg-teal-500 text-white text-sm font-medium"
          >
            {uploading ? '上传中...' : '上传并刷新数据库'}
          </button>
        </div>

        {message && <div className="mt-4 text-sm text-teal-700 bg-teal-50 border border-teal-100 rounded-lg p-3">{message}</div>}
        {error && <div className="mt-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">{error}</div>}
      </div>
    </div>
  );
}
