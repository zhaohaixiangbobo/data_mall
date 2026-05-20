import { useState, useEffect } from 'react';
import { AppData, Filters, Stats } from './types';
import { getApps, getFilters, getRanking, getStats } from './api';
import AppCard from './components/AppCard';
import FilterSection from './components/FilterSection';
import RankingList from './components/RankingList';
import StatCards from './components/StatCards';
import Charts from './components/Charts';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * 根组件，管理全局状态和数据请求
 */
function App() {
  const [apps, setApps] = useState<AppData[]>([]);
  const [ranking, setRanking] = useState<AppData[]>([]);
  const [rankingTab, setRankingTab] = useState<'comprehensive' | 'visits'>('comprehensive');
  const [filters, setFilters] = useState<Filters>({ units: [], domains: [], features: [] });
  const [stats, setStats] = useState<Stats | null>(null);

  // 过滤条件状态
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [selectedFeature, setSelectedFeature] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // 分页状态
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8; // 每页展示8个（4列 * 2行）

  // 初始化加载基础数据（过滤条件、排行、统计）
  useEffect(() => {
    const fetchBaseData = async () => {
      try {
        const [filtersData, statsData] = await Promise.all([
          getFilters(),
          getStats(),
        ]);
        setFilters(filtersData);
        setStats(statsData);
      } catch (error) {
        console.error('获取基础数据失败', error);
      }
    };
    fetchBaseData();
  }, []);

  // 监听排行榜 Tab 切换
  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const rankingData = await getRanking(rankingTab);
        setRanking(rankingData);
      } catch (error) {
        console.error('获取排行榜数据失败', error);
      }
    };
    fetchRanking();
  }, [rankingTab]);

  // 监听过滤条件变化，重新获取应用列表
  useEffect(() => {
    const fetchApps = async () => {
      setLoading(true);
      try {
        const appsData = await getApps(selectedUnit, selectedDomain, selectedFeature, searchQuery);
        setApps(appsData);
        setCurrentPage(1); // 过滤后重置回第一页
      } catch (error) {
        console.error('获取应用列表失败', error);
      } finally {
        setLoading(false);
      }
    };
    
    // 简单的防抖处理搜索输入
    const timer = setTimeout(() => {
      fetchApps();
    }, 300);
    
    return () => clearTimeout(timer);
  }, [selectedUnit, selectedDomain, selectedFeature, searchQuery]);

  // 计算当前页的应用
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentApps = apps.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(apps.length / itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="min-h-screen bg-[#eaf4fc] flex flex-col font-sans text-gray-900">
      {/* 顶部 Banner 区域 */}
      <header className="relative w-full h-44 bg-gradient-to-r from-blue-300 via-cyan-200 to-blue-200 overflow-hidden shadow-sm">
        {/* 装饰图案 */}
        <div className="absolute left-10 top-1/2 -translate-y-1/2 opacity-20">
          <div className="w-32 h-32 border-[10px] border-white rounded-xl rotate-12"></div>
        </div>
        <div className="absolute left-1/4 top-10 opacity-30 text-white text-5xl font-bold">#</div>
        <div className="absolute left-1/3 bottom-10 opacity-30 text-white text-5xl font-bold">&lt;/&gt;</div>
        <div className="absolute right-1/3 top-20 opacity-30 text-white text-5xl font-bold">%</div>
        
        <div className="w-[98%] xl:w-[95%] max-w-[1800px] mx-auto h-full relative flex items-center justify-between">
          <div className="flex items-center space-x-4 z-10">
            <h1 className="text-4xl md:text-5xl font-bold tracking-widest text-white drop-shadow-md">
              天津烟草低代码应用集市
            </h1>
          </div>
          <div className="hidden md:flex flex-col space-y-3 z-10 bg-white/20 backdrop-blur-sm p-4 rounded-xl border border-white/30">
            <div className="bg-cyan-400 text-white px-6 py-1 rounded-full text-sm font-medium tracking-widest text-center shadow-sm">支撑有力</div>
            <div className="bg-cyan-200 text-teal-800 px-6 py-1 rounded-full text-sm font-medium tracking-widest text-center shadow-sm">服务有感</div>
            <div className="bg-cyan-400 text-white px-6 py-1 rounded-full text-sm font-medium tracking-widest text-center shadow-sm">赋能有为</div>
          </div>
        </div>
      </header>

      {/* 主体内容 */}
      <main className="flex-1 w-[98%] xl:w-[95%] max-w-[1800px] mx-auto py-4 flex flex-col gap-4">
        <FilterSection
          filters={filters}
          selectedUnit={selectedUnit}
          selectedDomain={selectedDomain}
          selectedFeature={selectedFeature}
          searchQuery={searchQuery}
          onUnitChange={setSelectedUnit}
          onDomainChange={setSelectedDomain}
          onFeatureChange={setSelectedFeature}
          onSearchChange={setSearchQuery}
        />

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          {/* 左侧：应用卡片网格 (占据 3 列) */}
          <div className="xl:col-span-3 flex flex-col">
            {loading ? (
              <div className="flex justify-center items-center h-64 text-gray-400 bg-white rounded-xl shadow-sm">加载中...</div>
            ) : apps.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {currentApps.map((app) => (
                    <AppCard key={app.id} app={app} />
                  ))}
                </div>
                
                {/* 分页控制区 */}
                <div className="mt-4 flex items-center justify-end">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-gray-500">
                      共 {apps.length} 个应用，当前 {currentPage}/{totalPages} 页
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <span className="text-sm text-gray-500">跳至</span>
                      <input 
                        type="number" 
                        min={1} 
                        max={totalPages || 1}
                        placeholder={currentPage.toString()}
                        className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 text-center"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const val = parseInt(e.currentTarget.value);
                            if (!isNaN(val) && val >= 1 && val <= totalPages) {
                              setCurrentPage(val);
                              e.currentTarget.value = '';
                            }
                          }
                        }}
                      />
                      <span className="text-sm text-gray-500">页</span>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button 
                        onClick={handlePrevPage}
                        disabled={currentPage === 1}
                        className="p-2 rounded-full bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <button 
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="p-2 rounded-full bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col justify-center items-center h-64 bg-white rounded-xl shadow-sm text-gray-400">
                <p>未找到匹配的应用</p>
              </div>
            )}
          </div>

          {/* 右侧：排行榜 (占据 1 列) */}
          <div className="xl:col-span-1">
            <RankingList apps={ranking} currentTab={rankingTab} onTabChange={setRankingTab} />
          </div>
        </div>

        {/* 底部统计信息 */}
        {stats && (
          <div className="mt-2 flex flex-col gap-4">
            <StatCards summary={stats.summary} />
            <Charts data={stats.charts} />
          </div>
        )}
      </main>
      
      {/* 底部 Banner 区域 */}
      <div className="relative w-full h-24 bg-gradient-to-r from-blue-300 via-cyan-200 to-blue-200 overflow-hidden shadow-sm mt-6">
        <div className="absolute left-10 top-1/2 -translate-y-1/2 opacity-20">
          <div className="w-32 h-32 border-[10px] border-white rounded-xl rotate-12"></div>
        </div>
        <div className="absolute left-1/4 top-10 opacity-30 text-white text-5xl font-bold">#</div>
        <div className="absolute right-1/3 top-10 opacity-30 text-white text-5xl font-bold">%</div>
        
        <div className="w-[98%] xl:w-[95%] max-w-[1800px] mx-auto h-full relative flex justify-center items-center">
           <div className="flex space-x-12">
             <div className="text-3xl font-bold text-white tracking-wider drop-shadow-md">搭好技术舞台</div>
             <div className="text-3xl font-bold text-white tracking-wider drop-shadow-md">共唱数字好戏</div>
           </div>
        </div>
      </div>

      {/* 页脚 */}
      <footer className="bg-white py-4">
        <div className="w-[98%] xl:w-[95%] max-w-[1800px] mx-auto text-center text-sm text-gray-500">
          <p>主管单位：天津市烟草烟草专卖局（公司）信息中心 联系地址：天津市和平区长春道20号</p> 
        </div>
      </footer>
    </div>
  );
}

export default App;
