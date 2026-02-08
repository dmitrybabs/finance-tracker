import { Transaction, Category } from '../types';
import { Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

function formatMoney(n: number): string {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(n);
}

interface TransactionListProps {
  transactions: Transaction[];
  getCategoryById: (id: string) => Category | undefined;
  onDelete: (id: string) => void;
}

export function TransactionList({ transactions, getCategoryById, onDelete }: TransactionListProps) {
  const grouped = transactions.reduce<Record<string, Transaction[]>>((acc, tx) => {
    if (!acc[tx.date]) acc[tx.date] = [];
    acc[tx.date].push(tx);
    return acc;
  }, {});

  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  if (transactions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-slate-100 dark:border-gray-700 shadow-sm text-center">
        <p className="text-4xl mb-3">📭</p>
        <p className="text-slate-500 dark:text-gray-400 font-medium">Нет операций за выбранный период</p>
        <p className="text-slate-400 dark:text-gray-500 text-sm mt-1">Добавьте первую транзакцию</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm overflow-hidden">
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-gray-700">
        <h3 className="text-base font-semibold text-slate-800 dark:text-gray-100">История операций</h3>
        <p className="text-xs text-slate-400 dark:text-gray-500 mt-0.5">{transactions.length} операций</p>
      </div>
      <div className="max-h-[500px] overflow-y-auto">
        {dates.map(date => {
          const dayTxs = grouped[date];
          const dayIncome = dayTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
          const dayExpense = dayTxs.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

          return (
            <div key={date}>
              <div className="px-4 sm:px-5 py-2 bg-slate-50 dark:bg-gray-900/50 flex items-center justify-between sticky top-0 z-10">
                <span className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase">
                  {format(parseISO(date), 'd MMMM, EEEE', { locale: ru })}
                </span>
                <div className="flex gap-3 text-xs font-medium">
                  {dayIncome > 0 && <span className="text-emerald-600 dark:text-emerald-400">+{formatMoney(dayIncome)} ₽</span>}
                  {dayExpense > 0 && <span className="text-red-500 dark:text-red-400">-{formatMoney(dayExpense)} ₽</span>}
                </div>
              </div>
              {dayTxs.map(tx => {
                const cat = getCategoryById(tx.categoryId);
                return (
                  <div
                    key={tx.id}
                    className="px-4 sm:px-5 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-colors group border-b border-slate-50 dark:border-gray-700/50 last:border-0"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{ backgroundColor: (cat?.color || '#94a3b8') + '18' }}
                    >
                      {cat?.icon || '📦'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-gray-200 truncate">{tx.description}</p>
                      <p className="text-xs text-slate-400 dark:text-gray-500">{cat?.name || 'Без категории'}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-bold ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                        {tx.type === 'income' ? '+' : '-'}{formatMoney(tx.amount)} ₽
                      </p>
                    </div>
                    <button
                      onClick={() => onDelete(tx.id)}
                      className="p-1.5 rounded-lg text-slate-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
