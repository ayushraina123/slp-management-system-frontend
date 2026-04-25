import { useEffect, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, HandCoins, Users } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from 'recharts';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '../components/ui/chart';
import { fetchDashboardSummary } from '../lib/api';
import { toErrorMessage } from '../lib/errors';
import { formatCurrency, formatDate, titleize } from '../lib/format';
import type { DashboardBreakdownDto, DashboardSummaryDto } from '../types';

interface ChartSlice {
  key: string;
  label: string;
  value: number;
  fill: string;
}

const initialState: DashboardSummaryDto = {
  balance: 0,
  devoteeCount: 0,
  donationCount: 0,
  expenseCount: 0,
  totalDonations: 0,
  totalExpenses: 0,
  recentDonations: [],
  recentExpenses: [],
  donationBreakdown: [],
  expenseBreakdown: [],
  monthlyTrend: [],
};

const donationPalette = ['#d97706', '#2563eb', '#059669', '#dc2626'];
const expensePalette = ['#d97706', '#2563eb', '#059669', '#dc2626', '#7c3aed', '#0f766e'];

function toChartSlices(items: DashboardBreakdownDto[], palette: string[]) {
  return items.map((item, index) => ({
    key: item.key,
    label: titleize(item.key),
    value: Number(item.value || 0),
    fill: palette[index % palette.length],
  }));
}

function buildPieConfig(items: ChartSlice[]) {
  return items.reduce<Record<string, { label: string; color: string }>>((accumulator, item) => {
    accumulator[item.key] = {
      label: item.label,
      color: item.fill,
    };
    return accumulator;
  }, {});
}

