import axios from 'axios';
import { AppData, Filters, Stats } from './types';

const api = axios.create({
  baseURL: '/api',
});

/**
 * 获取过滤条件列表（单位和业务领域）
 * @returns 包含单位和业务领域数组的 Promise
 */
export const getFilters = async (): Promise<Filters> => {
  const { data } = await api.get<Filters>('/filters');
  return data;
};

/**
 * 根据过滤条件获取应用列表
 * @param unit - 可选，按单位过滤
 * @param domain - 可选，按业务领域过滤
 * @param search - 可选，按名称搜索
 * @returns 匹配的应用数组的 Promise
 */
export const getApps = async (unit?: string, domain?: string, search?: string): Promise<AppData[]> => {
  const params = { unit, domain, search };
  const { data } = await api.get<AppData[]>('/apps', { params });
  return data;
};

/**
 * 获取访问量排名前15的应用
 * @returns 排名应用数组的 Promise
 */
export const getRanking = async (): Promise<AppData[]> => {
  const { data } = await api.get<AppData[]>('/ranking');
  return data;
};

/**
 * 获取所有统计数据（概要和图表数据）
 * @returns 包含概要和图表数据的 Promise
 */
export const getStats = async (): Promise<Stats> => {
  const { data } = await api.get<Stats>('/stats');
  return data;
};
