import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
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

export function useFinanceStore() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('month');
  const apiAvailable = useRef(false);

  // ─── Загрузка данных при старте ───
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch('/api/transactions');
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      const txs: Transaction[] = data.transactions || [];
      apiAvailable.current = true;
      setTransactions(txs);
    } catch {
      // API недоступен (локальная разработка) — используем localStorage
      apiAvailable.current = false;
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setTransactions(parsed);
          } else {
            const sample = generateSampleData();
            localStorage.setItem(STORAGE_KEY, JSON.stringify(sample));
            setTransactions(sample);
          }
        } else {
          const sample = generateSampleData();
          localStorage.setItem(STORAGE_KEY, JSON.stringify(sample));
          setTransactions(sample);
        }
      } catch {
        const sample = generateSampleData();
        setTransactions(sample);
      }
    } finally {
      setLoading(false);
    }
  }

  function saveLocal(txs: Transaction[]) {
    if (!apiAvailable.current) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(txs));
    }
  }

  // ─── Категории ───
  const categories = DEFAULT_CATEGORIES;

  const getCategoryById = useCallback((id: string) => {
    return categories.find(c => c.id === id);
  }, [categories]);

  // ─── Добавить транзакцию ───
  const addTransaction = useCallback((
    amount: number,
    type: TransactionType,
    categoryId: string,
    description: string,
    date?: string
  ) => {
    const tx: Transaction = {
      id: uuidv4(),
      amount: Math.abs(amount),
      type,
      categoryId,
      description,
      date: date || format(new Date(), 'yyyy-MM-dd'),
      createdAt: new Date().toISOString(),
    };

    setTransactions(prev => {
      const updated = [tx, ...prev];
      saveLocal(updated);
      return updated;
    });

    // Сохраняем в API (fire-and-forget)
    if (apiAvailable.current) {
      fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tx),
      }).catch(console.error);
    }
  }, []);

  // ─── Удалить транзакцию ───
  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => {
      const updated = prev.filter(t => t.id !== id);
      saveLocal(updated);
      return updated;
    });

    if (apiAvailable.current) {
      fetch(`/api/transactions?id=${id}`, { method: 'DELETE' }).catch(console.error);
    }
  }, []);

  // ─── Загрузить демо-данные ───
  const seedDemoData = useCallback(async () => {
    setLoading(true);
    try {
      if (apiAvailable.current) {
        await fetch('/api/seed', { method: 'POST' });
        const res = await fetch('/api/transactions');
        const data = await res.json();
        setTransactions(data.transactions || []);
      } else {
        const sample = generateSampleData();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sample));
        setTransactions(sample);
      }
    } catch (e) {
      console.error('Seed error:', e);
      // Fallback
      const sample = generateSampleData();
      setTransactions(sample);
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── Очистить все данные ───
  const clearAllData = useCallback(async () => {
    setTransactions([]);
    if (apiAvailable.current) {
      // Удаляем через API — нужен отдельный эндпоинт или удаляем по одному
      // Проще всего: seed с 0 элементов. Но пока просто вызовем loadData
      try {
        // Удаляем каждую транзакцию
        const current = transactions;
        await Promise.all(
          current.map(tx =>
            fetch(`/api/transactions?id=${tx.id}`, { method: 'DELETE' }).catch(() => {})
          )
        );
      } catch {
        // ignore
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [transactions]);

  // ─── Фильтрация по периоду ───
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

  // ─── Статистика ───
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

  // ─── Агрегация по дням ───
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

  // ─── Агрегация по категориям ───
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
    loading,
    seedDemoData,
    clearAllData,
    isCloud: apiAvailable.current,
  };
}
