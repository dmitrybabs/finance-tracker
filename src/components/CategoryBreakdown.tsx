import { CategoryAggregate } from '../types';

function formatMoney(n: number): string {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(n);
}

interface CategoryBreakdownProps {
  data: CategoryAggregate[];
  title: string;
}

export function CategoryBreakdown({ data, title }: CategoryBreakdownProps) {
  if (data.length === 0) return null;

  const total = data.reduce((s, d) => s + d.total, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-5 border border-slate-100 dark:border-gray-700 shadow-sm">
      <h3 className="text-base font-semibold text-slate-800 dark:text-gray-100 mb-3">{title}</h3>
      <div className="space-y-3">
        {data.map(cat => (
          <div key={cat.categoryId}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-base">{cat.icon}</span>
                <span className="text-sm font-medium text-slate-700 dark:text-gray-300">{cat.categoryName}</span>
                <span className="text-xs text-slate-400 dark:text-gray-500">{cat.count} оп.</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-slate-800 dark:text-gray-100">{formatMoney(cat.total)} ₽</span>
                <span className="text-xs text-slate-400 dark:text-gray-500 ml-1.5">{cat.percentage.toFixed(1)}%</span>
              </div>
            </div>
            <div className="h-2 bg-slate-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${total > 0 ? (cat.total / total) * 100 : 0}%`,
                  backgroundColor: cat.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
