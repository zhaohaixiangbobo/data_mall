import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Stats } from '../types';

interface ChartsProps {
  data: Stats['charts'];
}

// 预定义饼图颜色
const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', 
  '#14b8a6', '#f97316', '#6366f1', '#06b6d4', '#84cc16', '#a855f7', '#d946ef'
];

/**
 * 带有自定义表格的饼图组件
 */
const PieWithTable = ({ title, data, colors }: { title: string, data: {name: string, value: number}[], colors: string[] }) => {
  const [page, setPage] = useState(0);
  const pageSize = 5;
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  
  // 计算总数用于占比
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const handleNextPage = () => {
    setPage((prev) => (prev + 1) % totalPages);
  };

  const currentData = data.slice(page * pageSize, (page + 1) * pageSize);
  const startIndex = page * pageSize;

  const option = {
    title: { text: title, left: 'center', top: 0, textStyle: { fontSize: 16, fontWeight: 'bold' } },
    tooltip: { trigger: 'item', formatter: '{a} <br/>{b} : {c} ({d}%)' },
    color: colors,
    series: [
      {
        name: title,
        type: 'pie',
        radius: ['35%', '65%'],
        center: ['22%', '55%'], // 进一步左移饼图给表格留空间
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          position: 'outside',
          formatter: '{d}%',
          color: '#666',
          distanceToLabelLine: 2
        },
        labelLine: {
          show: true,
          length: 5,
          length2: 5
        },
        data: data,
      },
    ],
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col h-[360px] relative">
      <div className="absolute top-4 left-0 w-full z-0">
        <ReactECharts option={option} style={{ height: '320px', width: '100%' }} />
      </div>
      
      {/* 右侧表格区域 */}
      <div className="absolute right-4 top-12 w-[55%] xl:w-[50%] bg-white/95 z-10 flex flex-col rounded shadow-sm border border-gray-50">
        <table className="w-full text-xs text-left text-gray-500 table-fixed">
          <thead className="text-gray-700 bg-gray-50/80 border-b border-gray-100">
            <tr>
              <th className="py-2 px-1 font-medium w-[15%] text-center">颜色</th>
              <th className="py-2 px-1 font-medium w-[40%]">名称</th>
              <th className="py-2 px-1 font-medium w-[20%] text-center">数量</th>
              <th className="py-2 px-1 font-medium w-[25%] text-center">占比</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((item, idx) => {
              const color = colors[(startIndex + idx) % colors.length];
              const percent = total === 0 ? 0 : ((item.value / total) * 100).toFixed(2);
              return (
                <tr key={item.name} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <td className="py-2 px-1">
                    <div className="w-3 h-3 rounded-sm mx-auto" style={{ backgroundColor: color }}></div>
                  </td>
                  <td className="py-2 px-1 truncate" title={item.name}>{item.name}</td>
                  <td className="py-2 px-1 font-medium text-gray-700 text-center">{item.value}</td>
                  <td className="py-2 px-1 text-gray-400 text-center">{percent}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {totalPages > 1 && (
          <div className="my-2 flex justify-center items-center space-x-3 text-xs text-gray-500">
            <button 
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1 hover:text-teal-500 disabled:opacity-30 disabled:hover:text-gray-500 cursor-pointer"
            >
              &lt; 上一页
            </button>
            <span>{page + 1} / {totalPages}</span>
            <button 
              onClick={handleNextPage}
              className="p-1 hover:text-teal-500 cursor-pointer"
            >
              下一页 &gt;
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const Charts: React.FC<ChartsProps> = ({ data }) => {
  // 转换数据格式为 ECharts 需要的 {name, value}
  const domainData = data.domain_distribution.map((item) => ({ name: item.domain, value: item.count }));
  const unitData = data.unit_distribution.map((item) => ({ name: item.unit, value: item.count }));

  // 新增趋势折线图配置
  const trendOption = {
    title: { text: '应用新增趋势', left: 'center', top: 0, textStyle: { fontSize: 16, fontWeight: 'bold' } },
    tooltip: { trigger: 'axis' },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '20%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.new_trend.map((item) => item.month),
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisLabel: { color: '#6b7280' }
    },
    yAxis: { 
      type: 'value',
      splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } },
      axisLabel: { color: '#6b7280' }
    },
    series: [
      {
        name: '新增数量',
        data: data.new_trend.map((item) => item.count),
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: { color: '#3b82f6' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(59, 130, 246, 0.5)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.0)' }
            ]
          }
        },
      },
    ],
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <PieWithTable title="各领域占比" data={domainData} colors={COLORS} />
      <PieWithTable title="各单位应用占比" data={unitData} colors={[...COLORS].reverse()} />
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-[360px]">
        <ReactECharts option={trendOption} style={{ height: '320px' }} />
      </div>
    </div>
  );
};

export default Charts;