import { useState } from 'react';
import { useAuth, User } from './hooks/useAuth';
import { useThemeProvider, ThemeContext, useTheme } from './hooks/useTheme';
import { useFinanceStore } from './hooks/useFinanceStore';
import { AuthScreen } from './components/AuthScreen';
import { StatCards } from './components/StatCards';
import { IncomeExpenseChart, BalanceChart, CategoryPieChart, DailyBarChart } from './components/Charts';
import { TransactionList } from './components/TransactionList';
import { AddTransaction } from './components/AddTransaction';
import { CategoryBreakdown } from './components/CategoryBreakdown';
import { PeriodSelector } from './components/PeriodSelector';
import {
  Plus, BarChart3, List, PieChart, Wallet, Cloud, HardDrive,
  Database, Trash2, Loader2, Moon, Sun, LogOut, User as UserIcon,
} from 'lucide-react';
import { cn } from './utils/cn';

type Tab = 'dashboard' | 'history' | 'analytics';

export function App() {
  const auth = useAuth();
  const themeCtx = useThemeProvider();

  if (auth.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl mx-auto mb-4 animate-pulse">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <div className="flex items-center gap-2 justify-center">
            <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
            <p className="text-slate-500 dark:text-gray-400 font-medium">Загрузка...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={themeCtx}>
      {auth.user ? (
        <Dashboard user={auth.user} onLogout={auth.logout} />
      ) : (
        <AuthScreen
          onLogin={auth.login}
          onRegister={auth.register}
          onGuest={auth.loginAsGuest}
          error={auth.error}
          clearError={auth.clearError}
        />
      )}
    </ThemeContext.Provider>
  );
}

function Dashboard({ user, onLogout }: { user: User; onLogout: () => void }) {
  const store = useFinanceStore(user.id);
  const { isDark, toggleTheme } = useTheme();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Обзор', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'history', label: 'История', icon: <List className="w-5 h-5" /> },
    { id: 'analytics', label: 'Аналитика', icon: <PieChart className="w-5 h-5" /> },
  ];

  if (store.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl mx-auto mb-4 animate-pulse">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <div className="flex items-center gap-2 justify-center">
            <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
            <p className="text-slate-500 dark:text-gray-400 font-medium">Загрузка данных...</p>
          </div>
        </div>
      </div>
    );
  }

  const isEmpty = store.allTransactions.length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-gray-700/60 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50">
                <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-slate-800 dark:text-gray-100 leading-tight">ФинТрекер</h1>
                <div className="flex items-center gap-2">
                  {store.isCloud ? (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                      <Cloud className="w-3 h-3" /> Cloud
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                      <HardDrive className="w-3 h-3" /> Local
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-gray-500 font-medium">
                    <UserIcon className="w-3 h-3" /> {user.displayName}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <PeriodSelector selected={store.selectedPeriod} onChange={store.setSelectedPeriod} />
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl text-slate-500 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-gray-700 transition-colors"
                title={isDark ? 'Светлая тема' : 'Тёмная тема'}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                onClick={onLogout}
                className="p-2 rounded-xl text-slate-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500 transition-colors"
                title="Выйти"
              >
                <LogOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-indigo-200 dark:hover:shadow-indigo-900/50 transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Добавить
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Guest Banner */}
      {user.id === 'guest' && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-800/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-center gap-2">
            <span className="text-xs text-amber-700 dark:text-amber-400">
              👋 Вы вошли как гость. Данные хранятся только в этом браузере.
            </span>
            <button
              onClick={onLogout}
              className="text-xs font-semibold text-amber-700 dark:text-amber-400 underline hover:no-underline"
            >
              Создать аккаунт
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-24 sm:pb-20">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 flex items-center justify-center mb-6">
              <Database className="w-10 h-10 text-indigo-400 dark:text-indigo-300" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-gray-100 mb-2">Нет данных</h2>
            <p className="text-slate-500 dark:text-gray-400 mb-6 text-center max-w-md">
              Добавьте первую транзакцию или загрузите демо-данные
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                <Plus className="w-5 h-5" />
                Добавить транзакцию
              </button>
              <button
                onClick={store.seedDemoData}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border-2 border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 rounded-xl font-semibold hover:bg-indigo-50 dark:hover:bg-gray-700 transition-all"
              >
                <Database className="w-5 h-5" />
                Загрузить демо
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-5 sm:mb-6">
              <StatCards
                totalIncome={store.stats.totalIncome}
                totalExpense={store.stats.totalExpense}
                balance={store.stats.balance}
                totalBalance={store.totalBalance}
                transactionCount={store.stats.transactionCount}
              />
            </div>

            <div className="flex items-center gap-2 mb-5 sm:mb-6">
              <button
                onClick={store.seedDemoData}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
              >
                <Database className="w-3.5 h-3.5" />
                Перегенерить демо
              </button>
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Очистить всё
              </button>
            </div>

            {activeTab === 'dashboard' && (
              <div className="space-y-5 sm:space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
                  <IncomeExpenseChart data={store.dailyAggregates} />
                  <BalanceChart data={store.dailyAggregates} />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
                  <CategoryBreakdown data={store.categoryAggregates.expenses} title="📊 Топ расходов" />
                  <CategoryBreakdown data={store.categoryAggregates.income} title="💰 Доходы" />
                </div>
                <TransactionList
                  transactions={store.transactions.slice(0, 15)}
                  getCategoryById={store.getCategoryById}
                  onDelete={store.deleteTransaction}
                />
              </div>
            )}

            {activeTab === 'history' && (
              <TransactionList
                transactions={store.transactions}
                getCategoryById={store.getCategoryById}
                onDelete={store.deleteTransaction}
              />
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
          </>
        )}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-t border-slate-200/60 dark:border-gray-700/60 z-40">
        <div className="flex items-center justify-around py-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-all',
                activeTab === tab.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-gray-500'
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
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-300 dark:shadow-indigo-900 -mt-5">
              <Plus className="w-5 h-5 text-white" />
            </div>
          </button>
        </div>
      </nav>

      {/* Desktop Tab Switcher */}
      {!isEmpty && (
        <div className="hidden sm:flex fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-lg shadow-slate-200/50 dark:shadow-gray-900/50 border border-slate-200/60 dark:border-gray-700/60 p-1.5 gap-1 z-40">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-indigo-500 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900'
                  : 'text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200 hover:bg-slate-50 dark:hover:bg-gray-700'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <AddTransaction
          categories={store.categories}
          onAdd={store.addTransaction}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Clear Confirm Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowClearConfirm(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-gray-100 text-center mb-2">Удалить все данные?</h3>
            <p className="text-sm text-slate-500 dark:text-gray-400 text-center mb-6">
              Все транзакции будут безвозвратно удалены.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 rounded-xl font-semibold text-sm hover:bg-slate-200 dark:hover:bg-gray-600 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={() => { store.clearAllData(); setShowClearConfirm(false); }}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl font-semibold text-sm hover:bg-red-600 transition-colors"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
