import React from 'react';
import { AppData } from '../types';
import { Trophy, Flame, TrendingUp } from 'lucide-react';

interface RankingListProps {
  apps: AppData[];
  currentTab: 'comprehensive' | 'visits';
  onTabChange: (tab: 'comprehensive' | 'visits') => void;
}

/**
 * 排名列表组件，显示访问量最高的前10个应用
 * @param apps - 排序后的应用列表
 */
const RankingList: React.FC<RankingListProps> = ({ apps, currentTab, onTabChange }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
      <div className="bg-gradient-to-r from-blue-300 via-cyan-200 to-blue-200 p-3 text-white">
        <div className="flex justify-center items-center mb-3 relative">
          <h2 className="text-lg font-bold flex items-center tracking-wider text-teal-900 drop-shadow-sm">
            <Trophy className="mr-2 w-5 h-5" /> 排行榜
          </h2>
        </div>
        
        {/* 更明显的 Tab 切换 */}
        <div className="flex bg-white/30 p-1 rounded-lg">
          <button
            onClick={() => onTabChange('comprehensive')}
            className={`flex-1 flex justify-center items-center py-1 text-sm font-medium rounded-md transition-all duration-300 ${
              currentTab === 'comprehensive' 
                ? 'bg-white text-teal-800 shadow-md transform scale-[1.02]' 
                : 'text-teal-900 hover:bg-white/40'
            }`}
          >
            <Flame className="w-4 h-4 mr-1" /> 综合榜
          </button>
          <button
            onClick={() => onTabChange('visits')}
            className={`flex-1 flex justify-center items-center py-1 text-sm font-medium rounded-md transition-all duration-300 ${
              currentTab === 'visits' 
                ? 'bg-white text-teal-800 shadow-md transform scale-[1.02]' 
                : 'text-teal-900 hover:bg-white/40'
            }`}
          >
            <TrendingUp className="w-4 h-4 mr-1" /> 访问榜
          </button>
        </div>
      </div>

      <div className="p-2 flex-1 overflow-y-auto flex flex-col justify-around">
        <ul className="space-y-1 h-full flex flex-col justify-around">
          {apps.map((app, index) => {
            let rankColor = 'bg-gray-100 text-gray-500';
            if (index === 0) rankColor = 'bg-red-500 text-white shadow-red-200 shadow-sm';
            else if (index === 1) rankColor = 'bg-orange-400 text-white shadow-orange-200 shadow-sm';
            else if (index === 2) rankColor = 'bg-yellow-400 text-white shadow-yellow-200 shadow-sm';

            return (
              <li key={app.id}>
                <a 
                  href={app.link || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between group py-2.5 px-3 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer block"
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <span className={`flex items-center justify-center min-w-[26px] h-[26px] rounded-full text-xs font-bold ${rankColor}`}>
                      {index + 1}
                    </span>
                    <span className="font-medium text-sm text-gray-700 truncate group-hover:text-blue-600 transition-colors">
                      {app.name}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[12px] text-gray-500 bg-white border border-gray-100 px-2.5 py-0.5 rounded-full whitespace-nowrap ml-2 shadow-sm">
                      {app.visits.toLocaleString()} 次
                    </span>
                  </div>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default RankingList;
