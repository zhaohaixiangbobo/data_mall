import React from 'react';
import { AppData } from '../types';

interface RankingListProps {
  apps: AppData[];
}

/**
 * 排名列表组件，显示访问量最高的前15个应用
 * @param apps - 排序后的应用列表
 */
const RankingList: React.FC<RankingListProps> = ({ apps }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full">
      <h2 className="text-xl font-bold mb-6 flex items-center text-gray-800">
        <span className="bg-orange-100 text-orange-600 p-1.5 rounded-lg mr-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </span>
        应用访问排行榜 (Top 15)
      </h2>
      <ul className="space-y-4">
        {apps.map((app, index) => (
          <li key={app.id} className="flex items-center justify-between group">
            <div className="flex items-center space-x-3 overflow-hidden">
              <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                index < 3 ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {index + 1}
              </span>
              <span className="font-medium text-gray-700 truncate group-hover:text-blue-600 transition-colors">
                {app.name}
              </span>
            </div>
            <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full whitespace-nowrap ml-2">
              {app.visits.toLocaleString()} 次
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RankingList;
