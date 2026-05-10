import React from 'react';
import { Filters } from '../types';
import { Search } from 'lucide-react';

interface FilterSectionProps {
  filters: Filters;
  selectedUnit: string;
  selectedDomain: string;
  selectedFeature: string;
  searchQuery: string;
  onUnitChange: (unit: string) => void;
  onDomainChange: (domain: string) => void;
  onFeatureChange: (feature: string) => void;
  onSearchChange: (query: string) => void;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  filters,
  selectedUnit,
  selectedDomain,
  selectedFeature,
  searchQuery,
  onUnitChange,
  onDomainChange,
  onFeatureChange,
  onSearchChange,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-2">
      {/* 搜索框 */}
      <div className="flex justify-center mb-4">
        <div className="relative w-full max-w-2xl">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-24 py-3 border border-gray-200 rounded-full leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors duration-200"
            placeholder="按Enter确认搜索"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <button className="absolute right-1 top-1 bottom-1 px-6 bg-teal-400 hover:bg-teal-500 text-white rounded-full font-medium transition-colors">
            搜索应用
          </button>
        </div>
      </div>

      {/* 标签过滤区 */}
      <div className="space-y-4">
        {/* 单位过滤 */}
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-1">
            <button
              onClick={() => onUnitChange('')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedUnit === ''
                  ? 'bg-teal-400 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              全部单位
            </button>
          </div>
          <div className="flex flex-wrap gap-2 ml-4">
            {filters.units.map((unit) => (
              <button
                key={unit}
                onClick={() => onUnitChange(unit)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedUnit === unit
                    ? 'bg-teal-400 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {unit}
              </button>
            ))}
          </div>
        </div>

        {/* 领域过滤 */}
        <div className="flex items-start pt-2 border-t border-gray-50">
          <div className="flex-shrink-0 pt-1">
            <button
              onClick={() => onDomainChange('')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedDomain === ''
                  ? 'bg-teal-400 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              全部领域
            </button>
          </div>
          <div className="flex flex-wrap gap-2 ml-4">
            {filters.domains.map((domain) => (
              <button
                key={domain}
                onClick={() => onDomainChange(domain)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedDomain === domain
                    ? 'bg-teal-400 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {domain}
              </button>
            ))}
          </div>
        </div>
        {/* 特点过滤 */}
        {filters.features && filters.features.length > 0 && (
          <div className="flex items-start pt-2 border-t border-gray-50">
            <div className="flex-shrink-0 pt-1">
              <button
                onClick={() => onFeatureChange('')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedFeature === ''
                    ? 'bg-teal-400 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                全部特点
              </button>
            </div>
            <div className="flex flex-wrap gap-2 ml-4">
              {filters.features.map((feature) => (
                <button
                  key={feature}
                  onClick={() => onFeatureChange(feature)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedFeature === feature
                      ? 'bg-teal-400 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {feature}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterSection;
