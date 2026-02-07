import { useState } from 'react';
import { useFinanceStore } from './hooks/useFinanceStore';
import { StatCards } from './components/StatCards';
import { IncomeExpenseChart, BalanceChart, CategoryPieChart, DailyBarChart } from './components/Charts';
import { TransactionList } from './components/TransactionList';
import { AddTransaction } from './components/AddTransaction';
import { CategoryBreakdown } from './components/CategoryBreakdown';
import { PeriodSelector } from './components/PeriodSelector';
import { Plus, BarChart3, List, PieChart, Wallet } from 'lucide-react';
import { cn } from './utils/cn';

type Tab = 'dashboard' | 'history' | 'analytics';

export function App() {
  const store = useFinanceStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Обзор', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'history', label: 'История', icon: <List className="w-5 h-5" /> },
    { id: 'analytics', label: 'Аналитика', icon: <PieChart className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-slate-800 leading-tight">ФинТрекер</h1>
                <p className="text-[10px] sm:text-xs text-slate-400 leading-tight hidden sm:block">Учёт личных финансов</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <PeriodSelector selected={store.selectedPeriod} onChange={store.setSelectedPeriod} />
              <button
                onClick={() => setShowAddModal(true)}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-indigo-200 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Добавить
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-24 sm:pb-6">
        {/* Stat Cards - always visible */}
        <div className="mb-5 sm:mb-6">
          <StatCards
            totalIncome={store.stats.totalIncome}
            totalExpense={store.stats.totalExpense}
            balance={store.stats.balance}
            totalBalance={store.totalBalance}
            transactionCount={store.stats.transactionCount}
          />
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <div className="space-y-5 sm:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
              <IncomeExpenseChart data={store.dailyAggregates} />
              <BalanceChart data={store.dailyAggregates} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
              <CategoryBreakdown data={store.categoryAggregates.expenses} title="📊 Топ расходов по категориям" />
              <CategoryBreakdown data={store.categoryAggregates.income} title="💰 Доходы по категориям" />
            </div>
            {/* Recent transactions preview */}
            <TransactionList
              transactions={store.transactions.slice(0, 15)}
              getCategoryById={store.getCategoryById}
              onDelete={store.deleteTransaction}
            />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-5">
            <TransactionList
              transactions={store.transactions}
              getCategoryById={store.getCategoryById}
              onDelete={store.deleteTransaction}
            />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-5 sm:space-y-6">
            <DailyBarChart data={store.dailyAggregates} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
              <CategoryPieChart data={store.categoryAggregates.expenses} title="Расходы по категориям" />
              <CategoryPieChart data={store.categoryAggregates.income} title="Доходы по категориям" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
              <CategoryBreakdown data={store.categoryAggregates.expenses} title="📊 Детализация расходов" />
              <CategoryBreakdown data={store.categoryAggregates.income} title="💰 Детализация доходов" />
            </div>
            <IncomeExpenseChart data={store.dailyAggregates} />
            <BalanceChart data={store.dailyAggregates} />
          </div>
        )}
      </main>

      {/* Bottom Navigation (mobile) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200/60 z-40">
        <div className="flex items-center justify-around py-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-all',
                activeTab === tab.id ? 'text-indigo-600' : 'text-slate-400'
              )}
            >
              {tab.icon}
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          ))}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex flex-col items-center gap-0.5 px-4 py-1"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-300 -mt-5">
              <Plus className="w-5 h-5 text-white" />
            </div>
          </button>
        </div>
      </nav>

      {/* Desktop Tab Switcher */}
      <div className="hidden sm:flex fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/60 p-1.5 gap-1 z-40">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
              activeTab === tab.id
                ? 'bg-indigo-500 text-white shadow-md shadow-indigo-200'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <AddTransaction
          categories={store.categories}
          onAdd={store.addTransaction}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}
