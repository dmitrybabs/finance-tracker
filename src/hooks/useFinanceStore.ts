import { useState, useCallback, useMemo } from 'react';
import { Transaction, TransactionType, Period, DailyAggregate, CategoryAggregate } from '../types';
import { DEFAULT_CATEGORIES } from '../data/categories';
import { generateSampleData } from '../data/sampleData';
import { v4 as uuidv4 } from 'uuid';
import {
  startOfDay, startOfWeek, startOfMonth, startOfYear,
  isAfter, isEqual, format, parseISO, eachDayOfInterval,
  subDays,
} from 'date-fns';
import { ru } from 'date-fns/locale';

const STORAGE_KEY = 'fintracker_transactions';

function loadTransactions(): Transaction[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  const sample = generateSampleData();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sample));
  return sample;
}

function saveTransactions(transactions: Transaction[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

export function useFinanceStore() {
  const [transactions, setTransactions] = useState<Transaction[]>(loadTransactions);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('month');

  const categories = DEFAULT_CATEGORIES;

  const getCategoryById = useCallback((id: string) => {
    return categories.find(c => c.id === id);
  }, [categories]);

  const addTransaction = useCallback((
    amount: number,
    type: TransactionType,
    categoryId: string,
    description: string,
    date?: string
  ) => {
    const newTx: Transaction = {
      id: uuidv4(),
      amount: Math.abs(amount),
      type,
      categoryId,
      description,
      date: date || format(new Date(), 'yyyy-MM-dd'),
      createdAt: new Date().toISOString(),
    };
    setTransactions(prev => {
      const updated = [newTx, ...prev];
      saveTransactions(updated);
      return updated;
    });
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => {
      const updated = prev.filter(t => t.id !== id);
      saveTransactions(updated);
      return updated;
    });
  }, []);

  const getStartDate = useCallback((period: Period): Date | null => {
    const now = new Date();
    switch (period) {
      case 'day': return startOfDay(now);
      case 'week': return startOfWeek(now, { locale: ru, weekStartsOn: 1 });
      case 'month': return startOfMonth(now);
      case 'year': return startOfYear(now);
      case 'all': return null;
    }
  }, []);

  const filteredTransactions = useMemo(() => {
    const start = getStartDate(selectedPeriod);
    if (!start) return [...transactions].sort((a, b) => b.date.localeCompare(a.date));
    return transactions
      .filter(t => {
        const txDate = parseISO(t.date);
        return isAfter(txDate, start) || isEqual(txDate, start);
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, selectedPeriod, getStartDate]);

  const stats = useMemo(() => {
    const totalIncome = filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);
    const totalExpense = filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);
    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      transactionCount: filteredTransactions.length,
    };
  }, [filteredTransactions]);

  const totalBalance = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);
    return totalIncome - totalExpense;
  }, [transactions]);

  const dailyAggregates = useMemo((): DailyAggregate[] => {
    const start = getStartDate(selectedPeriod);
    const now = new Date();
    const startDate = start || (transactions.length > 0
      ? parseISO(transactions.reduce((min, t) => t.date < min ? t.date : min, transactions[0].date))
      : subDays(now, 30));

    const days = eachDayOfInterval({ start: startDate, end: now });
    const dayMap = new Map<string, { income: number; expense: number }>();

    days.forEach(d => {
      dayMap.set(format(d, 'yyyy-MM-dd'), { income: 0, expense: 0 });
    });

    filteredTransactions.forEach(t => {
      const existing = dayMap.get(t.date);
      if (existing) {
        if (t.type === 'income') existing.income += t.amount;
        else existing.expense += t.amount;
      }
    });

    return Array.from(dayMap.entries()).map(([date, data]) => ({
      date,
      income: data.income,
      expense: data.expense,
      balance: data.income - data.expense,
    }));
  }, [filteredTransactions, selectedPeriod, getStartDate, transactions]);

  const categoryAggregates = useMemo(() => {
    const getAggregates = (type: TransactionType): CategoryAggregate[] => {
      const txs = filteredTransactions.filter(t => t.type === type);
      const total = txs.reduce((s, t) => s + t.amount, 0);
      const map = new Map<string, { total: number; count: number }>();

      txs.forEach(t => {
        const existing = map.get(t.categoryId) || { total: 0, count: 0 };
        existing.total += t.amount;
        existing.count += 1;
        map.set(t.categoryId, existing);
      });

      return Array.from(map.entries())
        .map(([catId, data]) => {
          const cat = getCategoryById(catId);
          return {
            categoryId: catId,
            categoryName: cat?.name || catId,
            color: cat?.color || '#999',
            icon: cat?.icon || '📦',
            total: data.total,
            count: data.count,
            percentage: total > 0 ? (data.total / total) * 100 : 0,
          };
        })
        .sort((a, b) => b.total - a.total);
    };

    return {
      expenses: getAggregates('expense'),
      income: getAggregates('income'),
    };
  }, [filteredTransactions, getCategoryById]);

  return {
    transactions: filteredTransactions,
    allTransactions: transactions,
    categories,
    selectedPeriod,
    setSelectedPeriod,
    addTransaction,
    deleteTransaction,
    getCategoryById,
    stats,
    totalBalance,
    dailyAggregates,
    categoryAggregates,
  };
}
