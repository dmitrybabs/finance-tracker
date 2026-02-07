import { Period } from '../types';
import { cn } from '../utils/cn';

interface PeriodSelectorProps {
  selected: Period;
  onChange: (p: Period) => void;
}

const periods: { value: Period; label: string }[] = [
  { value: 'day', label: 'День' },
  { value: 'week', label: 'Неделя' },
  { value: 'month', label: 'Месяц' },
  { value: 'year', label: 'Год' },
  { value: 'all', label: 'Всё' },
];

export function PeriodSelector({ selected, onChange }: PeriodSelectorProps) {
  return (
    <div className="inline-flex bg-slate-100 rounded-xl p-1 gap-0.5">
      {periods.map(p => (
        <button
          key={p.value}
          onClick={() => onChange(p.value)}
          className={cn(
            'px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all',
            selected === p.value
              ? 'bg-white text-slate-800 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
