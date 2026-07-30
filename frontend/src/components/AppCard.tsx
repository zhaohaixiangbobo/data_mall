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
  const features = app.features ? app.features.split(',') : [];
  
  return (
    <a 
      href={app.link || '#'} 
      target={app.link ? "_blank" : "_self"}
      rel="noopener noreferrer"
      className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col h-full block cursor-pointer group relative"
    >
      <div className="h-32 bg-gray-200 overflow-hidden rounded-t-xl relative">
        <img 
          src={app.img_url} 
          alt={app.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-medium text-gray-700 shadow-sm">
          {app.domain}
        </div>
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-gray-800 truncate" title={app.name}>
            {app.name}
          </h3>
        </div>
        
        {features.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {features.map(f => (
              <span key={f} className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-500 rounded-sm">
                {f}
              </span>
            ))}
          </div>
        )}
        
        <div className="relative group/desc flex-1 mb-4">
          <p className="text-gray-500 text-sm line-clamp-2">
            {app.description}
          </p>
          {/* 自定义 Tooltip */}
          <div className="invisible opacity-0 group-hover/desc:visible group-hover/desc:opacity-100 transition-all duration-200 absolute z-[100] left-1/2 -translate-x-1/2 bottom-full mb-2 w-[110%] bg-gray-800/95 backdrop-blur-sm text-white text-xs p-3 rounded-lg shadow-xl pointer-events-none">
            {app.description}
            {/* 小箭头 */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-800/95"></div>
          </div>
        </div>
        
        <div className="mt-auto border-t border-gray-50 pt-3">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mr-1.5"></span>
              {app.unit}
            </span>
            <span>访问量: {app.visits}</span>
          </div>
        </div>
      </div>
    </a>
  );
};

export default AppCard;
