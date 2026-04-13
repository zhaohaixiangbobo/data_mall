import React from 'react';
import { AppData } from '../types';

interface AppCardProps {
  app: AppData;
}

/**
 * 应用卡片组件，展示应用名称、描述、图片、单位和领域等基本信息
 * @param app - 应用数据对象
 */
const AppCard: React.FC<AppCardProps> = ({ app }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-40 bg-blue-50 flex items-center justify-center overflow-hidden">
        {app.img_url ? (
          <img src={app.img_url} alt={app.name} className="w-full h-full object-cover" />
        ) : (
          <div className="text-blue-300 text-4xl font-bold">{app.name.charAt(0)}</div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg mb-1 truncate">{app.name}</h3>
        <p className="text-gray-500 text-sm line-clamp-2 h-10 mb-3">{app.description}</p>
        <div className="flex flex-wrap gap-2 mt-auto">
          <span className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-full border border-blue-100">
            {app.unit}
          </span>
          <span className="bg-green-50 text-green-600 text-xs px-2 py-1 rounded-full border border-green-100">
            {app.domain}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AppCard;
