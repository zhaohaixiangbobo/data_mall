import React from 'react';
import { Stats } from '../types';

interface StatCardsProps {
  summary: Stats['summary'];
}

const StatCards: React.FC<StatCardsProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
      {/* 应用分析 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
        <h3 className="text-lg font-bold text-gray-800 mb-4 text-center border-b border-gray-100 pb-2">应用分析</h3>
        <div className="flex justify-around items-center flex-1">
          <div className="flex flex-col items-center">
            <span className="text-gray-500 text-sm mb-2">应用总数</span>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 mr-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
              </div>
              <span className="text-3xl font-bold text-teal-600">{summary.total_apps}</span>
            </div>
          </div>
          <div className="h-12 w-px bg-gray-200"></div>
          <div className="flex flex-col items-center">
            <span className="text-gray-500 text-sm mb-2">本月新增</span>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
              </div>
              <span className="text-3xl font-bold text-teal-600">{summary.new_this_month}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 推广分析 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
        <h3 className="text-lg font-bold text-gray-800 mb-4 text-center border-b border-gray-100 pb-2">推广分析</h3>
        <div className="flex justify-around items-center flex-1">
          <div className="flex flex-col items-center">
            <span className="text-gray-500 text-sm mb-2">累计推广次数</span>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
              </div>
              <span className="text-3xl font-bold text-teal-600">{summary.promotion_stats}</span>
            </div>
          </div>
          <div className="h-12 w-px bg-gray-200"></div>
          <div className="flex flex-col items-center">
            <span className="text-gray-500 text-sm mb-2">累计被推广应用数</span>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 mr-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
              </div>
              <span className="text-3xl font-bold text-teal-600">{summary.total_promoted_apps}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 访问分析 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
        <h3 className="text-lg font-bold text-gray-800 mb-4 text-center border-b border-gray-100 pb-2">访问分析</h3>
        <div className="flex justify-around items-center flex-1">
          <div className="flex flex-col items-center">
            <span className="text-gray-500 text-sm mb-2">上月访问次数</span>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
              </div>
              <span className="text-3xl font-bold text-teal-600">{summary.last_month_visits}</span>
            </div>
          </div>
          <div className="h-12 w-px bg-gray-200"></div>
          <div className="flex flex-col items-center">
            <span className="text-gray-500 text-sm mb-2">上月访问人数</span>
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mr-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              </div>
              <span className="text-3xl font-bold text-teal-600">{summary.last_month_visitors}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCards;