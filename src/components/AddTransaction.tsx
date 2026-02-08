import { useState } from 'react';
import { TransactionType, Category } from '../types';
import { Plus, Minus, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../utils/cn';

interface AddTransactionProps {
  categories: Category[];
  onAdd: (amount: number, type: TransactionType, categoryId: string, description: string, date?: string) => void;
  onClose: () => void;
}

export function AddTransaction({ categories, onAdd, onClose }: AddTransactionProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [quickInput, setQuickInput] = useState('');

  const filteredCategories = categories.filter(c => c.type === type);

  const handleQuickInput = () => {
    if (!quickInput.trim()) return;
    const match = quickInput.match(/^([+-]?\d+[\d\s]*)\s+(.+)$/);
    if (match) {
      const rawAmount = match[1].replace(/\s/g, '');
      const num = parseInt(rawAmount);
      const desc = match[2].trim();
      const txType: TransactionType = num < 0 || rawAmount.startsWith('-') ? 'expense' : 'income';

      const descLower = desc.toLowerCase();
      const autoCategory = categories.find(c => {
        const nameLower = c.name.toLowerCase();
        return c.type === txType && (descLower.includes(nameLower) || nameLower.includes(descLower));
      });

      const catId = autoCategory?.id || (txType === 'expense' ? 'other_expense' : 'other_income');
      onAdd(Math.abs(num), txType, catId, desc, date);
      setQuickInput('');
      onClose();
    }
  };

  const handleSubmit = () => {
    const num = parseInt(amount);
    if (!num || !categoryId) return;
    onAdd(num, type, categoryId, description || categories.find(c => c.id === categoryId)?.name || '', date);
    setAmount('');
    setCategoryId('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-slate-800 dark:text-gray-100">Новая операция</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
              <X className="w-5 h-5 text-slate-500 dark:text-gray-400" />
            </button>
          </div>

          <div className="mb-5 p-3 bg-slate-50 dark:bg-gray-900/50 rounded-xl">
            <label className="text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">Быстрый ввод</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={quickInput}
                onChange={e => setQuickInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleQuickInput()}
                placeholder="+5000 зарплата или -400 продукты"
                className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-800 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-600 placeholder:text-slate-400 dark:placeholder:text-gray-500"
              />
              <button
                onClick={handleQuickInput}
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600 transition-colors"
              >
                OK
              </button>
            </div>
            <p className="text-xs text-slate-400 dark:text-gray-500 mt-1.5">Формат: сумма описание</p>
          </div>

          <div className="relative flex items-center justify-center mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-gray-700" />
            </div>
            <span className="relative bg-white dark:bg-gray-800 px-3 text-xs font-medium text-slate-400 dark:text-gray-500 uppercase">или вручную</span>
          </div>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => { setType('expense'); setCategoryId(''); }}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all',
                type === 'expense'
                  ? 'bg-red-500 text-white shadow-lg shadow-red-200 dark:shadow-red-900/50'
                  : 'bg-slate-100 dark:bg-gray-700 text-slate-500 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-gray-600'
              )}
            >
              <Minus className="w-4 h-4" />
              Расход
            </button>
            <button
              onClick={() => { setType('income'); setCategoryId(''); }}
              className={cn(
                'flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all',
                type === 'income'
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-emerald-900/50'
                  : 'bg-slate-100 dark:bg-gray-700 text-slate-500 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-gray-600'
              )}
            >
              <Plus className="w-4 h-4" />
              Доход
            </button>
          </div>

          <div className="mb-4">
            <label className="text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">Сумма, ₽</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-2xl font-bold text-center text-slate-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-600 placeholder:text-slate-300 dark:placeholder:text-gray-600"
            />
          </div>

          <div className="mb-4">
            <label className="text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-2 block">Категория</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {filteredCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryId(cat.id)}
                  className={cn(
                    'flex flex-col items-center gap-1 p-2.5 rounded-xl text-xs transition-all border',
                    categoryId === cat.id
                      ? 'border-indigo-400 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 shadow-sm'
                      : 'border-slate-100 dark:border-gray-700 hover:border-slate-200 dark:hover:border-gray-600 hover:bg-slate-50 dark:hover:bg-gray-700 text-slate-600 dark:text-gray-400'
                  )}
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span className="font-medium truncate w-full text-center">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">Описание</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Необязательно"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-slate-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-600 placeholder:text-slate-400 dark:placeholder:text-gray-500"
            />
          </div>

          <div className="mb-5">
            <label className="text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-1.5 block">Дата</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-slate-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-600"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!amount || !categoryId}
            className={cn(
              'w-full py-3 rounded-xl text-sm font-bold transition-all',
              amount && categoryId
                ? type === 'expense'
                  ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-200 dark:shadow-red-900/50'
                  : 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-200 dark:shadow-emerald-900/50'
                : 'bg-slate-100 dark:bg-gray-700 text-slate-400 dark:text-gray-500 cursor-not-allowed'
            )}
          >
            {type === 'expense' ? 'Добавить расход' : 'Добавить доход'}
          </button>
        </div>
      </div>
    </div>
  );
}
