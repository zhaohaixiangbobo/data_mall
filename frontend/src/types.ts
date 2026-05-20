export interface AppData {
  id: number;
  name: string;
  unit: string;
  domain: string;
  description: string;
  img_url: string;
  link: string;
  features: string;
  visits: number;
  data_amount: number;
  created_at: string;
}

export interface Filters {
  units: string[];
  domains: string[];
  features: string[];
}

export interface Stats {
  summary: {
    total_apps: number;
    new_this_month: number;
    data_total: number;
    last_month_new_data: number;
    visits_total: number;
    last_month_visitors: number;
  };
  charts: {
    domain_distribution: { domain: string; count: number }[];
    unit_distribution: { unit: string; count: number }[];
    new_trend: { month: string; count: number }[];
  };
}