function PieSection({
  title,
  subtitle,
  data,
}: {
  title: string;
  subtitle: string;
  data: ChartSlice[];
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const config = buildPieConfig(data);

  return (
    <section className="rounded-[1.75rem] border border-stone-800 bg-stone-950 p-6 text-stone-100 shadow-xl shadow-stone-200/40">
      <h2 className="text-2xl font-semibold text-stone-50">{title}</h2>
      <p className="text-sm text-stone-400">{subtitle}</p>

      {data.length > 0 ? (
        <>
          <ChartContainer config={config} className="mt-6 h-[280px] w-full">
            <PieChart>
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value, name) => (
                      <div className="flex min-w-[11rem] items-center justify-between gap-4">
                        <span className="text-stone-600">{String(name)}</span>
                        <span className="font-semibold text-stone-900">
                          {formatCurrency(Number(value || 0))}
                        </span>
                      </div>
                    )}
                  />
                }
              />
              <Pie
                data={data}
                dataKey="value"
                nameKey="key"
                cx="50%"
                cy="50%"
                outerRadius={88}
                innerRadius={0}
                paddingAngle={1}
                stroke="#f5f5f4"
                strokeWidth={2}
              >
                {data.map((entry) => (
                  <Cell key={entry.key} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>

          <div className="mt-4 space-y-3">
            {data.map((item) => {
              const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
              return (
                <div key={item.key} className="flex items-center justify-between gap-4 text-sm">
                  <div className="flex items-center gap-3 text-stone-300">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
                    <span>
                      {item.label} ({percentage}%)
                    </span>
                  </div>
                  <span className="font-semibold text-stone-50">{formatCurrency(item.value)}</span>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <p className="mt-6 rounded-2xl bg-stone-900 px-4 py-5 text-sm text-stone-400">
          No data available.
        </p>
      )}
    </section>
  );
}

export function Dashboard() {
  const [data, setData] = useState(initialState);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      setIsLoading(true);
      setError('');
      try {
        setData(await fetchDashboardSummary());
      } catch (err) {
        setError(toErrorMessage(err, 'Failed to load dashboard'));
      } finally {
        setIsLoading(false);
      }
    }

    void loadDashboard();
  }, []);

  const donationBreakdown = toChartSlices(data.donationBreakdown, donationPalette);
  const expenseBreakdown = toChartSlices(data.expenseBreakdown, expensePalette);
  const monthlyTrend = data.monthlyTrend;

  const monthlyTrendConfig = {
    donations: { label: 'Donations', color: '#59f1c1' },
    expenses: { label: 'Expenses', color: '#ef4444' },
  };

  const cards = [
    {
      label: 'Total Donations',
      value: formatCurrency(data.totalDonations),
      note: `${data.donationCount} donation records`,
      icon: ArrowUpRight,
      noteTone: 'text-emerald-400',
      iconTone: 'bg-emerald-950 text-emerald-400',
    },
    {
      label: 'Total Expenses',
      value: formatCurrency(data.totalExpenses),
      note: `${data.expenseCount} expense records`,
      icon: ArrowDownRight,
      noteTone: 'text-rose-400',
      iconTone: 'bg-rose-950 text-rose-400',
    },
    {
      label: 'Current Balance',
      value: formatCurrency(data.balance),
      note: 'Live balance from backend',
      icon: HandCoins,
      noteTone: 'text-sky-400',
      iconTone: 'bg-sky-950 text-sky-400',
    },
    {
      label: 'Total Devotees',
      value: String(data.devoteeCount),
      note: 'Registered devotee profiles',
      icon: Users,
      noteTone: 'text-orange-400',
      iconTone: 'bg-orange-950 text-orange-400',
    },
  ];

  return (
    <div className="p-5 sm:p-8">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.3em] text-orange-500">Overview</p>
        <h1 className="mt-3 text-3xl font-semibold text-stone-900">Dashboard</h1>
        <p className="mt-2 text-sm text-stone-500">
          Snapshot of trust operations across devotees, donations, expenses, and balance.
        </p>
      </div>

      {error ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-[1.75rem] border border-stone-800 bg-stone-950 p-7 text-stone-100 shadow-xl shadow-stone-200/40"
            >
              <div className={`inline-flex rounded-2xl p-4 ${card.iconTone}`}>
                <Icon className="h-6 w-6" strokeWidth={2.4} />
              </div>
              <p className="mt-6 text-lg font-medium text-stone-300">{card.label}</p>
              <p className="mt-3 text-4xl font-semibold tracking-tight text-white">
                {isLoading ? '...' : card.value}
              </p>
              <p className={`mt-3 text-sm font-medium ${card.noteTone}`}>{card.note}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-stone-900">Recent donations</h2>
          <p className="text-sm text-stone-500">Latest contribution activity</p>
          <div className="mt-6 space-y-4">
            {data.recentDonations.length === 0 && !isLoading ? (
              <p className="rounded-2xl bg-stone-50 px-4 py-5 text-sm text-stone-500">
                No donations available.
              </p>
            ) : null}

            {data.recentDonations.map((donation) => (
              <div
                key={donation.id}
                className="flex items-center justify-between rounded-2xl bg-stone-50 px-4 py-4"
              >
                <div>
                  <p className="font-medium text-stone-900">{donation.devoteeName}</p>
                  <p className="text-sm text-stone-500">
                    {titleize(donation.donationType)} · {donation.receiptNumber}
                  </p>
                  <p className="mt-1 text-xs text-stone-400">{formatDate(donation.createdOn)}</p>
                </div>
                <p className="font-semibold text-emerald-600">
                  {formatCurrency(Number(donation.amount || 0))}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[1.75rem] border border-stone-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-stone-900">Recent expenses</h2>
          <p className="text-sm text-stone-500">Latest outgoing fund entries</p>
          <div className="mt-6 space-y-4">
            {data.recentExpenses.length === 0 && !isLoading ? (
              <p className="rounded-2xl bg-stone-50 px-4 py-5 text-sm text-stone-500">
                No expenses available.
              </p>
            ) : null}

            {data.recentExpenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between rounded-2xl bg-stone-50 px-4 py-4"
              >
                <div>
                  <p className="font-medium text-stone-900">{expense.name}</p>
                  <p className="text-sm text-stone-500">{titleize(expense.expenseType)}</p>
                  <p className="mt-1 text-xs text-stone-400">{formatDate(expense.createdOn)}</p>
                </div>
                <p className="font-semibold text-rose-600">
                  {formatCurrency(Number(expense.amount || 0))}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <PieSection
          title="Expenses by Category"
          subtitle="Expense distribution across current categories"
          data={expenseBreakdown}
        />
        <PieSection
          title="Donations by Type"
          subtitle="Contribution distribution by donation mode"
          data={donationBreakdown}
        />
      </div>

      <section className="mt-8 rounded-[1.75rem] border border-stone-800 bg-stone-950 p-6 text-stone-100 shadow-xl shadow-stone-200/40">
        <h2 className="text-2xl font-semibold text-stone-50">Monthly Trend (Last 6 Months)</h2>
        <p className="text-sm text-stone-400">Month-to-month donations and expenses</p>

        <ChartContainer config={monthlyTrendConfig} className="mt-6 h-[360px] w-full">
          <BarChart data={monthlyTrend} margin={{ top: 8, right: 12, left: 8, bottom: 8 }}>
            <CartesianGrid vertical={true} stroke="#3f3f46" strokeDasharray="4 4" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tick={{ fill: '#d6d3d1', fontSize: 14 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tick={{ fill: '#d6d3d1', fontSize: 14 }}
              tickFormatter={(value) => String(value)}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => (
                    <div className="flex min-w-[11rem] items-center justify-between gap-4">
                      <span className="text-stone-600">{String(name)}</span>
                      <span className="font-semibold text-stone-900">
                        {formatCurrency(Number(value || 0))}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent className="pt-6 text-sm text-stone-200" />} />
            <Bar dataKey="donations" fill="var(--color-donations)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" fill="var(--color-expenses)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </section>
    </div>
  );
}
