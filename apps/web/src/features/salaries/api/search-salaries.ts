import { api } from '@/lib/api';
import type { SalaryAggregate, TopPayingCompany } from '../types/salary.types';

export const getSalaryInsights = async (title: string, location?: string) => {
  const params = new URLSearchParams();
  if (title) params.append('title', title);
  if (location) params.append('location', location);
  
  return api.get<{ data: SalaryAggregate | null }>(`/salaries/engine/search?${params.toString()}`);
};

export const getTopPayingCompanies = async (title: string) => {
  const params = new URLSearchParams();
  if (title) params.append('title', title);
  
  return api.get<{ data: TopPayingCompany[] }>(`/salaries/engine/top-paying-companies?${params.toString()}`);
};
