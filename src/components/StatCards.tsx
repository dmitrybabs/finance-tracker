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
      {/* Total Balance */}
      <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 sm:p-5 text-white shadow-lg shadow-indigo-200">
        <div className="flex items-center gap-2 mb-2 opacity-90">
          <Wallet className="w-4 h-4" />
          <span className="text-xs font-medium uppercase tracking-wider">Общий баланс</span>
        </div>
        <p className="text-2xl sm:text-3xl font-bold tracking-tight">{formatMoney(totalBalance)}</p>
        <p className="text-xs mt-1 opacity-75">{transactionCount} операций за период</p>
      </div>

      {/* Income */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-100 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Доходы</span>
        </div>
        <p className="text-xl sm:text-2xl font-bold text-emerald-600">{formatMoney(totalIncome)}</p>
      </div>

      {/* Expenses */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-red-100 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
            <TrendingDown className="w-4 h-4 text-red-500" />
          </div>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Расходы</span>
        </div>
        <p className="text-xl sm:text-2xl font-bold text-red-500">{formatMoney(totalExpense)}</p>
      </div>

      {/* Period Balance */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
            <ArrowUpDown className="w-4 h-4 text-slate-600" />
          </div>
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">За период</span>
        </div>
        <p className={`text-xl sm:text-2xl font-bold ${balance >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
          {balance >= 0 ? '+' : ''}{formatMoney(balance)}
        </p>
      </div>
    </div>
  );
}
