export interface SalaryAggregate {
  canonical_job_title: string;
  location: string;
  median_pay: number;
  p25_pay: number;
  p75_pay: number;
  min_pay: number;
  max_pay: number;
  sample_count: number;
}

export interface TopPayingCompany {
  id: string;
  name: string;
  slug: string;
  averagePay: number;
  sampleSize: number;
}
