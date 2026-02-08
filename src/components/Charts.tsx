import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
  Legend,
} from 'recharts';
import { DailyAggregate, CategoryAggregate } from '../types';
import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useTheme } from '../hooks/useTheme';

function formatMoney(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}М`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}К`;
  return n.toString();
}

function formatMoneyFull(n: number): string {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(n);
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: ChartTooltipProps) {
  const { isDark } = useTheme();
  if (!active || !payload) return null;
  return (
    <div className={`${isDark ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-slate-100'} backdrop-blur-sm rounded-xl p-3 shadow-lg border text-sm`}>
      <p className={`font-medium ${isDark ? 'text-gray-200' : 'text-slate-700'} mb-1`}>
        {label && format(parseISO(label), 'd MMM', { locale: ru })}
      </p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }} className="font-semibold">
          {entry.name}: {formatMoneyFull(entry.value)}
        </p>
      ))}
    </div>
  );
}

interface IncomeExpenseChartProps {
  data: DailyAggregate[];
}

export function IncomeExpenseChart({ data }: IncomeExpenseChartProps) {
  const { isDark } = useTheme();
  const gridColor = isDark ? '#374151' : '#f1f5f9';
  const tickColor = isDark ? '#9ca3af' : '#94a3b8';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 border border-slate-100 dark:border-gray-700 shadow-sm">
      <h3 className="text-base font-semibold text-slate-800 dark:text-gray-100 mb-4">Доходы и расходы</h3>
      <div className="h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey="date"
              tickFormatter={(v: string) => format(parseISO(v), 'd.MM')}
              tick={{ fontSize: 11, fill: tickColor }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatMoney}
              tick={{ fontSize: 11, fill: tickColor }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} fill="url(#incomeGradient)" name="Доходы" />
            <Area type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2} fill="url(#expenseGradient)" name="Расходы" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

interface BalanceChartProps {
  data: DailyAggregate[];
}

export function BalanceChart({ data }: BalanceChartProps) {
  const { isDark } = useTheme();
  const gridColor = isDark ? '#374151' : '#f1f5f9';
  const tickColor = isDark ? '#9ca3af' : '#94a3b8';

  const cumulativeData = data.reduce<Array<{ date: string; balance: number }>>((acc, d) => {
    const prev = acc.length > 0 ? acc[acc.length - 1].balance : 0;
    acc.push({ date: d.date, balance: prev + d.balance });
    return acc;
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 border border-slate-100 dark:border-gray-700 shadow-sm">
      <h3 className="text-base font-semibold text-slate-800 dark:text-gray-100 mb-4">Динамика баланса</h3>
      <div className="h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={cumulativeData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey="date"
              tickFormatter={(v: string) => format(parseISO(v), 'd.MM')}
              tick={{ fontSize: 11, fill: tickColor }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatMoney}
              tick={{ fontSize: 11, fill: tickColor }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="balance" stroke="#6366f1" strokeWidth={2.5} fill="url(#balanceGradient)" name="Баланс" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

interface CategoryPieChartProps {
  data: CategoryAggregate[];
  title: string;
}

export function CategoryPieChart({ data, title }: CategoryPieChartProps) {
  const { isDark } = useTheme();

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 border border-slate-100 dark:border-gray-700 shadow-sm flex flex-col items-center justify-center h-80">
        <p className="text-slate-400 dark:text-gray-500">Нет данных</p>
      </div>
    );
  }

  const chartData = data.map(d => ({
    name: `${d.icon} ${d.categoryName}`,
    value: d.total,
    color: d.color,
  }));

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 border border-slate-100 dark:border-gray-700 shadow-sm">
      <h3 className="text-base font-semibold text-slate-800 dark:text-gray-100 mb-4">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => formatMoneyFull(Number(value))}
              contentStyle={{
                borderRadius: '12px',
                border: isDark ? '1px solid #374151' : '1px solid #f1f5f9',
                backgroundColor: isDark ? '#1f2937' : '#fff',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                fontSize: '13px',
                color: isDark ? '#e5e7eb' : '#334155',
              }}
            />
            <Legend
              formatter={(value: string) => (
                <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>{value}</span>
              )}
              wrapperStyle={{ fontSize: '12px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

interface DailyBarChartProps {
  data: DailyAggregate[];
}

export function DailyBarChart({ data }: DailyBarChartProps) {
  const { isDark } = useTheme();
  const gridColor = isDark ? '#374151' : '#f1f5f9';
  const tickColor = isDark ? '#9ca3af' : '#94a3b8';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 border border-slate-100 dark:border-gray-700 shadow-sm">
      <h3 className="text-base font-semibold text-slate-800 dark:text-gray-100 mb-4">Расходы по дням</h3>
      <div className="h-64 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey="date"
              tickFormatter={(v: string) => format(parseISO(v), 'd.MM')}
              tick={{ fontSize: 11, fill: tickColor }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={formatMoney}
              tick={{ fontSize: 11, fill: tickColor }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="expense" fill="#f87171" radius={[4, 4, 0, 0]} name="Расходы" />
            <Bar dataKey="income" fill="#34d399" radius={[4, 4, 0, 0]} name="Доходы" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
