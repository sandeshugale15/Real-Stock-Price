export interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  marketCap?: string;
  summary: string;
  groundingSources: Array<{
    title: string;
    url: string;
  }>;
  lastUpdated: Date;
}

export interface ChartPoint {
  time: string;
  price: number;
}

export interface WatchListItem {
  symbol: string;
  name: string;
  price: number;
  changePercent: number;
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}