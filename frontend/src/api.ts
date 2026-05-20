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
export const getApps = async (unit?: string, domain?: string, feature?: string, search?: string): Promise<AppData[]> => {
  const params = new URLSearchParams();
  if (unit) params.append('unit', unit);
  if (domain) params.append('domain', domain);
  if (feature) params.append('feature', feature);
  if (search) params.append('search', search);

  const { data } = await api.get<AppData[]>(`/apps?${params.toString()}`);
  return data;
};

/**
 * 获取排名前 15 的应用
 * @param type 排行榜类型：visits 或 comprehensive
 * @returns 应用数组的 Promise
 */
export const getRanking = async (type: 'visits' | 'comprehensive' = 'comprehensive'): Promise<AppData[]> => {
  const { data } = await api.get<AppData[]>(`/ranking?type=${type}`);
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

export const login = async (username: string, password: string): Promise<{ access_token: string; token_type: string }> => {
  const { data } = await api.post('/auth/login', { username, password });
  return data;
};

export const uploadExcel = async (
  file: File,
  token: string
): Promise<{ message: string; apps: number; monthly_stats: number }> => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` },
  });
  return data;
};
