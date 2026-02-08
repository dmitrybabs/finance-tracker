import { TrendingUp, TrendingDown, Wallet, ArrowUpDown } from 'lucide-react';

interface StatCardsProps {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  totalBalance: number;
  transactionCount: number;
}

function formatMoney(n: number): string {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(n);
}

export function StatCards({ totalIncome, totalExpense, balance, totalBalance, transactionCount }: StatCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 sm:p-5 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50">
        <div className="flex items-center gap-2 mb-2 opacity-90">
          <Wallet className="w-4 h-4" />
          <span className="text-xs font-medium uppercase tracking-wider">Общий баланс</span>
        </div>
        <p className="text-2xl sm:text-3xl font-bold tracking-tight">{formatMoney(totalBalance)}</p>
        <p className="text-xs mt-1 opacity-75">{transactionCount} операций за период</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-5 border border-emerald-100 dark:border-emerald-800/50 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Доходы</span>
        </div>
        <p className="text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatMoney(totalIncome)}</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-5 border border-red-100 dark:border-red-800/50 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
            <TrendingDown className="w-4 h-4 text-red-500 dark:text-red-400" />
          </div>
          <span className="text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Расходы</span>
        </div>
        <p className="text-xl sm:text-2xl font-bold text-red-500 dark:text-red-400">{formatMoney(totalExpense)}</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-5 border border-slate-100 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-gray-700 flex items-center justify-center">
            <ArrowUpDown className="w-4 h-4 text-slate-600 dark:text-gray-400" />
          </div>
          <span className="text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">За период</span>
        </div>
        <p className={`text-xl sm:text-2xl font-bold ${balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
          {balance >= 0 ? '+' : ''}{formatMoney(balance)}
        </p>
      </div>
    </div>
  );
}
