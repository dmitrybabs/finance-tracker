export type TransactionType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  icon: string;
  type: TransactionType;
  color: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  description: string;
  date: string; // ISO string
  createdAt: string;
}

export type Period = 'day' | 'week' | 'month' | 'year' | 'all';

export interface DailyAggregate {
  date: string;
  income: number;
  expense: number;
  balance: number;
}

export interface CategoryAggregate {
  categoryId: string;
  categoryName: string;
  color: string;
  icon: string;
  total: number;
  count: number;
  percentage: number;
}
