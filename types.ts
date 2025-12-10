
export interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: string;
  currency: string;
  lastUpdated: string;
}

export interface FinancialMetric {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
}

export interface FinancialHealthData {
  balanceSheet: FinancialMetric[];
  incomeStatement: FinancialMetric[];
  summary: string;
}

export interface ValuationData {
  peRatio: number;
  industryAveragePe: number;
  estimatedFairValue: number;
  recommendation: 'BUY' | 'SELL' | 'HOLD';
  reasoning: string;
}

export interface ComparisonAnalysis {
  summary: string;
  executiveSummary: string[];
  winner: string;
  table: {
    metric: string;
    [ticker: string]: string | number;
  }[];
}

export enum AppTab {
  PRICE = 'PRICE',
  FINANCIALS = 'FINANCIALS',
  VALUATION = 'VALUATION',
}

export type TimeRange = '1M' | '3M' | '6M' | '1Y' | '2Y' | '3Y' | '5Y';

export interface UploadedFile {
  name: string;
  mimeType: string;
  data: string; // base64 encoded string
}
