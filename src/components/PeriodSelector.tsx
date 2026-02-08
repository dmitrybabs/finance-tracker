import { Period } from '../types';
import { cn } from '../utils/cn';

interface PeriodSelectorProps {
  selected: Period;
  onChange: (p: Period) => void;
}

const periods: { value: Period; label: string }[] = [
  { value: 'day', label: 'Д' },
  { value: 'week', label: 'Н' },
  { value: 'month', label: 'М' },
  { value: 'year', label: 'Г' },
  { value: 'all', label: 'Всё' },
];

export function PeriodSelector({ selected, onChange }: PeriodSelectorProps) {
  return (
    <div className="inline-flex bg-slate-100 dark:bg-gray-700 rounded-xl p-1 gap-0.5">
      {periods.map(p => (
        <button
          key={p.value}
          onClick={() => onChange(p.value)}
          className={cn(
            'px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all',
            selected === p.value
              ? 'bg-white dark:bg-gray-600 text-slate-800 dark:text-gray-100 shadow-sm'
              : 'text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200'
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
